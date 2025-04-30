package analysis

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
)

func dumpJSON(filename string, data interface{}) {
	f, err := os.Create(filename)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer f.Close()

	encoder := json.NewEncoder(f)
	encoder.SetIndent("", "  ") // pretty print
	if err := encoder.Encode(data); err != nil {
		fmt.Println("Error writing JSON:", err)
	}
}

func TestWaveformFromMP3_MatchesExpected(t *testing.T) {
	mp3Path := "./testData/testsong.mp3"
	expectedJSONPath := "./testData/rekordboxWaveForm.json"
	actualMap := make(map[string]int)
	sampleCount := 7200 // must match what's used to generate expected waveform

	actual, err := GenerateWaveform(mp3Path, sampleCount, false)
	if err != nil {
		t.Fatalf("Error generating waveform: %v", err)
	}

	// Load expected waveform
	data, err := os.ReadFile(expectedJSONPath)
	if err != nil {
		t.Fatalf("Failed to read expected waveform JSON: %v", err)
	}

	var expectedMap map[string]uint8
	if err := json.Unmarshal(data, &expectedMap); err != nil {
		t.Fatalf("JSON unmarshal error: %v", err)
	}

	expected := make([]uint8, len(expectedMap))
	for i := 0; i < len(expected); i++ {
		expected[i] = expectedMap[fmt.Sprintf("%d", i)]
	}

	for i := range actual {
		key := fmt.Sprintf("%d", i) // convert int to string
		actualMap[key] = int(actual[i])
		if actual[i] != expected[i] {
			actualHeight := actual[i] & 0x1F // low 5 bits
			expectedHeight := expected[i] & 0x1F
			t.Errorf("Mismatch at index %d: got %d, expected %d", i, actualHeight, expectedHeight)
		}
	}
	dumpJSON("actual_waveform.json", actualMap)
}
