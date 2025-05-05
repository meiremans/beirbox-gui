package filemanipulation

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/bogem/id3v2"
)

func processTempFile(tempPath string, waveform []uint8) error {
	// Isolated processing function ensures tag gets closed
	tag, err := id3v2.Open(tempPath, id3v2.Options{Parse: true})
	if err != nil {
		return err
	}
	defer tag.Close()

	waveformJSON, err := json.Marshal(waveform)
	if err != nil {
		return err
	}

	tag.DeleteFrames("TXXXX")
	tag.AddUserDefinedTextFrame(id3v2.UserDefinedTextFrame{
		Encoding:    id3v2.EncodingUTF8,
		Description: "WAVEFORM",
		Value:       string(waveformJSON),
	})

	return tag.Save()
}

func SaveWaveformToID3(filepathString string, waveform []uint8) error {
	// 1. Generate temp file path in system temp directory
	tempDir := os.TempDir()
	tempFileName := fmt.Sprintf("~temp-%d-%s", time.Now().UnixNano(), filepath.Base(filepathString))
	tempPath := filepath.Join(tempDir, tempFileName)

	// 2. Three-stage process with guaranteed cleanup
	var finalErr error
	defer func() {
		if finalErr != nil {
			if err := os.Remove(tempPath); err != nil {
				log.Printf("Warning: failed to clean up temp file %s: %v", tempPath, err)
			}
		}
	}()

	// Stage 1: Copy to temp file
	if err := copyFileWithRetry(filepathString, tempPath); err != nil {
		finalErr = fmt.Errorf("copy failed: %v", err)
		return finalErr
	}

	// Stage 2: Process temp fileb
	if err := processTempFile(tempPath, waveform); err != nil {
		finalErr = fmt.Errorf("processing failed: %v", err)
		return finalErr
	}

	// Stage 3: Atomic replace
	if err := atomicReplaceWithHandleCheck(tempPath, filepathString); err != nil {
		finalErr = fmt.Errorf("replace failed: %v", err)
		return finalErr
	}

	return nil
}

func SkipID3Tag(r io.ReadSeeker) (io.ReadSeeker, error) {
	// Read the first 10 bytes of the file
	header := make([]byte, 10)
	_, err := r.Read(header)
	if err != nil {
		return nil, err
	}

	// Check if the file starts with an ID3 tag
	if string(header[0:3]) != "ID3" {
		// No ID3 tag, rewind the file to the start and return the reader as is
		r.Seek(0, io.SeekStart)
		return r, nil
	}

	// Extract the size of the ID3 tag (bytes 6 to 9 in the header)
	size := int(header[6]&0x7F)<<21 |
		int(header[7]&0x7F)<<14 |
		int(header[8]&0x7F)<<7 |
		int(header[9]&0x7F)

	// Skip over the ID3 tag by seeking to the position after the tag
	newPos, err := r.Seek(int64(size)+10, io.SeekStart)
	if err != nil {
		return nil, err
	}

	// Log new position (for debugging purposes)
	fmt.Println("Skipped ID3 tag, new position:", newPos)
	return r, nil
}
