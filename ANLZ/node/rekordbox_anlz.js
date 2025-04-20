// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.RekordboxAnlz = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
/**
 * These files are created by rekordbox when analyzing audio tracks
 * to facilitate DJ performance. They include waveforms, beat grids
 * (information about the precise time at which each beat occurs),
 * time indices to allow efficient seeking to specific positions
 * inside variable bit-rate audio streams, and lists of memory cues
 * and loop points. They are used by Pioneer professional DJ
 * equipment.
 * 
 * The format has been reverse-engineered to facilitate sophisticated
 * integrations with light and laser shows, videos, and other musical
 * instruments, by supporting deep knowledge of what is playing and
 * what is coming next through monitoring the network communications
 * of the players.
 * @see {@link https://reverseengineering.stackexchange.com/questions/4311/help-reversing-a-edb-database-file-for-pioneers-rekordbox-software|Source}
 */

var RekordboxAnlz = (function() {
  RekordboxAnlz.CueEntryStatus = Object.freeze({
    DISABLED: 0,
    ENABLED: 1,
    ACTIVE_LOOP: 4,

    0: "DISABLED",
    1: "ENABLED",
    4: "ACTIVE_LOOP",
  });

  RekordboxAnlz.CueListType = Object.freeze({
    MEMORY_CUES: 0,
    HOT_CUES: 1,

    0: "MEMORY_CUES",
    1: "HOT_CUES",
  });

  RekordboxAnlz.MoodHighPhrase = Object.freeze({
    INTRO: 1,
    UP: 2,
    DOWN: 3,
    CHORUS: 5,
    OUTRO: 6,

    1: "INTRO",
    2: "UP",
    3: "DOWN",
    5: "CHORUS",
    6: "OUTRO",
  });

  RekordboxAnlz.TrackBank = Object.freeze({
    DEFAULT: 0,
    COOL: 1,
    NATURAL: 2,
    HOT: 3,
    SUBTLE: 4,
    WARM: 5,
    VIVID: 6,
    CLUB_1: 7,
    CLUB_2: 8,

    0: "DEFAULT",
    1: "COOL",
    2: "NATURAL",
    3: "HOT",
    4: "SUBTLE",
    5: "WARM",
    6: "VIVID",
    7: "CLUB_1",
    8: "CLUB_2",
  });

  RekordboxAnlz.CueEntryType = Object.freeze({
    MEMORY_CUE: 1,
    LOOP: 2,

    1: "MEMORY_CUE",
    2: "LOOP",
  });

  RekordboxAnlz.SectionTags = Object.freeze({
    CUES_2: 1346588466,
    CUES: 1346588482,
    PATH: 1347441736,
    BEAT_GRID: 1347507290,
    SONG_STRUCTURE: 1347638089,
    VBR: 1347830354,
    WAVE_PREVIEW: 1347895638,
    WAVE_TINY: 1347900978,
    WAVE_SCROLL: 1347900979,
    WAVE_COLOR_PREVIEW: 1347900980,
    WAVE_COLOR_SCROLL: 1347900981,
    WAVE_3BAND_PREVIEW: 1347900982,
    WAVE_3BAND_SCROLL: 1347900983,

    1346588466: "CUES_2",
    1346588482: "CUES",
    1347441736: "PATH",
    1347507290: "BEAT_GRID",
    1347638089: "SONG_STRUCTURE",
    1347830354: "VBR",
    1347895638: "WAVE_PREVIEW",
    1347900978: "WAVE_TINY",
    1347900979: "WAVE_SCROLL",
    1347900980: "WAVE_COLOR_PREVIEW",
    1347900981: "WAVE_COLOR_SCROLL",
    1347900982: "WAVE_3BAND_PREVIEW",
    1347900983: "WAVE_3BAND_SCROLL",
  });

  RekordboxAnlz.TrackMood = Object.freeze({
    HIGH: 1,
    MID: 2,
    LOW: 3,

    1: "HIGH",
    2: "MID",
    3: "LOW",
  });

  RekordboxAnlz.MoodMidPhrase = Object.freeze({
    INTRO: 1,
    VERSE_1: 2,
    VERSE_2: 3,
    VERSE_3: 4,
    VERSE_4: 5,
    VERSE_5: 6,
    VERSE_6: 7,
    BRIDGE: 8,
    CHORUS: 9,
    OUTRO: 10,

    1: "INTRO",
    2: "VERSE_1",
    3: "VERSE_2",
    4: "VERSE_3",
    5: "VERSE_4",
    6: "VERSE_5",
    7: "VERSE_6",
    8: "BRIDGE",
    9: "CHORUS",
    10: "OUTRO",
  });

  RekordboxAnlz.MoodLowPhrase = Object.freeze({
    INTRO: 1,
    VERSE_1: 2,
    VERSE_1B: 3,
    VERSE_1C: 4,
    VERSE_2: 5,
    VERSE_2B: 6,
    VERSE_2C: 7,
    BRIDGE: 8,
    CHORUS: 9,
    OUTRO: 10,

    1: "INTRO",
    2: "VERSE_1",
    3: "VERSE_1B",
    4: "VERSE_1C",
    5: "VERSE_2",
    6: "VERSE_2B",
    7: "VERSE_2C",
    8: "BRIDGE",
    9: "CHORUS",
    10: "OUTRO",
  });

  function RekordboxAnlz(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  RekordboxAnlz.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [80, 77, 65, 73]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([80, 77, 65, 73], this.magic, this._io, "/seq/0");
    }
    this.lenHeader = this._io.readU4be();
    this.lenFile = this._io.readU4be();
    this._unnamed3 = this._io.readBytes((this.lenHeader - this._io.pos));
    this.sections = [];
    var i = 0;
    while (!this._io.isEof()) {
      this.sections.push(new TaggedSection(this._io, this, this._root));
      i++;
    }
  }

  /**
   * The minimalist CDJ-3000 waveform image suitable for scrolling along
   * as a track plays on newer high-resolution hardware.
   */

  var Wave3bandScrollTag = RekordboxAnlz.Wave3bandScrollTag = (function() {
    function Wave3bandScrollTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Wave3bandScrollTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU4be();
      this._unnamed2 = this._io.readU4be();
      this.entries = this._io.readBytes((this.lenEntries * this.lenEntryBytes));
    }

    /**
     * The size of each entry, in bytes. Seems to always be 3.
     */

    /**
     * The number of columns of waveform data (this matches the
     * non-color waveform length.
     */

    return Wave3bandScrollTag;
  })();

  var PhraseMid = RekordboxAnlz.PhraseMid = (function() {
    function PhraseMid(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PhraseMid.prototype._read = function() {
      this.id = this._io.readU2be();
    }

    return PhraseMid;
  })();

  /**
   * Stores the file path of the audio file to which this analysis
   * applies.
   */

  var PathTag = RekordboxAnlz.PathTag = (function() {
    function PathTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PathTag.prototype._read = function() {
      this.lenPath = this._io.readU4be();
      if (this.lenPath > 1) {
        this.path = KaitaiStream.bytesToStr(this._io.readBytes((this.lenPath - 2)), "utf-16be");
      }
    }

    return PathTag;
  })();

  /**
   * Stores a waveform preview image suitable for display above
   * the touch strip for jumping to a track position.
   */

  var WavePreviewTag = RekordboxAnlz.WavePreviewTag = (function() {
    function WavePreviewTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    WavePreviewTag.prototype._read = function() {
      this.lenData = this._io.readU4be();
      this._unnamed1 = this._io.readU4be();
      if (this._parent.lenTag > this._parent.lenHeader) {
        this.data = this._io.readBytes(this.lenData);
      }
    }

    /**
     * The length, in bytes, of the preview data itself. This is
     * slightly redundant because it can be computed from the
     * length of the tag.
     */

    /**
     * The actual bytes of the waveform preview.
     */

    return WavePreviewTag;
  })();

  /**
   * Holds a list of all the beats found within the track, recording
   * their bar position, the time at which they occur, and the tempo
   * at that point.
   */

  var BeatGridTag = RekordboxAnlz.BeatGridTag = (function() {
    function BeatGridTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    BeatGridTag.prototype._read = function() {
      this._unnamed0 = this._io.readU4be();
      this._unnamed1 = this._io.readU4be();
      this.numBeats = this._io.readU4be();
      this.beats = [];
      for (var i = 0; i < this.numBeats; i++) {
        this.beats.push(new BeatGridBeat(this._io, this, this._root));
      }
    }

    /**
     * The number of beat entries which follow.
     */

    /**
     * The entries of the beat grid.
     */

    return BeatGridTag;
  })();

  /**
   * Stores the rest of the song structure tag, which can only be
   * parsed after unmasking.
   */

  var SongStructureBody = RekordboxAnlz.SongStructureBody = (function() {
    function SongStructureBody(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SongStructureBody.prototype._read = function() {
      this.mood = this._io.readU2be();
      this._unnamed1 = this._io.readBytes(6);
      this.endBeat = this._io.readU2be();
      this._unnamed3 = this._io.readBytes(2);
      this.bank = this._io.readU1();
      this._unnamed5 = this._io.readBytes(1);
      this.entries = [];
      for (var i = 0; i < this._parent.lenEntries; i++) {
        this.entries.push(new SongStructureEntry(this._io, this, this._root));
      }
    }

    /**
     * The mood which rekordbox assigns the track as a whole during phrase analysis.
     */

    /**
     * The beat number at which the last phrase ends. The track may
     * continue after the last phrase ends. If this is the case, it will
     * mostly be silence.
     */

    /**
     * The stylistic bank which can be assigned to the track in rekordbox Lighting mode.
     */

    return SongStructureBody;
  })();

  /**
   * A larger, colorful waveform preview image suitable for display
   * above the touch strip for jumping to a track position on newer
   * high-resolution players.
   */

  var WaveColorPreviewTag = RekordboxAnlz.WaveColorPreviewTag = (function() {
    function WaveColorPreviewTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    WaveColorPreviewTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU4be();
      this._unnamed2 = this._io.readU4be();
      this.entries = this._io.readBytes((this.lenEntries * this.lenEntryBytes));
    }

    /**
     * The size of each entry, in bytes. Seems to always be 6.
     */

    /**
     * The number of waveform data points, each of which takes one
     * byte for each of six channels of information.
     */

    return WaveColorPreviewTag;
  })();

  var PhraseHigh = RekordboxAnlz.PhraseHigh = (function() {
    function PhraseHigh(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PhraseHigh.prototype._read = function() {
      this.id = this._io.readU2be();
    }

    return PhraseHigh;
  })();

  /**
   * A larger waveform image suitable for scrolling along as a track
   * plays.
   */

  var WaveScrollTag = RekordboxAnlz.WaveScrollTag = (function() {
    function WaveScrollTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    WaveScrollTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU4be();
      this._unnamed2 = this._io.readU4be();
      this.entries = this._io.readBytes((this.lenEntries * this.lenEntryBytes));
    }

    /**
     * The size of each entry, in bytes. Seems to always be 1.
     */

    /**
     * The number of waveform data points, each of which takes one
     * byte.
     */

    return WaveScrollTag;
  })();

  /**
   * Stores the song structure, also known as phrases (intro, verse,
   * bridge, chorus, up, down, outro).
   */

  var SongStructureTag = RekordboxAnlz.SongStructureTag = (function() {
    function SongStructureTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SongStructureTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU2be();
      this._raw__raw_body = this._io.readBytesFull();
      this._raw_body = KaitaiStream.processXorMany(this._raw__raw_body, (this.isMasked ? this.mask : [0]));
      var _io__raw_body = new KaitaiStream(this._raw_body);
      this.body = new SongStructureBody(_io__raw_body, this, this._root);
    }
    Object.defineProperty(SongStructureTag.prototype, 'c', {
      get: function() {
        if (this._m_c !== undefined)
          return this._m_c;
        this._m_c = this.lenEntries;
        return this._m_c;
      }
    });
    Object.defineProperty(SongStructureTag.prototype, 'mask', {
      get: function() {
        if (this._m_mask !== undefined)
          return this._m_mask;
        this._m_mask = new Uint8Array([(203 + this.c), (225 + this.c), (238 + this.c), (250 + this.c), (229 + this.c), (238 + this.c), (173 + this.c), (238 + this.c), (233 + this.c), (210 + this.c), (233 + this.c), (235 + this.c), (225 + this.c), (233 + this.c), (243 + this.c), (232 + this.c), (233 + this.c), (244 + this.c), (225 + this.c)]);
        return this._m_mask;
      }
    });

    /**
     * This is a way to tell whether the rest of the tag has been masked. The value is supposed
     * to range from 1 to 3, but in masked files it will be much larger.
     */
    Object.defineProperty(SongStructureTag.prototype, 'rawMood', {
      get: function() {
        if (this._m_rawMood !== undefined)
          return this._m_rawMood;
        var _pos = this._io.pos;
        this._io.seek(6);
        this._m_rawMood = this._io.readU2be();
        this._io.seek(_pos);
        return this._m_rawMood;
      }
    });
    Object.defineProperty(SongStructureTag.prototype, 'isMasked', {
      get: function() {
        if (this._m_isMasked !== undefined)
          return this._m_isMasked;
        this._m_isMasked = this.rawMood > 20;
        return this._m_isMasked;
      }
    });

    /**
     * The size of each entry, in bytes. Seems to always be 24.
     */

    /**
     * The number of phrases.
     */

    /**
     * The rest of the tag, which needs to be unmasked before it
     * can be parsed.
     */

    return SongStructureTag;
  })();

  /**
   * A cue extended list entry. Can either describe a memory cue or a
   * loop.
   */

  var CueExtendedEntry = RekordboxAnlz.CueExtendedEntry = (function() {
    function CueExtendedEntry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CueExtendedEntry.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [80, 67, 80, 50]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([80, 67, 80, 50], this.magic, this._io, "/types/cue_extended_entry/seq/0");
      }
      this.lenHeader = this._io.readU4be();
      this.lenEntry = this._io.readU4be();
      this.hotCue = this._io.readU4be();
      this.type = this._io.readU1();
      this._unnamed5 = this._io.readBytes(3);
      this.time = this._io.readU4be();
      this.loopTime = this._io.readU4be();
      this.colorId = this._io.readU1();
      this._unnamed9 = this._io.readBytes(7);
      this.loopNumerator = this._io.readU2be();
      this.loopDenominator = this._io.readU2be();
      if (this.lenEntry > 43) {
        this.lenComment = this._io.readU4be();
      }
      if (this.lenEntry > 43) {
        this.comment = KaitaiStream.bytesToStr(this._io.readBytes(this.lenComment), "utf-16be");
      }
      if ((this.lenEntry - this.lenComment) > 44) {
        this.colorCode = this._io.readU1();
      }
      if ((this.lenEntry - this.lenComment) > 45) {
        this.colorRed = this._io.readU1();
      }
      if ((this.lenEntry - this.lenComment) > 46) {
        this.colorGreen = this._io.readU1();
      }
      if ((this.lenEntry - this.lenComment) > 47) {
        this.colorBlue = this._io.readU1();
      }
      if ((this.lenEntry - this.lenComment) > 48) {
        this._unnamed18 = this._io.readBytes(((this.lenEntry - 48) - this.lenComment));
      }
    }

    /**
     * Identifies this as an extended cue list entry (cue point).
     */

    /**
     * If zero, this is an ordinary memory cue, otherwise this a
     * hot cue with the specified number.
     */

    /**
     * Indicates whether this is a regular cue point or a loop.
     */

    /**
     * The position, in milliseconds, at which the cue point lies
     * in the track.
     */

    /**
     * The position, in milliseconds, at which the player loops
     * back to the cue time if this is a loop.
     */

    /**
     * References a row in the colors table if this is a memory cue or loop
     * and has been assigned a color.
     */

    /**
     * The numerator of the loop length in beats.
     * Zero if the loop is not quantized.
     */

    /**
     * The denominator of the loop length in beats.
     * Zero if the loop is not quantized.
     */

    /**
     * The comment assigned to this cue by the DJ, if any, with a trailing NUL.
     */

    /**
     * A lookup value for a color table? We use this to index to the hot cue colors shown in rekordbox.
     */

    /**
     * The red component of the hot cue color to be displayed.
     */

    /**
     * The green component of the hot cue color to be displayed.
     */

    /**
     * The blue component of the hot cue color to be displayed.
     */

    return CueExtendedEntry;
  })();

  /**
   * Stores an index allowing rapid seeking to particular times
   * within a variable-bitrate audio file.
   */

  var VbrTag = RekordboxAnlz.VbrTag = (function() {
    function VbrTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VbrTag.prototype._read = function() {
      this._unnamed0 = this._io.readU4be();
      this.index = [];
      for (var i = 0; i < 400; i++) {
        this.index.push(this._io.readU4be());
      }
    }

    return VbrTag;
  })();

  /**
   * A song structure entry, represents a single phrase.
   */

  var SongStructureEntry = RekordboxAnlz.SongStructureEntry = (function() {
    function SongStructureEntry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SongStructureEntry.prototype._read = function() {
      this.index = this._io.readU2be();
      this.beat = this._io.readU2be();
      switch (this._parent.mood) {
      case RekordboxAnlz.TrackMood.HIGH:
        this.kind = new PhraseHigh(this._io, this, this._root);
        break;
      case RekordboxAnlz.TrackMood.MID:
        this.kind = new PhraseMid(this._io, this, this._root);
        break;
      case RekordboxAnlz.TrackMood.LOW:
        this.kind = new PhraseLow(this._io, this, this._root);
        break;
      default:
        this.kind = new PhraseMid(this._io, this, this._root);
        break;
      }
      this._unnamed3 = this._io.readBytes(1);
      this.k1 = this._io.readU1();
      this._unnamed5 = this._io.readBytes(1);
      this.k2 = this._io.readU1();
      this._unnamed7 = this._io.readBytes(1);
      this.b = this._io.readU1();
      this.beat2 = this._io.readU2be();
      this.beat3 = this._io.readU2be();
      this.beat4 = this._io.readU2be();
      this._unnamed12 = this._io.readBytes(1);
      this.k3 = this._io.readU1();
      this._unnamed14 = this._io.readBytes(1);
      this.fill = this._io.readU1();
      this.beatFill = this._io.readU2be();
    }

    /**
     * The absolute number of the phrase, starting at one.
     */

    /**
     * The beat number at which the phrase starts.
     */

    /**
     * The kind of phrase as displayed in rekordbox.
     */

    /**
     * One of three flags that identify phrase kind variants in high-mood tracks.
     */

    /**
     * One of three flags that identify phrase kind variants in high-mood tracks.
     */

    /**
     * Flags how many more beat numbers are in a high-mood "Up 3" phrase.
     */

    /**
     * Extra beat number (falling within phrase) always present in high-mood "Up 3" phrases.
     */

    /**
     * Extra beat number (falling within phrase, larger than beat2)
     * present in high-mood "Up 3" phrases when b has value 1.
     */

    /**
     * Extra beat number (falling within phrase, larger than beat3)
     * present in high-mood "Up 3" phrases when b has value 1.
     */

    /**
     * One of three flags that identify phrase kind variants in high-mood tracks.
     */

    /**
     * If nonzero, fill-in is present at end of phrase.
     */

    /**
     * The beat number at which fill-in starts.
     */

    return SongStructureEntry;
  })();

  /**
   * A cue list entry. Can either represent a memory cue or a loop.
   */

  var CueEntry = RekordboxAnlz.CueEntry = (function() {
    function CueEntry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CueEntry.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [80, 67, 80, 84]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([80, 67, 80, 84], this.magic, this._io, "/types/cue_entry/seq/0");
      }
      this.lenHeader = this._io.readU4be();
      this.lenEntry = this._io.readU4be();
      this.hotCue = this._io.readU4be();
      this.status = this._io.readU4be();
      this._unnamed5 = this._io.readU4be();
      this.orderFirst = this._io.readU2be();
      this.orderLast = this._io.readU2be();
      this.type = this._io.readU1();
      this._unnamed9 = this._io.readBytes(3);
      this.time = this._io.readU4be();
      this.loopTime = this._io.readU4be();
      this._unnamed12 = this._io.readBytes(16);
    }

    /**
     * Identifies this as a cue list entry (cue point).
     */

    /**
     * If zero, this is an ordinary memory cue, otherwise this a
     * hot cue with the specified number.
     */

    /**
     * Indicates if this is an active loop.
     */

    /**
     * @flesniak says: "0xffff for first cue, 0,1,3 for next"
     */

    /**
     * @flesniak says: "1,2,3 for first, second, third cue, 0xffff for last"
     */

    /**
     * Indicates whether this is a memory cue or a loop.
     */

    /**
     * The position, in milliseconds, at which the cue point lies
     * in the track.
     */

    /**
     * The position, in milliseconds, at which the player loops
     * back to the cue time if this is a loop.
     */

    return CueEntry;
  })();

  /**
   * Describes an individual beat in a beat grid.
   */

  var BeatGridBeat = RekordboxAnlz.BeatGridBeat = (function() {
    function BeatGridBeat(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    BeatGridBeat.prototype._read = function() {
      this.beatNumber = this._io.readU2be();
      this.tempo = this._io.readU2be();
      this.time = this._io.readU4be();
    }

    /**
     * The position of the beat within its musical bar, where beat 1
     * is the down beat.
     */

    /**
     * The tempo at the time of this beat, in beats per minute,
     * multiplied by 100.
     */

    /**
     * The time, in milliseconds, at which this beat occurs when
     * the track is played at normal (100%) pitch.
     */

    return BeatGridBeat;
  })();

  /**
   * A variation of cue_tag which was introduced with the nxs2 line,
   * and adds descriptive names. (Still comes in two forms, either
   * holding memory cues and loop points, or holding hot cues and
   * loop points.) Also includes hot cues D through H and color assignment.
   */

  var CueExtendedTag = RekordboxAnlz.CueExtendedTag = (function() {
    function CueExtendedTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CueExtendedTag.prototype._read = function() {
      this.type = this._io.readU4be();
      this.numCues = this._io.readU2be();
      this._unnamed2 = this._io.readBytes(2);
      this.cues = [];
      for (var i = 0; i < this.numCues; i++) {
        this.cues.push(new CueExtendedEntry(this._io, this, this._root));
      }
    }

    /**
     * Identifies whether this tag stores ordinary or hot cues.
     */

    /**
     * The length of the cue comment list.
     */

    return CueExtendedTag;
  })();

  var PhraseLow = RekordboxAnlz.PhraseLow = (function() {
    function PhraseLow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PhraseLow.prototype._read = function() {
      this.id = this._io.readU2be();
    }

    return PhraseLow;
  })();

  var UnknownTag = RekordboxAnlz.UnknownTag = (function() {
    function UnknownTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    UnknownTag.prototype._read = function() {
    }

    return UnknownTag;
  })();

  /**
   * A type-tagged file section, identified by a four-byte magic
   * sequence, with a header specifying its length, and whose payload
   * is determined by the type tag.
   */

  var TaggedSection = RekordboxAnlz.TaggedSection = (function() {
    function TaggedSection(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TaggedSection.prototype._read = function() {
      this.fourcc = this._io.readS4be();
      this.lenHeader = this._io.readU4be();
      this.lenTag = this._io.readU4be();
      switch (this.fourcc) {
      case RekordboxAnlz.SectionTags.WAVE_COLOR_SCROLL:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new WaveColorScrollTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_SCROLL:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new WaveScrollTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.VBR:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new VbrTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_3BAND_SCROLL:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new Wave3bandScrollTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.CUES_2:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new CueExtendedTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.CUES:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new CueTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.SONG_STRUCTURE:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new SongStructureTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.BEAT_GRID:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new BeatGridTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_PREVIEW:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new WavePreviewTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_3BAND_PREVIEW:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new Wave3bandPreviewTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_COLOR_PREVIEW:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new WaveColorPreviewTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.PATH:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new PathTag(_io__raw_body, this, this._root);
        break;
      case RekordboxAnlz.SectionTags.WAVE_TINY:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new WavePreviewTag(_io__raw_body, this, this._root);
        break;
      default:
        this._raw_body = this._io.readBytes((this.lenTag - 12));
        var _io__raw_body = new KaitaiStream(this._raw_body);
        this.body = new UnknownTag(_io__raw_body, this, this._root);
        break;
      }
    }

    /**
     * A tag value indicating what kind of section this is.
     */

    /**
     * The size, in bytes, of the header portion of the tag.
     */

    /**
     * The size, in bytes, of this entire tag, counting the header.
     */

    return TaggedSection;
  })();

  /**
   * The minimalist CDJ-3000 waveform preview image suitable for display
   * above the touch strip for jumping to a track position.
   */

  var Wave3bandPreviewTag = RekordboxAnlz.Wave3bandPreviewTag = (function() {
    function Wave3bandPreviewTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Wave3bandPreviewTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU4be();
      this.entries = this._io.readBytes((this.lenEntries * this.lenEntryBytes));
    }

    /**
     * The size of each entry, in bytes. Seems to always be 3.
     */

    /**
     * The number of waveform data points, each of which takes one
     * byte for each of six channels of information.
     */

    return Wave3bandPreviewTag;
  })();

  /**
   * A larger, colorful waveform image suitable for scrolling along
   * as a track plays on newer high-resolution hardware. Also
   * contains a higher-resolution blue/white waveform.
   */

  var WaveColorScrollTag = RekordboxAnlz.WaveColorScrollTag = (function() {
    function WaveColorScrollTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    WaveColorScrollTag.prototype._read = function() {
      this.lenEntryBytes = this._io.readU4be();
      this.lenEntries = this._io.readU4be();
      this._unnamed2 = this._io.readU4be();
      this.entries = this._io.readBytes((this.lenEntries * this.lenEntryBytes));
    }

    /**
     * The size of each entry, in bytes. Seems to always be 2.
     */

    /**
     * The number of columns of waveform data (this matches the
     * non-color waveform length.
     */

    return WaveColorScrollTag;
  })();

  /**
   * Stores either a list of ordinary memory cues and loop points, or
   * a list of hot cues and loop points.
   */

  var CueTag = RekordboxAnlz.CueTag = (function() {
    function CueTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CueTag.prototype._read = function() {
      this.type = this._io.readU4be();
      this._unnamed1 = this._io.readBytes(2);
      this.numCues = this._io.readU2be();
      this.memoryCount = this._io.readU4be();
      this.cues = [];
      for (var i = 0; i < this.numCues; i++) {
        this.cues.push(new CueEntry(this._io, this, this._root));
      }
    }

    /**
     * Identifies whether this tag stores ordinary or hot cues.
     */

    /**
     * The length of the cue list.
     */

    /**
     * Unsure what this means.
     */

    return CueTag;
  })();

  /**
   * Identifies this as an analysis file.
   */

  /**
   * The number of bytes of this header section.
   */

  /**
   * The number of bytes in the entire file.
   */

  /**
   * The remainder of the file is a sequence of type-tagged sections,
   * identified by a four-byte magic sequence.
   */

  return RekordboxAnlz;
})();
return RekordboxAnlz;
}));
