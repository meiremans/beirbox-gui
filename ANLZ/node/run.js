const writeNewTrack = require("./analyseNewTrack");


if (require.main === module) {
    // Directly run from CLI
    const args = process.argv.slice(2);
    writeNewTrack( ...args);
}


//writeNewTrack("/Contents/UnknownArtist/UnknownAlbum/testsong.mp3");
