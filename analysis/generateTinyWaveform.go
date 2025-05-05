package analysis

import (
	"encoding/json"
	"fmt"
	"os"
)

func GenerateTinyWaveform() ([6][1200]byte, error) {
	// Open the JSON file
	file, err := os.Open("actual_tiny_waveform.json")
	var empty [6][1200]byte
	if err != nil {
		return empty, fmt.Errorf("failed to open JSON file: %w", err)
	}
	defer file.Close()

	// Decode into map[string]float64
	var waveform map[string]float64
	if err := json.NewDecoder(file).Decode(&waveform); err != nil {
		return [6][1200]byte{}, fmt.Errorf("failed to decode JSON: %w", err)
	}
	tinyWaveForm, _err := DecodeWaveform(waveform)
	return tinyWaveForm, _err

}
