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

func serveWaveform(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		waveform, err := getWaveformData(path)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error loading waveform: %v", err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(waveform)
	}
}

func serveTinyWaveform(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		waveform, err := getWaveformData(path)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error loading waveform: %v", err), http.StatusInternalServerError)
			return
		}
		tinyWaveform, err := DecodeWaveform(waveform)
		if err != nil {
			if err != nil {
				http.Error(w, fmt.Sprintf("Error loading waveform: %v", err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			// Convert the fixed-size arrays to slices for JSON encoding
			result := make([][]byte, 6)
			for i := range tinyWaveform {
				result[i] = tinyWaveform[i][:]
			}
			json.NewEncoder(w).Encode(result)
		}
	}
}

func main() {
	// Serve static files (like HTML, JS)
	http.HandleFunc("/", serveHTML)
	http.HandleFunc("/actual", serveWaveform("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\actual_waveform.json"))
	http.HandleFunc("/expected", serveWaveform("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\testData\\rekordboxWaveForm.json"))
	http.HandleFunc("/tiny_expected", serveTinyWaveform("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\testData\\waveform_dump_tiny.json"))
	http.HandleFunc("/tiny_actual", serveTinyWaveform("C:\\Users\\nelu\\cursor\\beirbox-gui\\analysis\\actual_waveform_tiny.json"))

	// Start the server on port 8080
	fmt.Println("Starting server on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}
