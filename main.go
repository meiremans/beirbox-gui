package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"github.com/meiremans/beirbox-GUI/GUI"
)

func main() {

	a := app.New()
	w := a.NewWindow("beirbox")

	ui := GUI.Show(w)
	w.SetContent(container.NewMax(ui))
	w.Resize(fyne.NewSize(800, 600))

	w.ShowAndRun()
}
