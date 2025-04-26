package analysis

import "fmt"

func RunAnalysis(path string) {
	duration, err := getAudioDuration(path)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Final Duration:", duration)
}
