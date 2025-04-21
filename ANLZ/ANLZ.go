package ANLZ

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

func ANLZ() {
	// Get the absolute path to the current directory
	currentDir, err := filepath.Abs(".")
	if err != nil {
		fmt.Printf("Error getting current directory: %v\n", err)
		return
	}

	// Define the path to the Node.js script relative to the current directory
	scriptPath := filepath.Join(currentDir, "ANLZ", "node", "analyseNewTrack.js")

	// Create the command
	cmd := exec.Command("C:\\Program Files\\nodejs\\node", scriptPath)

	// Set the working directory to the folder containing the Node.js script
	cmd.Dir = filepath.Join(currentDir, "ANLZ/node")

	// Capture standard output and standard error
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Print the error if there was one
		fmt.Printf("Error: %s\n", err)
	}

	// Print the output (both stdout and stderr combined)
	fmt.Printf("Output: %s\n", output)

	// Copy reconstructed.anlz to ../output/reconstructed.DAT
	srcPath := filepath.Join(currentDir, "ANLZ", "node", "reconstructed.anlz")
	destPath := filepath.Join(currentDir, "PIONEER", "USBANLZ", "P036", "00006A74", "ANLZ0000.DAT")

	// Ensure output directory exists
	if err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm); err != nil {
		fmt.Printf("Failed to create output directory: %v\n", err)
		return
	}

	srcFile, err := os.Open(srcPath)
	if err != nil {
		fmt.Printf("Failed to open source file: %v\n", err)
		return
	}
	defer srcFile.Close()

	destFile, err := os.Create(destPath)
	if err != nil {
		fmt.Printf("Failed to create destination file: %v\n", err)
		return
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, srcFile)
	if err != nil {
		fmt.Printf("Failed to copy file: %v\n", err)
		return
	}

	fmt.Println("File copied successfully to output/USBANLZ0000.DAT.")
}

func getFolderName(filename string) string {
	var hash uint32 = 0
	for _, c := range filename {
		hash = hash*0x34F5501D + uint32(c)*0x93B6
	}

	part2 := hash % 0x30D43
	part1 := ((((part2>>2&0x4000|(part2&0x2000))>>3|(part2&0x200))>>1|(part2&0xC0))>>3|(part2&0x4))>>1 | (part2 & 0x1)

	return fmt.Sprintf("P%03X/%08X", part1, part2)
}
