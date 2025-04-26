package analysis

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bogem/id3v2"
	"github.com/faiface/beep"
	"github.com/faiface/beep/mp3"
	"github.com/faiface/beep/wav"
)

// Try to get duration from ID3 tag (TLEN frame)
func getDurationFromID3(path string) (time.Duration, error) {
	tag, err := id3v2.Open(path, id3v2.Options{Parse: true})
	if err != nil {
		return 0, err
	}
	defer tag.Close()

	frames := tag.AllFrames()["TLEN"]
	if len(frames) == 0 {
		return 0, fmt.Errorf("no TLEN frame found")
	}

	// Usually only one TLEN frame exists
	frame := frames[0]

	// Now get the text value
	textFrame, ok := frame.(id3v2.TextFrame)
	if !ok {
		return 0, fmt.Errorf("TLEN frame is not a text frame")
	}

	lengthMs, err := strconv.Atoi(textFrame.Text)
	if err != nil {
		return 0, fmt.Errorf("invalid TLEN value: %v", err)
	}

	return time.Duration(lengthMs) * time.Millisecond, nil
}

// Decode audio and calculate duration
func getDurationByDecoding(path string) (time.Duration, error) {
	f, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	ext := filepath.Ext(path)
	var streamer beep.StreamSeekCloser
	var format beep.Format

	switch ext {
	case ".mp3":
		streamer, format, err = mp3.Decode(f)
	case ".wav":
		streamer, format, err = wav.Decode(f)
	default:
		return 0, fmt.Errorf("unsupported file format: %s", ext)
	}
	if err != nil {
		return 0, err
	}
	defer streamer.Close()

	length := streamer.Len() // total samples
	duration := time.Duration(float64(length) / float64(format.SampleRate) * float64(time.Second))

	return duration, nil
}

// Save TLEN frame to ID3 tag
func saveDurationToID3(path string, duration time.Duration) error {
	tag, err := id3v2.Open(path, id3v2.Options{Parse: true})
	if err != nil {
		return err
	}
	defer tag.Close()

	// Duration in milliseconds
	lengthMs := strconv.Itoa(int(duration.Milliseconds()))

	// Set TLEN frame
	tag.AddTextFrame("TLEN", tag.DefaultEncoding(), lengthMs)

	// Save changes back to file
	return tag.Save()
}

// Main function: try ID3 first, decode fallback + write if needed
func getAudioDuration(path string) (time.Duration, error) {
	duration, err := getDurationFromID3(path)
	if err == nil {
		fmt.Println("Found TLEN, fast read ✅")
		return duration, nil
	}

	fmt.Println("TLEN not found, decoding audio... 🎵")

	// fallback to decoding
	duration, err = getDurationByDecoding(path)
	if err != nil {
		return 0, err
	}

	fmt.Println("Decoded duration:", duration)

	// Now save TLEN for next time
	err = saveDurationToID3(path, duration)
	if err != nil {
		fmt.Println("Warning: failed to save TLEN:", err)
	} else {
		fmt.Println("Saved TLEN tag for faster future reads ✅")
	}

	return duration, nil
}
