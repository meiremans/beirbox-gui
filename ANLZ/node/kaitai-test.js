const fs = require('fs');
const { KaitaiStream } = require('kaitai-struct');
const RekordboxAnlz = require('./rekordbox_anlz');
// Add this color mapping at the top of your file
const HOTCUE_COLORS = {
    0: 'Default',
    1: 'Pink',
    2: 'Red',
    3: 'Orange',
    4: 'Yellow',
    5: 'Green',
    6: 'Aqua',
    7: 'Blue',
    8: 'Purple'
};
// 1. Helper functions
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function parseAnlzFile(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);
        const stream = new KaitaiStream(fileData);
        const anlz = new RekordboxAnlz(stream);

        console.log(`\nFile: ${filePath}`);
        console.log(`Magic: ${anlz.magic.toString()}`);
        console.log(`Sections: ${anlz.sections.length}`);

        anlz.sections.forEach((section, i) => {
            // Get the section name from the enum
            const sectionName = RekordboxAnlz.SectionTags[section.fourcc] ||
                `UNKNOWN_${section.fourcc.toString(16)}`;

            console.log(`\nSection ${i+1}: ${sectionName}`);
            console.log(`Offset: 0x${(stream.pos - section.lenTag).toString(16)}`);
            console.log(`Length: ${section.lenTag} bytes`);

            // Handle specific section types using the parser's built-in definitions
            switch(section.fourcc) {
                case RekordboxAnlz.SectionTags.PATH:
                    console.log(`File Path: ${section.body.path || 'Not available'}`);
                    break;

                case RekordboxAnlz.SectionTags.CUES:
                case RekordboxAnlz.SectionTags.CUES_2:
                    const cues = section.body.cues || [];
                    console.log(`Cue Points: ${cues.length}`);
                    cues.forEach((cue, j) => {
                        // Enhanced type detection
                        let typeName;
                        if (cue.type === RekordboxAnlz.CueEntryType.LOOP && cue.loopTime > cue.time) {
                            typeName = `LOOP (${cue.loopTime - cue.time}ms)`;
                        } else {
                            typeName = RekordboxAnlz.CueEntryType[cue.type] || `Type ${cue.type}`;
                        }

                        // Hot cue detection and labeling
                        let cueLabel;
                        if (cue.hotCue !== undefined && cue.hotCue > 0) {
                            cueLabel = `Hot Cue ${String.fromCharCode(64 + cue.hotCue)}`;
                        } else {
                            cueLabel = cue.type === RekordboxAnlz.CueEntryType.LOOP ? 'Loop' : 'Memory';
                        }

                        // Status with color coding
                        const status = cue.status !== undefined ?
                            `(${RekordboxAnlz.CueEntryStatus[cue.status]})` : '';

                        // Base output
                        console.log(` ${j+1}. ${cueLabel}: ${typeName} at ${formatTime(cue.time)} ${status}`);

                        // Extended hot cue info
                        if (cue.hotCue > 0) {
                            // Color information
                            const colorId = cue.colorId !== undefined ? cue.colorId : 0;
                            console.log(`   - Color: ${HOTCUE_COLORS[colorId] || colorId}`);

                            // Comment if available
                            if (cue.comment && cue.comment.trim().length > 0) {
                                console.log(`   - Comment: ${cue.comment.trim()}`);
                            }
                        }

                        // Special handling for disabled cues
                        if (cue.status === RekordboxAnlz.CueEntryStatus.DISABLED) {
                            console.log('   - [DISABLED] This cue won\'t trigger during performance');
                        }
                    });
                    break;

                case RekordboxAnlz.SectionTags.BEAT_GRID:
                    const beats = section.body.beats || [];
                    console.log(`Total Beats: ${beats.length}`);

                    if (beats.length > 0) {
                        // Show first beat
                        console.log(` First Beat: ${formatTime(beats[0].time)} (${beats[0].tempo/100}BPM)`);

                        // Show important beat markers (every 16 beats by default)
                        const beatInterval = Math.max(1, Math.floor(beats.length / 8)); // Show ~8 beats
                        for (let i = 0; i < beats.length; i += beatInterval) {
                            const beat = beats[i];
                            console.log(` Beat ${beat.beatNumber}: ${formatTime(beat.time)} (${beat.tempo/100}BPM)`);
                        }

                        // Show last beat if different from last shown
                        if (beats.length > 1 && (beats.length-1) % beatInterval !== 0) {
                            const lastBeat = beats[beats.length-1];
                            console.log(` Beat ${lastBeat.beatNumber}: ${formatTime(lastBeat.time)} (${lastBeat.tempo/100}BPM)`);
                        }

                        // Detect tempo changes
                        let currentTempo = beats[0].tempo;
                        let tempoChangeStart = 0;
                        for (let i = 1; i < beats.length; i++) {
                            if (beats[i].tempo !== currentTempo) {
                                if (tempoChangeStart < i-1) {
                                    console.log(` Tempo ${currentTempo/100}BPM from beat ${beats[tempoChangeStart].beatNumber} to ${beats[i-1].beatNumber}`);
                                }
                                currentTempo = beats[i].tempo;
                                tempoChangeStart = i;
                            }
                        }
                        console.log(` Tempo ${currentTempo/100}BPM from beat ${beats[tempoChangeStart].beatNumber} to end`);
                    }

                    break;

                case RekordboxAnlz.SectionTags.WAVE_PREVIEW:
                case RekordboxAnlz.SectionTags.WAVE_SCROLL:
                    const data = section.body.entries || section.body.data;
                    console.log(`Waveform Data: ${data?.length || 0} bytes`);
                    break;

                // Add cases for other section types as needed
                default:
                    console.log('(No specialized parser for this section type)');
            }
        });
        return anlz;

    } catch (err) {
        console.error('Error parsing ANLZ file:', err);
    }
}

module.exports = parseAnlzFile