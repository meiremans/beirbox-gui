package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	xkcd "github.com/meiremans/beirbox-gui/GUI"
)

func main() {
	a := app.New()
	w := a.NewWindow("xkcd Viewer")

	ui := xkcd.Show(w)
	w.SetContent(container.NewMax(ui))
	w.Resize(fyne.NewSize(800, 600))

	w.ShowAndRun()
}
