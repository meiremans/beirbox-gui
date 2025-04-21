package data

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type UserData struct {
	MusicFolder string `json:"musicFolder"`
}

func LoadSettings() (UserData, error) {
	var settings UserData

	// Ensure the ./data directory exists
	if err := os.MkdirAll("./data", 0755); err != nil {
		return settings, fmt.Errorf("failed to create data directory: %w", err)
	}

	// Check if the file exists
	filePath := filepath.Join("./data", "userdata.json")

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// If not, create default settings
		settings = UserData{
			MusicFolder: "C:/beirbox", // Default path
		}
		// Save the default settings
		if err := SaveSettings(settings); err != nil {
			return settings, fmt.Errorf("failed to save default settings: %w", err)
		}
		return settings, nil
	}

	// Read existing settings
	data, err := os.ReadFile(filePath)
	if err != nil {
		return settings, fmt.Errorf("failed to read settings file: %w", err)
	}

	if err := json.Unmarshal(data, &settings); err != nil {
		return settings, fmt.Errorf("failed to parse settings: %w", err)
	}

	return settings, nil
}

// You'll need this SaveSettings function
func SaveSettings(settings UserData) error {
	filePath := filepath.Join("./data", "userdata.json")
	data, err := json.MarshalIndent(settings, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filePath, data, 0644)
}
