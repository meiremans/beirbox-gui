const fs = require('fs');
const parseAnlzFile = require("./kaitai-test");
const {extname} = require("node:path");
const id3 = require('node-id3');
let filePath = null; //TODO: dirty shit
let filePathOnDisk = null; //TODO: dirty shit


const buildUInt32BE = (value) => {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(value);
    return buf;
};

const buildUInt16BE = (value) => {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(value);
    return buf;
};

function fourccToString(fourcc) {
    if (typeof fourcc === 'string') {
        // Ensure proper byte order
        return fourcc.split('').reverse().join('');
    }
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(fourcc, 0);
    return buffer.toString('ascii');
}

function rebuildSectionFromParsed(section) {

    const headerBuf = Buffer.alloc(12);
    const fourcc = fourccToString(section.fourcc);
    headerBuf.write(fourcc, 0, 4, 'ascii');
    headerBuf.writeUInt32BE(section.lenHeader, 4);

    // Construct body based on section type
    const bodyBuf = buildSectionBody(fourcc, section.body);
    headerBuf.writeUInt32BE(bodyBuf.length +12, 8);
    console.log(fourcc)
    console.log(bodyBuf.length)
    console.log(section.lenTag - 12)

    return Buffer.concat([headerBuf, bodyBuf]);
}

function buildSectionBody(fourcc, body) {
    switch (fourcc) {
        case 'PCOB':
            return buildCueTag(body);
        case 'PQTZ':
            return buildBeatGrid(body);
        case 'PPTH':
            return buildPathTag(body);
        case 'PVBR':
            return buildVariableBitRate(body);
        case 'PWAV':
            return buildWavePreview(body);
        case 'PWV2':
            return buildTinyWavePreview(body);
        case 'PWV3': return buildBigWave(body);
        case 'PCO2': return buildCueExtended(body);
        case 'PWV5': return buildWaveColorScroll(body);
        case 'PWV4': return buildWaveColorPreview(body);
        case 'PQT2': return buildBigWave(body);
        default:
            console.warn(`Unhandled section fourcc: ${fourcc}`);
            return body.raw || Buffer.alloc(0);
    }
}

function buildWaveColorScroll(body) {
    let { entries } = body;

    if (entries instanceof Uint8Array && !(entries instanceof Buffer)) {
        entries = Buffer.from(entries);
    }

    if (!Buffer.isBuffer(entries)) {
        throw new Error('Expected body.entries to be a Buffer or Uint8Array');
    }

    const len_entry_bytes = 2;
    const len_entries = entries.length / len_entry_bytes;

    const header = Buffer.alloc(12);
    header.writeUInt32BE(len_entry_bytes, 0);
    header.writeUInt32BE(len_entries, 4);
    header.writeUInt32BE(0x960000, 8);

    return Buffer.concat([header, entries]);
}

function buildWaveColorPreview(body) {
    let { entries } = body;

    if (entries instanceof Uint8Array && !(entries instanceof Buffer)) {
        entries = Buffer.from(entries);
    }

    if (!Buffer.isBuffer(entries)) {
        throw new Error('Expected body.entries to be a Buffer or Uint8Array');
    }

    const len_entry_bytes = 6;
    const len_entries = entries.length / len_entry_bytes;

    const header = Buffer.alloc(12);
    header.writeUInt32BE(len_entry_bytes, 0);
    header.writeUInt32BE(len_entries, 4);
    header.writeUInt32BE(0x960000, 8);

    return Buffer.concat([header, entries]);
}



function buildCueExtended(body) {
    let { type, cues } = body;

    if (!Array.isArray(cues)) {
        throw new Error('Expected body.cues to be an array');
    }

    const num_cues = cues.length;

    const cueBuffers = cues.map(cue => {
        if (!(cue instanceof Buffer)) {
            throw new Error('Each cue should be a Buffer');
        }
        return cue;
    });

    const header = Buffer.alloc(8);
    header.writeUInt32BE(type, 0);      // cue type
    header.writeUInt16BE(num_cues, 4);  // number of cues
    header.writeUInt16BE(0, 6);         // padding / reserved

    return Buffer.concat([header, ...cueBuffers]);
}

/**
 * The Big Wave is a low-res representation, usually:
 *     1 byte per "slice" (volume level)
 *     Fixed length for most tracks (~780 bytes)
 *     Not based on total samples or time exactly — it's more like:
 *         "Compress the whole song into ~780 vertical bars of loudness"
 */

function buildBigWave(body) {
    let entries;

    const ext = extname(filePathOnDisk).toLowerCase();
    if (ext === '.mp3') {
        // Read from ID3 tag
        const tags = id3.read(filePathOnDisk);
        if (tags.userDefinedText) {
            const waveformTag = tags.userDefinedText.find(t => t.description === 'WAVEFORM');
            if (waveformTag) {
                entries = Buffer.from(JSON.parse(waveformTag.value));
            }
        }
    }

    if (!entries) {
        entries = Buffer.alloc(7200);

        for (let i = 0; i < 7200; i++) {
            // Generate a sine wave as a fallback or use your logic for actual waveform data
            const sineVal = Math.round(128 + 127 * Math.sin((i / 7200) * 2 * Math.PI * 3));

            // Encode the height in the low-order 5 bits (0 to 31)
            const height = Math.abs(sineVal) % 32;  // Ensure height is between 0 and 31

            // Encode the whiteness in the high-order 3 bits (0 to 7)
            const whiteness = Math.abs(Math.round(sineVal / 128)); // Normalize sineVal to 0 or 1 (whiteness factor)

            // Combine the height and whiteness into a single byte
            const encodedByte = (whiteness << 5) | height;  // Shifting whiteness to the high-order 3 bits and OR'ing with height

            // Store the encoded value in the waveform
            entries[i] = encodedByte;
        }
    }

    if (!Buffer.isBuffer(entries)) {
        throw new Error('Expected entries to be a Buffer or Uint8Array');
    }

    const len_entry_bytes = 1;
    const len_entries = entries.length;

    const header = Buffer.alloc(12);
    header.writeUInt32BE(len_entry_bytes, 0);     // len_entry_bytes
    header.writeUInt32BE(len_entries, 4);         // len_entries
    header.writeUInt32BE(0x960000, 8);            // constant

    return Buffer.concat([header, entries]);
}
// Helper function to convert string to UTF-16 Big Endian with zero-padding to the given length
function stringToUTF16BE(str, targetLengthInBytes) {
    // Default target length: string length * 2 + 2 bytes for null terminator
    const requiredLength = str.length * 2 + 2;
    const finalLength = targetLengthInBytes ?? requiredLength;

    const utf16Buffer = Buffer.alloc(finalLength);

    // Max characters allowed (excluding the final 2 bytes for null/padding)
    const maxChars = Math.floor((finalLength - 2) / 2);
    for (let i = 0; i < Math.min(str.length, maxChars); i++) {
        utf16Buffer.writeUInt16BE(str.charCodeAt(i), i * 2);
    }
    return utf16Buffer;
}




function buildPathTag(body) {
    const { path } = body;

    // Convert path string to UTF-16BE buffer
    const encoded = stringToUTF16BE(filePath ?? path); // No fixed size here, just get the real size

    // len_path is the size of the UTF-16BE path + 2 (could be for null or alignment)
    const len_path = encoded.length;

    // Create buffer: 4 bytes for len_path, then encoded path
    const buf = Buffer.alloc(4 + encoded.length);
    buf.writeUInt32BE(len_path, 0);        // Write len_path
    encoded.copy(buf, 4);                  // Write UTF-16BE path after len

    return buf;
}

function buildBeatGrid(body) {
    const { beats } = body;

    // Start by building the header of the beat_grid_tag
    const header = Buffer.alloc(12);
    header.writeUInt32BE(0, 0); // The first 4-byte value (could be anything depending on your context, assumed 0 here)
    header.writeUInt32BE(0x80000, 4); // The second value (0x80000)
    header.writeUInt32BE(beats.length, 8); // num_beats: the number of beats

    // Now, let's build the `beats` array
    const beatEntries = beats.map(beat => {
        const beatBuffer = Buffer.alloc(8);

        // Write beat_number (2 bytes, u2)
        beatBuffer.writeUInt16BE(beat.beatNumber, 0);

        // Write tempo (2 bytes, u2) - multiplied by 100 (as per the documentation)
        beatBuffer.writeUInt16BE(beat.tempo, 2);

        // Write time (4 bytes, u4) - the time in ms
        beatBuffer.writeUInt32BE(beat.time, 4);

        return beatBuffer;
    });

    // Concatenate all beat entries into a single buffer
    const beatsBuffer = Buffer.concat(beatEntries);

    // Return the full buffer: header + beatsBuffer
    return Buffer.concat([header, beatsBuffer]);
}

function buildTinyWavePreview(body) {
    let { data, len_tag = 0, len_header = 8 } = body;
    const choices = [1, 2, 15];
    // Ensure data is a Buffer
    if (data instanceof Uint8Array && !(data instanceof Buffer)) {
        for (let i = 0; i < 100; i++) {
            data[i] = choices[Math.floor(Math.random() * choices.length)];
        }
        data = Buffer.from(data);
    }

    if (!Buffer.isBuffer(data)) {
        throw new Error('Expected "data" to be a Buffer or Uint8Array');
    }

    const len_data = data.length;

    // If len_tag/len_header is provided, ensure it makes sense
    if (len_tag && len_header && len_tag <= len_header) {
        console.warn('len_tag is not larger than len_header; data might be ignored according to spec');
    }

    // Header: len_data (u4) + constant (u4)
    const header = Buffer.alloc(8);
    header.writeUInt32BE(len_data, 0);
    header.writeUInt32BE(0x10000, 4); // Constant value

    return Buffer.concat([header, data]);
}

function buildWavePreview(body) {
    let { data } = body;

    // Convert Uint8Array to Buffer if needed
    if (data instanceof Uint8Array && !(data instanceof Buffer)) {
        data = Buffer.from(data);
    }

    if (!Buffer.isBuffer(data)) {
        throw new Error('Expected body.data to be a Buffer or Uint8Array');
    }

    const len_data = data.length;

    // Build the 8-byte header
    const header = Buffer.alloc(8);
    header.writeUInt32BE(len_data, 0);        // len_data
    header.writeUInt32BE(0x10000, 4);         // constant

    return Buffer.concat([header, data]);
}




function buildVariableBitRate(body) {
    const { index } = body;

    // Ensure the index array has exactly 400 elements
    const paddedIndex = [...index];  // Copy the index array
    while (paddedIndex.length < 400) {
        paddedIndex.push(0); // Pad with zero if the array is shorter than 400 elements
    }

    // 400 index values (each index is a 32-bit unsigned integer)
    // Allocate 1608 bytes to account for 400 indices + 8 extra bytes (header or other data)
    const indices = Buffer.alloc(1608);  // Allocate exactly 1608 bytes

    // Write header or extra data into the first 8 bytes (if required)
    // For example, writing 8 bytes of header (fill with zeros or any specific values)
    indices.fill(0, 0, 8);  // Fill the first 8 bytes with zeros (adjust as needed)

    // Fill the rest with the indices (400 indices, each 4 bytes)
    for (let i = 0; i < paddedIndex.length; i++) {
        indices.writeUInt32BE(paddedIndex[i], 8 + i * 4);  // Start writing indices after the header
    }

    // Log the length of the buffer to make sure it matches
    console.log(`Buffer size: ${indices.length} bytes`);

    return indices; // Return the 1608-byte buffer
}





// Example implementation for cue_tag
function buildCueTag(body) {
    const { type, numCues, memoryCount, cues } = body;
    const header = Buffer.concat([
        buildUInt32BE(type),
        Buffer.alloc(2), // always 2 bytes (seems unused)
        buildUInt16BE(0),
        buildUInt32BE(memoryCount) //whats this?
    ]);

    const cueBuffers = cues.map(buildCueEntry);
    return Buffer.concat([header, ...cueBuffers]);
}

function buildUInt8BE(val) {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(val);
    return buf;
}

function buildUInt24BE(value) {
    const buf = Buffer.alloc(3);
    buf.writeUInt8((value >> 16) & 0xFF, 0);
    buf.writeUInt8((value >> 8) & 0xFF, 1);
    buf.writeUInt8(value & 0xFF, 2);
    return buf;
}

function buildCueEntry(cue) {
    const fixedFields = Buffer.concat([]);
    return fixedFields;
}


const writePMAIHeader = (anlz) => {
    const header = Buffer.alloc(12); // Allocating 12 bytes for header

    // Write the magic string "PMAI" at the start (4 bytes)
    header.write('PMAI', 0, 4, 'ascii');  // Magic string "PMAI"

    // Set the header length to 0x1C (28 bytes). This is your expected len_header.
    // Using writeUInt32BE for Big Endian format to match expected behavior.
    const len_header = 0x1C;
    header.writeUInt32BE(len_header, 4);  // Write len_header in big-endian (4 bytes)

    // The len_file field is the total file length. Set it to 0 as a placeholder for now.
    const len_file = 0;  // Will update later with the full file size.
    header.writeUInt32BE(len_file, 8);  // Write len_file in big-endian (4 bytes)

    return header;
};




function rebuildAnlzFile(anlz, outputPath) {
    const parsedSections = anlz.sections;
    const rebuiltSections = parsedSections.map(rebuildSectionFromParsed);
    const header = writePMAIHeader(anlz);

    // Calculate total length and patch it into the header 28 should be header.length
    const totalLength = 28 + rebuiltSections.reduce((sum, b) => sum + b.length, 0); // totalLength = 28 + 44 = 72
    header.writeUInt32BE(totalLength, 8); // Write the total length (72) at offset 8
    const unnamed3Buf = Buffer.from(anlz._unnamed3);  // or use a fixed number like 0

    const fullBuffer = Buffer.concat([
        header,
        unnamed3Buf,
        ...rebuiltSections
    ]);
    console.log(fullBuffer.subarray(0, 128));
    fs.writeFileSync(outputPath, fullBuffer);
    console.log(`✅ Wrote rebuilt file to ${outputPath}`);
}

function writeNewTrack (filePathOnUsb, fullPathOnDisk){
    console.log(filePathOnUsb)
    console.log(fullPathOnDisk)
    filePath = filePathOnUsb;
    filePathOnDisk = fullPathOnDisk
    const parsedDAT = parseAnlzFile("./startfile.DAT")
    rebuildAnlzFile(parsedDAT, './ANLZ0000.DAT');
    parseAnlzFile("./ANLZ0000.DAT");
    const parsedEXT = parseAnlzFile("./ANLZ0000V5.EXT")
    rebuildAnlzFile(parsedEXT, './ANLZ0000.EXT');
    parseAnlzFile("./ANLZ0000.EXT");
}

module.exports = writeNewTrack