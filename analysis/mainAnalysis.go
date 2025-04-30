package analysis

import "fmt"

func RunAnalysis(path string) (err error) {
	duration, err := getAudioDuration(path)
	if err != nil {
		fmt.Println("Error:", err)
		return err
	}
	fmt.Println("Final Duration:", duration)
	sampleCount := 7200
	if err != nil {
		return err
	}

	waveform, err := GenerateWaveform(path, sampleCount, true)
	if err != nil {
		fmt.Println(err)
		return err
	}
	if len(waveform) > 1 {
		fmt.Println("cool")
	}

	return nil
}
