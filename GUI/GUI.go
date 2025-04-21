package GUI

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"strings"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
	"github.com/meiremans/beirbox-GUI/ANLZ"
	"github.com/meiremans/beirbox-GUI/PDB"
)

// Track holds information about a music track
type Track struct {
	Artist     string `json:"artist"`
	Album      string `json:"album"`
	BPM        int    `json:"bpm"`
	TrackName  string `json:"track_name"`
	AlbumCover string `json:"album_cover"`

	labels  map[string]*widget.Label
	iDEntry *widget.Entry
	image   *canvas.Image
}

type USBSelector struct {
	Selected string
	Label    *widget.Label
	Select   *widget.Select
}

func NewUSBSelector() *USBSelector {
	drives := getUSBDrives()
	label := widget.NewLabel("Selected USB: none")
	selector := &USBSelector{
		Label: label,
	}

	// Initialize Select widget
	selectWidget := widget.NewSelect(drives, func(val string) {
		selector.Selected = val
		selector.Label.SetText("Selected USB: " + val)
	})
	selectWidget.PlaceHolder = "Choose USB"
	selector.Select = selectWidget

	return selector
}

func (u *USBSelector) Render() fyne.CanvasObject {
	return container.NewVBox(u.Select, u.Label)
}

func getUSBDrives() []string {
	out, err := exec.Command("wmic", "logicaldisk", "where", "drivetype=2", "get", "deviceid").Output()
	if err != nil {
		return []string{"Error listing USBs"}
	}

	lines := strings.Split(string(out), "\n")
	var drives []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "DeviceID") || trimmed == "" {
			continue
		}
		drives = append(drives, trimmed)
	}

	if len(drives) == 0 {
		return []string{"No USB drives found"}
	}

	return drives
}

// NewTrack returns a new Track app
func NewTrack() *Track {
	rand.Seed(time.Now().UnixNano())
	return &Track{
		labels: make(map[string]*widget.Label),
	}
}

func export(selectedUSB string, window fyne.Window) {

	usbPath := selectedUSB // e.g., "E:\\"
	if usbPath != "" {
		err := copyDir("music", filepath.Join(usbPath, "music"))
		if err != nil {
			fmt.Println("Error copying music:", err)
		}
		ANLZ.ANLZ()
		PDB.PDB()

		err = copyDir("PIONEER", filepath.Join(usbPath, "PIONEER"))
		if err != nil {
			fmt.Println("Error copying PIONEER:", err)
		}
	} else {
		dialog.ShowInformation("No USB Selected", "Please select a USB drive first.", window)
	}

}
func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}

		destPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(destPath, info.Mode())
		}

		// It's a file — copy it
		return copyFile(path, destPath)
	})
}

func copyFile(srcFile, dstFile string) error {
	src, err := os.Open(srcFile)
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(dstFile)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	if err != nil {
		return err
	}

	return nil
}

// UpdateTrackInfo will update the UI with track details
func (t *Track) UpdateTrackInfo() {
	t.labels["artist"].SetText(fmt.Sprintf("Artist: %s", t.Artist))
	t.labels["album"].SetText(fmt.Sprintf("Album: %s", t.Album))
	t.labels["bpm"].SetText(fmt.Sprintf("BPM: %d", t.BPM))
	t.labels["track_name"].SetText(fmt.Sprintf("Track: %s", t.TrackName))

	if t.AlbumCover != "" {
		t.downloadImage(t.AlbumCover)
	}
}

// downloadImage fetches the album cover image
func (t *Track) downloadImage(url string) {
	response, e := http.Get(url)
	if e != nil {
		log.Fatal(e)
	}
	defer response.Body.Close()

	file, err := ioutil.TempFile(os.TempDir(), "album_cover.png")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	_, err = io.Copy(file, response.Body)
	if err != nil {
		log.Fatal(err)
	}

	t.image.File = file.Name()
	canvas.Refresh(t.image)
}

// NewForm generates a new Track form
func (t *Track) NewForm(w fyne.Window) fyne.Widget {
	form := &widget.Form{}
	tt := reflect.TypeOf(t).Elem()
	for i := 0; i < tt.NumField(); i++ {
		fld := tt.Field(i)
		tag := fld.Tag.Get("json")
		switch tag {
		case "": // not a display field
		case "album_cover": // special field for album cover image
			// we created this in the setup
		case "bpm": // special field for BPM
			// Create labels for the track information
			form.Append(fld.Name, t.newLabel(tag))
		default:
			form.Append(fld.Name, t.newLabel(tag))
		}
	}
	return form
}

func (t *Track) newLabel(name string) *widget.Label {
	w := widget.NewLabel("")
	t.labels[name] = w
	return w
}

// Show starts a new Track widget
func Show(win fyne.Window) fyne.CanvasObject {
	t := NewTrack()
	t.image = &canvas.Image{FillMode: canvas.ImageFillOriginal}

	form := t.NewForm(win)
	usb := NewUSBSelector() // <- new USB selector

	export := widget.NewButton("export", func() {
		export(usb.Selected, win)
		fmt.Println("Export to USB:", usb.Selected)
	})

	submit := widget.NewButton("Submit", func() {
		t.UpdateTrackInfo()
	})
	submit.Importance = widget.HighImportance

	buttons := container.NewHBox(
		layout.NewSpacer(),
		widget.NewButton("Random", func() {
			t.UpdateTrackInfo()
		}),
		submit,
		export,
	)

	go func() {
		t.UpdateTrackInfo()
	}()

	// Compose layout
	return container.NewBorder(
		form,
		container.NewVBox(buttons, usb.Render()),
		nil,
		nil,
		t.image,
	)
}
