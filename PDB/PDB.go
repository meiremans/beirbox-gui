package PDB

import (
	"context"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/ambientsound/rex/pkg/library"
	"github.com/ambientsound/rex/pkg/mediascanner"
	"github.com/ambientsound/rex/pkg/rekordbox/color"
	"github.com/ambientsound/rex/pkg/rekordbox/column"
	"github.com/ambientsound/rex/pkg/rekordbox/dbengine"
	"github.com/ambientsound/rex/pkg/rekordbox/page"
	"github.com/ambientsound/rex/pkg/rekordbox/pdb"
	"github.com/ambientsound/rex/pkg/rekordbox/unknown17"
	"github.com/ambientsound/rex/pkg/rekordbox/unknown18"
)

func ptrToNow() *time.Time {
	now := time.Now()
	return &now
}

func PDB(musicFolderOnUSB string, musicFolderOnDisk string) error {
	var err error

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	lib := library.New()

	// Initialize options
	basedir := flag.String("root", "./", "Root path of USB drive")
	trackDir := flag.String("trackdir", musicFolderOnUSB, "Where on the USB drive to put exported files, relative to root path")
	forceOverwrite := flag.Bool("f", false, "Overwrite export file if it exists")
	flag.Parse()

	*basedir, err = filepath.Abs(*basedir)
	if err != nil {
		return err
	}

	// Create output directories
	outputPath := filepath.Join(*basedir, "PIONEER", "rekordbox")
	err = os.MkdirAll(outputPath, 0755)
	if err != nil {
		return err
	}
	*trackDir = filepath.Join(*basedir, *trackDir)
	*trackDir, err = filepath.Abs(*trackDir)
	if err != nil {
		return err
	}
	err = os.MkdirAll(*trackDir, 0755)
	if err != nil {
		return err
	}

	// Open output file for writing
	outputFile := filepath.Join(outputPath, "export.pdb")
	outputFile, err = filepath.Abs(outputFile)
	if err != nil {
		return err
	}
	var flags = os.O_CREATE | os.O_RDWR
	if *forceOverwrite {
		flags |= os.O_TRUNC
	}
	out, err := os.OpenFile(outputFile, flags, 0644)
	if err != nil {
		return err
	}
	defer out.Close()
	fmt.Printf("PIONEER database created: %s\n", outputFile)
	filePath := filepath.Join(musicFolderOnDisk, "testsong.mp3")
	// Use os.Stat to get the file information
	fileInfo, err := os.Stat(filePath)

	// Get the file size in bytes
	fileSize := fileInfo.Size()

	myTrack := &library.Track{
		Path:        filePath,
		Bitrate:     320,   // FIXME
		Tempo:       128,   // FIXME
		SampleDepth: 16,    // FIXME
		SampleRate:  44100, // FIXME
		DiscNumber:  0,     // FIXME
		Isrc:        "",    // FIXME
		FileSize:    int(fileSize),
		TrackNumber: 1,
		ReleaseDate: ptrToNow(),
		AddedDate:   ptrToNow(),
		Artist:      "fluitenden beir",
		Album:       "pompen",
		Duration:    time.Duration(13 * time.Second),
		Title:       "zingenden das",
		FileType:    "mp3",
	}

	lib.InsertTrack(myTrack)

	fmt.Printf("Tracks marked for export: %6d used/%6d total\n", len(lib.Tracks().All()), 1)
	fmt.Printf("Copying or encoding tracks to %s\n", *trackDir)

	for i, t := range lib.Tracks().All() {
		fmt.Printf("\r[%6d/%6d] ", i+1, len(lib.Tracks().All()))
		result, err := mediascanner.RenderTo(ctx, t, *trackDir)
		if err != nil {
			fmt.Printf("\n")
			return fmt.Errorf("render %q: %w\n", t.OutputPath, err)
		}
		fmt.Printf("\033[2K\r[%6d/%6d] %s %s", i+1, len(lib.Tracks().All()), result.Action, t.OutputPath)
	}

	fmt.Printf("\033[2K\r")
	fmt.Printf("All tracks copied to destination\n")
	fmt.Printf("Writing PDB file...\n")

	// Intermediary type for storing "INSERT statements"
	type Insert struct {
		Type page.Type
		Row  page.Row
	}
	inserts := make([]Insert, 0)

	// Create PDB data types for tracks, artists, albums and playlists.
	tracks := lib.Tracks().All()
	for i := range tracks {
		pdbtrack := mediascanner.PdbTrack(lib, tracks[i], *basedir)
		pdbtrack.FilePath = fmt.Sprintf("/%s/testsong.mp3", musicFolderOnUSB) //yeah lets force unix style.
		inserts = append(inserts, Insert{
			Type: page.Type_Tracks,
			Row:  &pdbtrack,
		})
	}

	artists := lib.Artists().All()
	for i := range artists {
		pdbartist := mediascanner.PdbArtist(lib, artists[i])
		inserts = append(inserts, Insert{
			Type: page.Type_Artists,
			Row:  &pdbartist,
		})
	}

	albums := lib.Albums().All()
	for i := range albums {
		pdbalbum := mediascanner.PdbAlbum(lib, albums[i])
		inserts = append(inserts, Insert{
			Type: page.Type_Albums,
			Row:  &pdbalbum,
		})
	}

	for _, uk := range unknown17.InitialDataset {
		inserts = append(inserts, Insert{
			Type: page.Type_Unknown17,
			Row:  uk,
		})
	}

	for _, uk := range unknown18.InitialDataset {
		inserts = append(inserts, Insert{
			Type: page.Type_Unknown18,
			Row:  uk,
		})
	}

	for _, uk := range color.InitialDataset {
		inserts = append(inserts, Insert{
			Type: page.Type_Colors,
			Row:  uk,
		})
	}

	for _, uk := range column.InitialDataset {
		inserts = append(inserts, Insert{
			Type: page.Type_Columns,
			Row:  uk,
		})
	}

	// Initialize the database.
	db := dbengine.New(out)

	// Create all tables found in a typical rekordbox export.
	for _, pageType := range pdb.TableOrder {
		err = db.CreateTable(pageType)
		if err != nil {
			panic(err)
		}
	}

	// Generate data pages with the inserts generated earlier.
	// When a data page is full, it is inserted into the db.
	// This is a quick and dirty way for export ONLY,
	// it will not work to modify existing databases.
	dataPages := make(map[page.Type]*page.Data)
	for _, insert := range inserts {
		if dataPages[insert.Type] == nil {
			dataPages[insert.Type] = page.NewPage(insert.Type)
		}
		err = dataPages[insert.Type].Insert(insert.Row)
		if err == nil {
			continue
		}
		if err == io.ErrShortWrite {
			err = db.InsertPage(dataPages[insert.Type])
			if err != nil {
				panic(err)
			}
			dataPages[insert.Type] = nil
			continue
		}
		panic(err)
	}

	// Insert the remainding pages.
	for _, pg := range dataPages {
		if pg == nil {
			continue
		}
		err = db.InsertPage(pg)
		if err != nil {
			panic(err)
		}
	}

	// Flush buffers and exit program.
	err = out.Close()
	if err == nil {
		fmt.Printf("Finished successfully.\n")
	}

	return nil
}
