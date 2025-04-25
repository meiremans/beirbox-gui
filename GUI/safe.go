package GUI

import (
	"fmt"
	"log"
	"os"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

// SafeWrap runs fn(), recovers panics, and swaps in a crash screen on w.
func SafeWrap(w fyne.Window, fn func()) {
	defer func() {
		if r := recover(); r != nil {
			log.Println(">>> Panic caught in callback:", r)
			showCrashScreen(w, r)
		}
	}()
	fn()
}

func showCrashScreen(w fyne.Window, panicVal interface{}) {
	imgPath := "static/gopherdomme.png"
	var img fyne.CanvasObject
	if _, err := os.Stat(imgPath); err == nil {
		image := canvas.NewImageFromFile(imgPath)
		image.FillMode = canvas.ImageFillContain
		image.SetMinSize(fyne.NewSize(400, 300))
		img = image
	} else {
		img = widget.NewLabel("Image not found: " + imgPath)
	}

	crashGrid := container.NewAdaptiveGrid(1,
		widget.NewLabel("😵 Oops! The app crashed."),
		img,
		widget.NewLabel(fmt.Sprintf("Error: %v", panicVal)),
	)

	w.SetContent(container.NewCenter(crashGrid))
	w.Resize(fyne.NewSize(800, 600))
}
