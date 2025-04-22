package ANLZ

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func ANLZ(musicFolderOnUsb string, musicFolderOnDisk string) {
	currentDir, err := filepath.Abs(".")
	if err != nil {
		fmt.Printf("Error getting current directory: %v\n", err)
		return
	}

	nodepath, err := exec.LookPath("node")
	if err != nil {
		fmt.Println("Node.js not found in PATH. Please install Node.js and try again.")
		return
	}

	err = filepath.Walk(musicFolderOnDisk, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".mp3") {
			fmt.Printf("Processing: %s\n", path)

			// Run the script
			scriptPath := filepath.Join(currentDir, "ANLZ", "node", "analyseNewTrack.js")
			trackPath := filepath.Join(musicFolderOnUsb, info.Name())
			cmd := exec.Command(nodepath, scriptPath, path, trackPath)
			cmd.Dir = filepath.Join(currentDir, "ANLZ", "node")

			output, err := cmd.CombinedOutput()
			if err != nil {
				fmt.Printf("Error running Node.js script for %s: %v\n", path, err)
				return err
			}
			fmt.Printf("Output: %s\n", output)

			destinationKey := filepath.Join("PIONEER", "USBANLZ", getFolderName(filepath.Join(musicFolderOnUsb, info.Name())), "ANLZ0000.DAT")
			destPath := filepath.Join(currentDir, destinationKey)

			fmt.Printf("Copying to: %s\n", destPath)

			// Ensure output directory exists
			if err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm); err != nil {
				fmt.Printf("Failed to create output directory: %v\n", err)
				return err
			}

			// Copy reconstructed.anlz to the final destination
			srcPath := filepath.Join(currentDir, "ANLZ", "node", "reconstructed.anlz")

			srcFile, err := os.Open(srcPath)
			if err != nil {
				fmt.Printf("Failed to open source file: %v\n", err)
				return err
			}
			defer srcFile.Close()

			destFile, err := os.Create(destPath)
			if err != nil {
				fmt.Printf("Failed to create destination file: %v\n", err)
				return err
			}
			defer destFile.Close()

			_, err = io.Copy(destFile, srcFile)
			if err != nil {
				fmt.Printf("Failed to copy file: %v\n", err)
				return err
			}

			fmt.Println("File copied successfully to:", destinationKey)
		}
		return nil
	})

	if err != nil {
		fmt.Printf("Error walking through music folder: %v\n", err)
	}
}

func getFolderName(filename string) string {
	// Replace all backslashes with forward slashes
	filename = strings.ReplaceAll(filename, "\\", "/")
	// Ensure the path starts with a forward slash
	if !strings.HasPrefix(filename, "/") {
		filename = "/" + filename
	}
	var hash uint32 = 0
	for _, c := range filename {
		hash = hash*0x34F5501D + uint32(c)*0x93B6
	}

	part2 := hash % 0x30D43
	part1 := ((((part2>>2&0x4000|(part2&0x2000))>>3|(part2&0x200))>>1|(part2&0xC0))>>3|(part2&0x4))>>1 | (part2 & 0x1)

	return fmt.Sprintf("P%03X/%08X", part1, part2)
}
