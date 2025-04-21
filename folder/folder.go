package main

import (
	"fmt"
	"hash/fnv"
	"os"
	"strings"
)

func hashRelativePath(path string) uint32 {
	// Convert slashes, lowercase, and trim volume (like "E:\")
	relPath := strings.ReplaceAll(path, "\\", "/")
	lower := strings.ToLower(relPath)
	return fnvHash(lower)
}

func fnvHash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

func folderFromHash(hash uint32) (string, string) {
	top := (hash >> 25) & 0x7F // top 7 bits
	sub := hash & 0x1FFFFFF    // lower 25 bits
	return fmt.Sprintf("P%03X", top), fmt.Sprintf("%08X", sub)
}

func analyzeFile(absPath string) {
	// Trim drive letter and colon
	relPath := absPath
	if len(absPath) > 2 && absPath[1] == ':' {
		relPath = absPath[2:]
	}
	relPath = strings.TrimLeft(relPath, `\/`) // trim leading slashes

	hash := hashRelativePath(relPath)
	pFolder, subFolder := folderFromHash(hash)

	fmt.Println("🔎 Input file:", absPath)
	fmt.Println("Relative path used for hashing:", relPath)
	fmt.Printf("Expected folder path: %s/%s\n", pFolder, subFolder)
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go E:\\music\\song.mp3")
		return
	}
	analyzeFile(os.Args[1])
}
