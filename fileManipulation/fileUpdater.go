package filemanipulation

import (
	"fmt"
	"io"
	"os"
	"runtime"
	"time"
)

func copyFileWithRetry(src, dst string) error {
	const maxRetries = 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(i*100) * time.Millisecond)
		}

		err := func() error {
			srcFile, err := os.Open(src)
			if err != nil {
				return err
			}
			defer srcFile.Close()

			dstFile, err := os.OpenFile(dst, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0666)
			if err != nil {
				return err
			}
			defer dstFile.Close()

			_, err = io.Copy(dstFile, srcFile)
			return err
		}()

		if err == nil {
			return nil
		}
		lastErr = err
	}

	return lastErr
}

func atomicReplaceWithHandleCheck(tempPath, originalPath string) error {
	const maxRetries = 5
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(i*200) * time.Millisecond)
		}

		// Windows-specific pre-removal
		if runtime.GOOS == "windows" {
			if err := os.Remove(originalPath); err != nil && !os.IsNotExist(err) {
				lastErr = err
				continue
			}
		}

		// Attempt the atomic rename
		if err := os.Rename(tempPath, originalPath); err == nil {
			return nil
		} else {
			lastErr = err
		}
	}

	return fmt.Errorf("after %d attempts: %v", maxRetries, lastErr)
}
