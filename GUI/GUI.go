package track

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"reflect"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
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

// NewTrack returns a new Track app
func NewTrack() *Track {
	rand.Seed(time.Now().UnixNano())
	return &Track{
		labels: make(map[string]*widget.Label),
	}
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

	// Initialize image before generating form
	t.image = &canvas.Image{FillMode: canvas.ImageFillOriginal}

	form := t.NewForm(win)

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
	)

	// Optional: load a track at startup
	go func() {
		t.UpdateTrackInfo()
	}()

	return container.NewBorder(form, buttons, nil, nil, t.image)
}
