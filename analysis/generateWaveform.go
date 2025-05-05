package analysis

import (
	"encoding/binary"
	"fmt"
	"io"
	"os"

	"github.com/hajimehoshi/go-mp3"
	filemanipulation "github.com/meiremans/beirbox-GUI/fileManipulation"
)

func GenerateWaveform(filepath string, sampleCount int, saveToId3 bool) ([]uint8, error) {

	file, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	if !isMP3(filepath) {
		return nil, fmt.Errorf("unsupported format")
	}

	mp3Reader, err := filemanipulation.SkipID3Tag(file)
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
	mp3Reader, _ = filemanipulation.SkipID3Tag(file)
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
		filemanipulation.SaveWaveformToID3(filepath, waveform)
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
