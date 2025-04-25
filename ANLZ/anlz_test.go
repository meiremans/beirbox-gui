package ANLZ

import (
	"fmt"
	"testing"
)

func TestGetFolderName(t *testing.T) {

	testCases := map[string]string{
		"/Contents/UnknownArtist/UnknownAlbum/a.mp3":                    "P07D/00012BE9/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/aie.mp3":                  "P07D/000172E3/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/adc.mp3":                  "P07D/000163F3/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/axq.mp3":                  "P07D/0001B3D9/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/atx.mp3":                  "P07D/000172FB/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/ayf.mp3":                  "P07D/0001A6C9/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/bul.mp3":                  "P07D/0001EEF9/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/aai.mp3":                  "P039/00003AA9/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/aac.mp3":                  "P039/00002683/ANLZ0000.DAT",
		"/Contents/UnknownArtist/UnknownAlbum/bwj.mp3":                  "P07D/0001AFFB/ANLZ0000.DAT",
		"/music/testsong.mp3":                                           "P036/00006A74/ANLZ0000.DAT",
		"/Contents/rekordbox/GROOVE CIRCUIT FACTORY SAMPLES/House3.wav": "P060/0001BC00/ANLZ0000.DAT",
	}

	for input, expected := range testCases {
		t.Run(input, func(t *testing.T) {
			actualFolder := getFolderName(input)
			output := fmt.Sprintf("%s/ANLZ0000.DAT", actualFolder)

			if output != expected {
				t.Errorf("getFolderName(%q) = %q; want %q", input, output, expected)
			}
		})
	}

}
