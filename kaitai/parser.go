package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	ksyFiles := [3]string{"./rekordbox_pdb.ksy", "./rekordbox_anlz.ksy"} // fixed array
	outDir := "./compiled"
	for _, ksyFile := range ksyFiles {
		// Step 1: Read the .ksy ;
		data, err := ioutil.ReadFile(ksyFile)
		if err != nil {
			log.Fatalf("Error reading the .ksy file: %v", err)
		}
		fmt.Println("Successfully read .ksy file.")

		// Optional: print YAML content for debugging
		fmt.Println(string(data))

		// Step 2: Ensure output directory exists
		err = os.MkdirAll(outDir, os.ModePerm)
		if err != nil {
			log.Fatalf("Error creating output directory: %v", err)
		}

		// Step 3: Call Kaitai compiler
		cmd := exec.Command("kaitai-struct-compiler", "-t", "go", "-d", outDir, ksyFile)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		fmt.Println("Compiling .ksy to GO...")
		err = cmd.Run()
		if err != nil {
			log.Fatalf("Error compiling Kaitai Struct schema: %v", err)
		}
		fmt.Printf("Compilation successful. Output saved to: %s\n", outDir)

		// Optional: list the output files
		files, err := ioutil.ReadDir(outDir)
		if err != nil {
			log.Fatalf("Error reading output directory: %v", err)
		}
		for _, file := range files {
			fmt.Printf("Compiled file: %s\n", filepath.Join(outDir, file.Name()))
		}
	}
}
