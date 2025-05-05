package analysis

import (
	"errors"
	"sort"
)

// DecodeWaveform splits interleaved waveform data into 6 separate 1200-byte arrays.
func DecodeWaveform(waveform map[string]float64) ([6][1200]byte, error) {
	const (
		numChannels = 6
		samples     = 1200
		totalBytes  = numChannels * samples
	)

	// Sort keys to ensure deterministic ordering if needed
	keys := make([]string, 0, len(waveform))
	for k := range waveform {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Build raw byte slice from waveform map
	raw := make([]byte, 0, totalBytes)
	for _, k := range keys {
		if len(raw) >= totalBytes {
			break
		}
		val := waveform[k]
		raw = append(raw, byte(val))
	}
	if len(raw) < totalBytes {
		return [6][1200]byte{}, errors.New("not enough data in waveform")
	}

	// Split into 6 channels
	var result [6][1200]byte
	for x := 0; x < samples; x++ {
		for ch := 0; ch < numChannels; ch++ {
			result[ch][x] = raw[x*numChannels+ch] & 0x7F // like Python code
		}
	}

	return result, nil
}
