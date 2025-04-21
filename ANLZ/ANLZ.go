package ANLZ

import (
	"encoding/json"
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

	// Path to the Node.js script
	scriptPath := filepath.Join(currentDir, "ANLZ", "node", "analyseNewTrack.js")

	// Run the script
	cmd := exec.Command("C:\\Program Files\\nodejs\\node", scriptPath)
	cmd.Dir = filepath.Join(currentDir, "ANLZ", "node")

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Error running Node.js script: %s\n", err)
	}
	fmt.Printf("Output: %s\n", output)

	// Load rainbowtable.json
	rainbowPath := filepath.Join(currentDir, "rainbowtable", "rainbowtable.json")
	rainbowData, err := os.ReadFile(rainbowPath)
	if err != nil {
		fmt.Printf("Failed to read rainbowtable.json: %v", err)
		return
	}

	var rainbow map[string]string
	if err := json.Unmarshal(rainbowData, &rainbow); err != nil {
		fmt.Printf("Failed to parse rainbowtable.json: %v\n", err)
		return
	}

	// Try to find the destination path using the known source file path
	sourceMP3 := "Contents/UnknownArtist/UnknownAlbum/a.mp3" // <- You could parametrize this later

	var destinationKey string
	for key, value := range rainbow {
		if value == sourceMP3 {
			destinationKey = key
			break
		}
	}

	if destinationKey == "" {
		fmt.Printf("No matching DAT path found in rainbowtable for '%s'\n", sourceMP3)
		return
	}

	destPath := filepath.Join(currentDir, destinationKey)
	fmt.Printf("Copying to: %s\n", destPath)

	// Ensure output directory exists
	if err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm); err != nil {
		fmt.Printf("Failed to create output directory: %v\n", err)
		return
	}

	// Copy reconstructed.anlz to the final destination
	srcPath := filepath.Join(currentDir, "ANLZ", "node", "reconstructed.anlz")

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

	fmt.Println("File copied successfully to:", destinationKey)
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
