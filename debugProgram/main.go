package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

// Serve the actual waveform JSON
func getWaveformData(path string) (map[string]float64, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	rawData, err := ioutil.ReadAll(file)
	if err != nil {
		return nil, err
	}

	var waveform map[string]float64
	if err := json.Unmarshal(rawData, &waveform); err != nil {
		return nil, err
	}
	return waveform, nil
}

// Handler to serve the HTML page
func serveHTML(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

// Handler to serve the JSON data for the actual waveform
func serveExpectedWaveform(w http.ResponseWriter, r *http.Request) {
	expectedWaveform, err := getWaveformData("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\testData\\rekordboxWaveForm.json")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error loading actual waveform: %v", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expectedWaveform)
}

// Handler to serve the JSON data for the expected waveform
func serveActualWaveform(w http.ResponseWriter, r *http.Request) {
	actualWaveform, err := getWaveformData("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\actual_waveform.json")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error loading expected waveform: %v", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(actualWaveform)
}

func main() {
	// Serve static files (like HTML, JS)
	http.HandleFunc("/", serveHTML)
	http.HandleFunc("/actual", serveActualWaveform)
	http.HandleFunc("/expected", serveExpectedWaveform)

	// Start the server on port 8080
	fmt.Println("Starting server on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}
