const writeNewTrack = require("./analyseNewTrack");


if (require.main === module) {
    // Directly run from CLI
    const filePath = process.argv[2];
    writeNewTrack(filePath);
}


//writeNewTrack("/Contents/UnknownArtist/UnknownAlbum/testsong.mp3");
