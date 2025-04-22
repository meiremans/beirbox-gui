package GUI

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/widget"
	"github.com/meiremans/beirbox-GUI/ANLZ"
	"github.com/meiremans/beirbox-GUI/PDB"
	"github.com/meiremans/beirbox-GUI/data"
)

var musicFolderOnUSB = "/music"
var musicFolderOnDisk string

func init() {
	// Load settings when the program starts
	settings, err := data.LoadSettings()
	if err != nil {
		log.Printf("Failed to load settings: %v\n", err)
		musicFolderOnDisk = "" // Fallback
	} else {
		musicFolderOnDisk = settings.MusicFolder
	}
}

// Folder holds information about a music folder
type Folder struct {
	Path      string
	Labels    map[string]*widget.Label
	FileCount int
}

// CountFiles counts the files in the folder
func (f *Folder) CountFiles() {
	fileCount := 0
	err := filepath.Walk(f.Path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Count only files (not directories)
		if !info.IsDir() {
			fileCount++
		}
		return nil
	})
	if err != nil {
		log.Printf("Error counting files: %v\n", err)
	}
	f.FileCount = fileCount
}

// UpdateFolderInfo will update the UI with folder details and file count
func (f *Folder) UpdateFolderInfo() {
	f.CountFiles() // Update the file count
	f.Labels["folder"].SetText(fmt.Sprintf("Current Folder: %s", f.Path))
	f.Labels["fileCount"].SetText(fmt.Sprintf("Files in Folder: %d", f.FileCount))
}

// newLabel creates and stores a new label in the Labels map
func (f *Folder) newLabel(name string) *widget.Label {
	w := widget.NewLabel("")
	f.Labels[name] = w
	return w
}

func (f *Folder) NewForm(win fyne.Window) fyne.CanvasObject {
	// Create folder labels and file count label
	f.Labels = make(map[string]*widget.Label)
	f.newLabel("folder")
	f.newLabel("fileCount")
	f.UpdateFolderInfo()

	// Use a VBox container to layout the form content
	form := container.NewVBox(
		f.Labels["folder"],    // Display current folder info
		f.Labels["fileCount"], // Display the file count in the folder
	)
	return form
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

func export(selectedUSB string, selectedLocalFolder string, window fyne.Window) {
	usbPath := selectedUSB // e.g., "E:\\"
	if usbPath != "" {
		// Copy files from the selected local folder to the USB
		err := copyDir(selectedLocalFolder, filepath.Join(usbPath, "music"))
		if err != nil {
			fmt.Println("Error copying music:", err)
		}
		ANLZ.ANLZ(musicFolderOnUSB, musicFolderOnDisk)
		PDB.PDB(musicFolderOnUSB, musicFolderOnDisk)

		err = copyDir("PIONEER", filepath.Join(usbPath, "PIONEER"))
		if err != nil {
			fmt.Println("Error copying PIONEER:", err)
		}
	} else {
		dialog.ShowInformation("No USB Selected", "Please select a USB drive first.", window)
	}
}

func selectFolder(window fyne.Window, folder *Folder) {
	// Open a folder selection dialog
	dialog.ShowFolderOpen(func(folderURI fyne.ListableURI, err error) {
		if err == nil && folderURI != nil {
			// Store the selected folder's URI as a string
			selectedPath := folderURI.Path()
			fmt.Println("Selected folder:", selectedPath)

			// Update the Folder path and refresh the info
			folder.Path = selectedPath
			folder.UpdateFolderInfo()
		}
	}, window)
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

func updateMusicFolder(newPath string) {
	settings, err := data.LoadSettings()
	if err != nil {
		log.Printf("Error loading settings: %v\n", err)
		return
	}

	settings.MusicFolder = newPath
	if err := data.SaveSettings(settings); err != nil {
		log.Printf("Error saving settings: %v\n", err)
	} else {
		musicFolderOnDisk = newPath // Update in-memory variable
	}
}

func Show(win fyne.Window) fyne.CanvasObject {
	// Initialize a new Folder instead of Track
	f := &Folder{Path: musicFolderOnDisk} // Path can be set to the default folder

	// Create a new Form for Folder using NewForm method
	form := f.NewForm(win)

	// Modify the folder update method
	usb := NewUSBSelector() // <- new USB selector

	// Add the folder select button
	selectFolderButton := widget.NewButton("Select Local Folder", func() {
		selectFolder(win, f) // Pass the Folder instance to the selectFolder function
	})

	// Export functionality remains unchanged
	export := widget.NewButton("export", func() {
		export(usb.Selected, f.Path, win) // Use the Folder's path for export
		fmt.Println("Export to USB:", usb.Selected)
	})
	export.Importance = widget.HighImportance

	buttons := container.NewHBox(
		layout.NewSpacer(),
		export,
	)

	// Create a container for the main content (image + folder image)
	beirBoxImage := canvas.NewImageFromFile("./static/beirbox.png")
	beirBoxImage.FillMode = canvas.ImageFillContain

	// Content for folder view
	content := container.NewStack(
		beirBoxImage,
	)

	// Update folder info display asynchronously
	go func() {
		f.UpdateFolderInfo()
	}()

	// Compose the layout for the window
	return container.NewBorder(
		form,
		container.NewVBox(buttons, usb.Render(), selectFolderButton),
		nil,
		nil,
		content, // Use content to show the folder's image and path
	)
}
