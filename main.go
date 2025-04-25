package main

import (
	"fmt"
	"log"
	"os"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"

	"fyne.io/fyne/v2/widget"
	"github.com/meiremans/beirbox-GUI/GUI"
)

func main() {
	a := app.New()
	w := a.NewWindow("beirbox")

	defer func() {
		if r := recover(); r != nil {
			log.Println(">>> Panic caught:", r)

			imgPath := "static/gopherdomme.png"
			var img fyne.CanvasObject

			if _, err := os.Stat(imgPath); err == nil {
				log.Println(">>> Image found, loading:", imgPath)
				image := canvas.NewImageFromFile(imgPath)
				image.FillMode = canvas.ImageFillContain
				image.SetMinSize(fyne.NewSize(400, 300)) // force visibility
				img = image
			} else {
				log.Println(">>> Image not found or error:", err)
				img = widget.NewLabel("Image not found: " + imgPath)
			}

			// Improved fallback layout
			content := container.NewVBox(
				widget.NewLabel("😵 Oops! The app crashed."),
				img,
				widget.NewLabel(fmt.Sprintf("Error: %v", r)),
			)

			w.SetContent(container.NewCenter(content)) // center it in window
			w.Resize(fyne.NewSize(800, 600))
			w.ShowAndRun()
		}
	}()

	// Normally you'd call your UI setup here
	ui := GUI.Show(w)
	w.SetContent(container.NewMax(ui))
	w.Resize(fyne.NewSize(800, 600))
	w.ShowAndRun()
}
