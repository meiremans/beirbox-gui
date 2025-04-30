package analysis

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/bogem/id3v2"
	"github.com/hajimehoshi/go-mp3"
)

func skipID3Tag(r io.ReadSeeker) (io.ReadSeeker, error) {
	// Read the first 10 bytes of the file
	header := make([]byte, 10)
	_, err := r.Read(header)
	if err != nil {
		return nil, err
	}

	// Check if the file starts with an ID3 tag
	if string(header[0:3]) != "ID3" {
		// No ID3 tag, rewind the file to the start and return the reader as is
		r.Seek(0, io.SeekStart)
		return r, nil
	}

	// Extract the size of the ID3 tag (bytes 6 to 9 in the header)
	size := int(header[6]&0x7F)<<21 |
		int(header[7]&0x7F)<<14 |
		int(header[8]&0x7F)<<7 |
		int(header[9]&0x7F)

	// Skip over the ID3 tag by seeking to the position after the tag
	newPos, err := r.Seek(int64(size)+10, io.SeekStart)
	if err != nil {
		return nil, err
	}

	// Log new position (for debugging purposes)
	fmt.Println("Skipped ID3 tag, new position:", newPos)
	return r, nil
}
func GenerateWaveform(filepath string, sampleCount int, saveToId3 bool) ([]uint8, error) {

	file, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	if !isMP3(filepath) {
		return nil, fmt.Errorf("unsupported format")
	}

	mp3Reader, err := skipID3Tag(file)
	if err != nil {
		return nil, fmt.Errorf("error skipping ID3 tag: %v", err)
	}

	decoder, err := mp3.NewDecoder(mp3Reader)
	if err != nil {
		return nil, fmt.Errorf("error creating MP3 decoder: %v", err)
	}

	// Count total samples
	totalSamples := 0
	tmpBuf := make([]byte, 2048)
	for {
		n, err := decoder.Read(tmpBuf)
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		totalSamples += n / 2 // 2 bytes per sample for 16-bit audio
	}

	// Re-open and re-decode
	file.Seek(0, io.SeekStart)
	mp3Reader, _ = skipID3Tag(file)
	decoder, _ = mp3.NewDecoder(mp3Reader)

	samplesPerBucket := totalSamples / sampleCount
	waveform := make([]uint8, sampleCount)

	buf := make([]byte, samplesPerBucket*2) // 2 bytes per sample
	for i := 0; i < sampleCount; i++ {
		n, err := io.ReadFull(decoder, buf)
		if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
			return nil, err
		}
		if n == 0 {
			break
		}

		maxAmp := int16(0)
		for j := 0; j < n; j += 2 {
			sample := int16(binary.LittleEndian.Uint16(buf[j : j+2]))
			if sample < 0 {
				sample = -sample
			}
			if sample > maxAmp {
				maxAmp = sample
			}
		}
		// Normalize to 0–255
		waveform[i] = uint8((int(maxAmp) * 255) / 32767)
	}
	if saveToId3 {
		file.Close()
		SaveWaveformToID3(filepath, waveform)
	}

	return waveform, nil
}

func isMP3(filename string) bool {
	return len(filename) > 4 && filename[len(filename)-4:] == ".mp3"
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func SaveWaveformToID3(filepathString string, waveform []uint8) error {
	// 1. Generate temp file path in system temp directory
	tempDir := os.TempDir()
	tempFileName := fmt.Sprintf("~temp-%d-%s", time.Now().UnixNano(), filepath.Base(filepathString))
	tempPath := filepath.Join(tempDir, tempFileName)

	// 2. Three-stage process with guaranteed cleanup
	var finalErr error
	defer func() {
		if finalErr != nil {
			if err := os.Remove(tempPath); err != nil {
				log.Printf("Warning: failed to clean up temp file %s: %v", tempPath, err)
			}
		}
	}()

	// Stage 1: Copy to temp file
	if err := copyFileWithRetry(filepathString, tempPath); err != nil {
		finalErr = fmt.Errorf("copy failed: %v", err)
		return finalErr
	}

	// Stage 2: Process temp fileb
	if err := processTempFile(tempPath, waveform); err != nil {
		finalErr = fmt.Errorf("processing failed: %v", err)
		return finalErr
	}

	// Stage 3: Atomic replace
	if err := atomicReplaceWithHandleCheck(tempPath, filepathString); err != nil {
		finalErr = fmt.Errorf("replace failed: %v", err)
		return finalErr
	}

	return nil
}
func copyFileWithRetry(src, dst string) error {
	const maxRetries = 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(i*100) * time.Millisecond)
		}

		err := func() error {
			srcFile, err := os.Open(src)
			if err != nil {
				return err
			}
			defer srcFile.Close()

			dstFile, err := os.OpenFile(dst, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0666)
			if err != nil {
				return err
			}
			defer dstFile.Close()

			_, err = io.Copy(dstFile, srcFile)
			return err
		}()

		if err == nil {
			return nil
		}
		lastErr = err
	}

	return lastErr
}

func processTempFile(tempPath string, waveform []uint8) error {
	// Isolated processing function ensures tag gets closed
	tag, err := id3v2.Open(tempPath, id3v2.Options{Parse: true})
	if err != nil {
		return err
	}
	defer tag.Close()

	waveformJSON, err := json.Marshal(waveform)
	if err != nil {
		return err
	}

	tag.DeleteFrames("TXXXX")
	tag.AddUserDefinedTextFrame(id3v2.UserDefinedTextFrame{
		Encoding:    id3v2.EncodingUTF8,
		Description: "WAVEFORM",
		Value:       string(waveformJSON),
	})

	return tag.Save()
}

func atomicReplaceWithHandleCheck(tempPath, originalPath string) error {
	const maxRetries = 5
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(i*200) * time.Millisecond)
		}

		// Windows-specific pre-removal
		if runtime.GOOS == "windows" {
			if err := os.Remove(originalPath); err != nil && !os.IsNotExist(err) {
				lastErr = err
				continue
			}
		}

		// Attempt the atomic rename
		if err := os.Rename(tempPath, originalPath); err == nil {
			return nil
		} else {
			lastErr = err
		}
	}

	return fmt.Errorf("after %d attempts: %v", maxRetries, lastErr)
}
