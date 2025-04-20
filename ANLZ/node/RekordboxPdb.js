// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.RekordboxPdb = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
/**
 * This is a relational database format designed to be efficiently used
 * by very low power devices (there were deployments on 16 bit devices
 * with 32K of RAM). Today you are most likely to encounter it within
 * the Pioneer Professional DJ ecosystem, because it is the format that
 * their rekordbox software uses to write USB and SD media which can be
 * mounted in DJ controllers and used to play and mix music.
 * 
 * It has been reverse-engineered to facilitate sophisticated
 * integrations with light and laser shows, videos, and other musical
 * instruments, by supporting deep knowledge of what is playing and
 * what is coming next through monitoring the network communications of
 * the players.
 * 
 * The file is divided into fixed-size blocks. The first block has a
 * header that establishes the block size, and lists the tables
 * available in the database, identifying their types and the index of
 * the first of the series of linked pages that make up that table.
 * 
 * Each table is made up of a series of rows which may be spread across
 * any number of pages. The pages start with a header describing the
 * page and linking to the next page. The rest of the page is used as a
 * heap: rows are scattered around it, and located using an index
 * structure that builds backwards from the end of the page. Each row
 * of a given type has a fixed size structure which links to any
 * variable-sized strings by their offsets within the page.
 * 
 * As changes are made to the table, some records may become unused,
 * and there may be gaps within the heap that are too small to be used
 * by other data. There is a bit map in the row index that identifies
 * which rows are actually present. Rows that are not present must be
 * ignored: they do not contain valid (or even necessarily well-formed)
 * data.
 * 
 * The majority of the work in reverse-engineering this format was
 * performed by @henrybetts and @flesniak, for which I am hugely
 * grateful. @GreyCat helped me learn the intricacies (and best
 * practices) of Kaitai far faster than I would have managed on my own.
 * @see {@link https://github.com/Deep-Symmetry/crate-digger/blob/master/doc/Analysis.pdf|Source}
 */

var RekordboxPdb = (function() {
  RekordboxPdb.PageType = Object.freeze({
    TRACKS: 0,
    GENRES: 1,
    ARTISTS: 2,
    ALBUMS: 3,
    LABELS: 4,
    KEYS: 5,
    COLORS: 6,
    PLAYLIST_TREE: 7,
    PLAYLIST_ENTRIES: 8,
    UNKNOWN_9: 9,
    UNKNOWN_10: 10,
    HISTORY_PLAYLISTS: 11,
    HISTORY_ENTRIES: 12,
    ARTWORK: 13,
    UNKNOWN_14: 14,
    UNKNOWN_15: 15,
    COLUMNS: 16,
    UNKNOWN_17: 17,
    UNKNOWN_18: 18,
    HISTORY: 19,

    0: "TRACKS",
    1: "GENRES",
    2: "ARTISTS",
    3: "ALBUMS",
    4: "LABELS",
    5: "KEYS",
    6: "COLORS",
    7: "PLAYLIST_TREE",
    8: "PLAYLIST_ENTRIES",
    9: "UNKNOWN_9",
    10: "UNKNOWN_10",
    11: "HISTORY_PLAYLISTS",
    12: "HISTORY_ENTRIES",
    13: "ARTWORK",
    14: "UNKNOWN_14",
    15: "UNKNOWN_15",
    16: "COLUMNS",
    17: "UNKNOWN_17",
    18: "UNKNOWN_18",
    19: "HISTORY",
  });

  RekordboxPdb.PageTypeExt = Object.freeze({
    UNKNOWN_0: 0,
    UNKNOWN_1: 1,
    UNKNOWN_2: 2,
    TAGS: 3,
    TAG_TRACKS: 4,
    UNKNOWN_5: 5,
    UNKNOWN_6: 6,
    UNKNOWN_7: 7,
    UNKNOWN_8: 8,

    0: "UNKNOWN_0",
    1: "UNKNOWN_1",
    2: "UNKNOWN_2",
    3: "TAGS",
    4: "TAG_TRACKS",
    5: "UNKNOWN_5",
    6: "UNKNOWN_6",
    7: "UNKNOWN_7",
    8: "UNKNOWN_8",
  });

  function RekordboxPdb(_io, _parent, _root, isExt) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.isExt = isExt;

    this._read();
  }
  RekordboxPdb.prototype._read = function() {
    this._unnamed0 = this._io.readU4le();
    this.lenPage = this._io.readU4le();
    this.numTables = this._io.readU4le();
    this.nextUnusedPage = this._io.readU4le();
    this._unnamed4 = this._io.readU4le();
    this.sequence = this._io.readU4le();
    this.gap = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.gap, [0, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.gap, this._io, "/seq/6");
    }
    this.tables = [];
    for (var i = 0; i < this.numTables; i++) {
      this.tables.push(new Table(this._io, this, this._root));
    }
  }

  /**
   * A variable length string which can be stored in a variety of
   * different encodings.
   */

  var DeviceSqlString = RekordboxPdb.DeviceSqlString = (function() {
    function DeviceSqlString(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    DeviceSqlString.prototype._read = function() {
      this.lengthAndKind = this._io.readU1();
      switch (this.lengthAndKind) {
      case 64:
        this.body = new DeviceSqlLongAscii(this._io, this, this._root);
        break;
      case 144:
        this.body = new DeviceSqlLongUtf16le(this._io, this, this._root);
        break;
      default:
        this.body = new DeviceSqlShortAscii(this._io, this, this._root, this.lengthAndKind);
        break;
      }
    }

    /**
     * Mangled length of an ordinary ASCII string if odd, or a flag
     * indicating another encoding with a longer length value to
     * follow.
     */

    return DeviceSqlString;
  })();

  /**
   * A row that holds a history playlist ID and name, linking to
   * the track IDs captured during a performance on the player.
   */

  var HistoryPlaylistRow = RekordboxPdb.HistoryPlaylistRow = (function() {
    function HistoryPlaylistRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HistoryPlaylistRow.prototype._read = function() {
      this.id = this._io.readU4le();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this history playlist can
     * be requested.
     */

    /**
     * The variable-length string naming the playlist.
     */

    return HistoryPlaylistRow;
  })();

  /**
   * A row that holds a playlist name, ID, indication of whether it
   * is an ordinary playlist or a folder of other playlists, a link
   * to its parent folder, and its sort order.
   */

  var PlaylistTreeRow = RekordboxPdb.PlaylistTreeRow = (function() {
    function PlaylistTreeRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PlaylistTreeRow.prototype._read = function() {
      this.parentId = this._io.readU4le();
      this._unnamed1 = this._io.readBytes(4);
      this.sortOrder = this._io.readU4le();
      this.id = this._io.readU4le();
      this.rawIsFolder = this._io.readU4le();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }
    Object.defineProperty(PlaylistTreeRow.prototype, 'isFolder', {
      get: function() {
        if (this._m_isFolder !== undefined)
          return this._m_isFolder;
        this._m_isFolder = this.rawIsFolder != 0;
        return this._m_isFolder;
      }
    });

    /**
     * The ID of the `playlist_tree_row` in which this one can be
     * found, or `0` if this playlist exists at the root level.
     */

    /**
     * The order in which the entries of this playlist are sorted.
     */

    /**
     * The unique identifier by which this playlist or folder can
     * be requested and linked from other rows.
     */

    /**
     * Has a non-zero value if this is actually a folder rather
     * than a playlist.
     */

    /**
     * The variable-length string naming the playlist.
     */

    return PlaylistTreeRow;
  })();

  /**
   * A row that holds a color name and the associated ID.
   */

  var ColorRow = RekordboxPdb.ColorRow = (function() {
    function ColorRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ColorRow.prototype._read = function() {
      this._unnamed0 = this._io.readBytes(5);
      this.id = this._io.readU2le();
      this._unnamed2 = this._io.readU1();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this color can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * The variable-length string naming the color.
     */

    return ColorRow;
  })();

  /**
   * An ASCII-encoded string up to 127 bytes long.
   */

  var DeviceSqlShortAscii = RekordboxPdb.DeviceSqlShortAscii = (function() {
    function DeviceSqlShortAscii(_io, _parent, _root, lengthAndKind) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this.lengthAndKind = lengthAndKind;

      this._read();
    }
    DeviceSqlShortAscii.prototype._read = function() {
      this.text = KaitaiStream.bytesToStr(this._io.readBytes((this.length - 1)), "ASCII");
    }

    /**
     * the length extracted of the entire device_sql_short_ascii type
     */
    Object.defineProperty(DeviceSqlShortAscii.prototype, 'length', {
      get: function() {
        if (this._m_length !== undefined)
          return this._m_length;
        this._m_length = (this.lengthAndKind >>> 1);
        return this._m_length;
      }
    });

    /**
     * The content of the string.
     */

    /**
     * Contains the actual length, incremented, doubled, and
     * incremented again. Go figure.
     */

    return DeviceSqlShortAscii;
  })();

  /**
   * A row that holds an album name and ID.
   */

  var AlbumRow = RekordboxPdb.AlbumRow = (function() {
    function AlbumRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    AlbumRow.prototype._read = function() {
      this._unnamed0 = this._io.readU2le();
      this.indexShift = this._io.readU2le();
      this._unnamed2 = this._io.readU4le();
      this.artistId = this._io.readU4le();
      this.id = this._io.readU4le();
      this._unnamed5 = this._io.readU4le();
      this._unnamed6 = this._io.readU1();
      this.ofsName = this._io.readU1();
    }

    /**
     * The name of this album.
     */
    Object.defineProperty(AlbumRow.prototype, 'name', {
      get: function() {
        if (this._m_name !== undefined)
          return this._m_name;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsName));
        this._m_name = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_name;
      }
    });

    /**
     * Some kind of magic word? Usually 0x80, 0x00.
     */

    /**
     * TODO name from @flesniak, but what does it mean?
     */

    /**
     * Identifies the artist associated with the album.
     */

    /**
     * The unique identifier by which this album can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * @flesniak says: "always 0x03, maybe an unindexed empty string"
     */

    /**
     * The location of the variable-length name string, relative to
     * the start of this row.
     */

    return AlbumRow;
  })();

  /**
   * A table page, consisting of a short header describing the
   * content of the page and linking to the next page, followed by a
   * heap in which row data is found. At the end of the page there is
   * an index which locates all rows present in the heap via their
   * offsets past the end of the page header.
   */

  var Page = RekordboxPdb.Page = (function() {
    function Page(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Page.prototype._read = function() {
      this.gap = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.gap, [0, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.gap, this._io, "/types/page/seq/0");
      }
      this.pageIndex = this._io.readU4le();
      if (!(this._root.isExt)) {
        this.type = this._io.readU4le();
      }
      if (this._root.isExt) {
        this.typeExt = this._io.readU4le();
      }
      this.nextPage = new PageRef(this._io, this, this._root);
      this._unnamed5 = this._io.readU4le();
      this._unnamed6 = this._io.readBytes(4);
      this.numRowsSmall = this._io.readU1();
      this._unnamed8 = this._io.readU1();
      this._unnamed9 = this._io.readU1();
      this.pageFlags = this._io.readU1();
      this.freeSize = this._io.readU2le();
      this.usedSize = this._io.readU2le();
      this._unnamed13 = this._io.readU2le();
      this.numRowsLarge = this._io.readU2le();
      this._unnamed15 = this._io.readU2le();
      this._unnamed16 = this._io.readU2le();
      if (false) {
        this.heap = this._io.readBytesFull();
      }
    }

    /**
     * The number of rows that have ever been allocated on this
     * page (controls the number of row groups there are, but some
     * entries in each group may not be marked as present in the
     * table due to deletion or updates).
     */
    Object.defineProperty(Page.prototype, 'numRows', {
      get: function() {
        if (this._m_numRows !== undefined)
          return this._m_numRows;
        this._m_numRows = ( ((this.numRowsLarge > this.numRowsSmall) && (this.numRowsLarge != 8191))  ? this.numRowsLarge : this.numRowsSmall);
        return this._m_numRows;
      }
    });

    /**
     * The number of row groups that are present in the index. Each
     * group can hold up to sixteen rows, but `row_present_flags`
     * must be consulted to determine whether each is valid.
     */
    Object.defineProperty(Page.prototype, 'numRowGroups', {
      get: function() {
        if (this._m_numRowGroups !== undefined)
          return this._m_numRowGroups;
        this._m_numRowGroups = (Math.floor((this.numRows - 1) / 16) + 1);
        return this._m_numRowGroups;
      }
    });

    /**
     * The actual row groups making up the row index. Each group
     * can hold up to sixteen rows. Non-data pages do not have
     * actual rows, and attempting to parse them can crash.
     */
    Object.defineProperty(Page.prototype, 'rowGroups', {
      get: function() {
        if (this._m_rowGroups !== undefined)
          return this._m_rowGroups;
        if (this.isDataPage) {
          this._m_rowGroups = [];
          for (var i = 0; i < this.numRowGroups; i++) {
            this._m_rowGroups.push(new RowGroup(this._io, this, this._root, i));
          }
        }
        return this._m_rowGroups;
      }
    });
    Object.defineProperty(Page.prototype, 'heapPos', {
      get: function() {
        if (this._m_heapPos !== undefined)
          return this._m_heapPos;
        this._m_heapPos = this._io.pos;
        return this._m_heapPos;
      }
    });
    Object.defineProperty(Page.prototype, 'isDataPage', {
      get: function() {
        if (this._m_isDataPage !== undefined)
          return this._m_isDataPage;
        this._m_isDataPage = (this.pageFlags & 64) == 0;
        return this._m_isDataPage;
      }
    });

    /**
     * Only exposed until
     * https://github.com/kaitai-io/kaitai_struct/issues/825 can be
     * fixed.
     */

    /**
     * Matches the index we used to look up the page, sanity check?
     */

    /**
     * Identifies the type of information stored in the rows of this page.
     */

    /**
     * Identifies the type of information stored in the rows of this page in an exportExt.pdb file.
     */

    /**
     * Index of the next page containing this type of rows. Points past
     * the end of the file if there are no more.
     */

    /**
     * @flesniak said: "sequence number (0->1: 8->13, 1->2: 22, 2->3: 27)"
     */

    /**
     * Holds the value used for `num_rows` (see below) unless
     * `num_rows_large` is larger (but not equal to `0x1fff`). This
     * seems like some strange mechanism to deal with the fact that
     * lots of tiny entries, such as are found in the
     * `playlist_entries` table, are too big to count with a single
     * byte. But why not just always use `num_rows_large`, then?
     */

    /**
     * @flesniak said: "a bitmask (1st track: 32)"
     */

    /**
     * @flesniak said: "often 0, sometimes larger, esp. for pages
     * with high real_entry_count (e.g. 12 for 101 entries)"
     */

    /**
     * @flesniak said: "strange pages: 0x44, 0x64; otherwise seen: 0x24, 0x34"
     */

    /**
     * Unused space (in bytes) in the page heap, excluding the row
     * index at end of page.
     */

    /**
     * The number of bytes that are in use in the page heap.
     */

    /**
     * @flesniak said: "(0->1: 2)"
     */

    /**
     * Holds the value used for `num_rows` (as described above)
     * when that is too large to fit into `num_rows_small`, and
     * that situation seems to be indicated when this value is
     * larger than `num_rows_small`, but not equal to `0x1fff`.
     * This seems like some strange mechanism to deal with the fact
     * that lots of tiny entries, such as are found in the
     * `playlist_entries` table, are too big to count with a single
     * byte. But why not just always use this value, then?
     */

    /**
     * @flesniak said: "1004 for strange blocks, 0 otherwise"
     */

    /**
     * @flesniak said: "always 0 except 1 for history pages, num
     * entries for strange pages?"
     */

    return Page;
  })();

  /**
   * A row that associates a track and a tag (found only in exportExt.pdb files).
   */

  var TagTrackRow = RekordboxPdb.TagTrackRow = (function() {
    function TagTrackRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TagTrackRow.prototype._read = function() {
      this._unnamed0 = this._io.readU4le();
      this.trackId = this._io.readU4le();
      this.tagId = this._io.readU4le();
      this._unnamed3 = this._io.readU4le();
    }

    /**
     * Seems to always be zero.
     */

    /**
     * The ID of the track that has a tag assigned to it.
     */

    /**
     * The ID of the tag that has been assigned to a track.
     */

    /**
     * Seems to always be 0x03 0x00 0x00 0x00.
     */

    return TagTrackRow;
  })();

  /**
   * A group of row indices, which are built backwards from the end
   * of the page. Holds up to sixteen row offsets, along with a bit
   * mask that indicates whether each row is actually present in the
   * table.
   */

  var RowGroup = RekordboxPdb.RowGroup = (function() {
    function RowGroup(_io, _parent, _root, groupIndex) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this.groupIndex = groupIndex;

      this._read();
    }
    RowGroup.prototype._read = function() {
    }

    /**
     * The starting point of this group of row indices.
     */
    Object.defineProperty(RowGroup.prototype, 'base', {
      get: function() {
        if (this._m_base !== undefined)
          return this._m_base;
        this._m_base = (this._root.lenPage - (this.groupIndex * 36));
        return this._m_base;
      }
    });

    /**
     * Each bit specifies whether a particular row is present. The
     * low order bit corresponds to the first row in this index,
     * whose offset immediately precedes these flag bits. The
     * second bit corresponds to the row whose offset precedes
     * that, and so on.
     */
    Object.defineProperty(RowGroup.prototype, 'rowPresentFlags', {
      get: function() {
        if (this._m_rowPresentFlags !== undefined)
          return this._m_rowPresentFlags;
        var _pos = this._io.pos;
        this._io.seek((this.base - 4));
        this._m_rowPresentFlags = this._io.readU2le();
        this._io.seek(_pos);
        return this._m_rowPresentFlags;
      }
    });

    /**
     * The row offsets in this group.
     */
    Object.defineProperty(RowGroup.prototype, 'rows', {
      get: function() {
        if (this._m_rows !== undefined)
          return this._m_rows;
        this._m_rows = [];
        for (var i = 0; i < 16; i++) {
          this._m_rows.push(new RowRef(this._io, this, this._root, i));
        }
        return this._m_rows;
      }
    });

    /**
     * Identifies which group is being generated. They build backwards
     * from the end of the page.
     */

    return RowGroup;
  })();

  /**
   * A row that holds a genre name and the associated ID.
   */

  var GenreRow = RekordboxPdb.GenreRow = (function() {
    function GenreRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    GenreRow.prototype._read = function() {
      this.id = this._io.readU4le();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this genre can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * The variable-length string naming the genre.
     */

    return GenreRow;
  })();

  /**
   * A row that associates a track with a position in a history playlist.
   */

  var HistoryEntryRow = RekordboxPdb.HistoryEntryRow = (function() {
    function HistoryEntryRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HistoryEntryRow.prototype._read = function() {
      this.trackId = this._io.readU4le();
      this.playlistId = this._io.readU4le();
      this.entryIndex = this._io.readU4le();
    }

    /**
     * The track found at this position in the playlist.
     */

    /**
     * The history playlist to which this entry belongs.
     */

    /**
     * The position within the playlist represented by this entry.
     */

    return HistoryEntryRow;
  })();

  /**
   * A row that holds the path to an album art image file and the
   * associated artwork ID.
   */

  var ArtworkRow = RekordboxPdb.ArtworkRow = (function() {
    function ArtworkRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ArtworkRow.prototype._read = function() {
      this.id = this._io.readU4le();
      this.path = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this art can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * The variable-length file path string at which the art file
     * can be found.
     */

    return ArtworkRow;
  })();

  /**
   * An ASCII-encoded string preceded by a two-byte length field in a four-byte header.
   */

  var DeviceSqlLongAscii = RekordboxPdb.DeviceSqlLongAscii = (function() {
    function DeviceSqlLongAscii(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    DeviceSqlLongAscii.prototype._read = function() {
      this.length = this._io.readU2le();
      this._unnamed1 = this._io.readU1();
      this.text = KaitaiStream.bytesToStr(this._io.readBytes((this.length - 4)), "ASCII");
    }

    /**
     * Contains the length of the string in bytes.
     */

    /**
     * The content of the string.
     */

    return DeviceSqlLongAscii;
  })();

  /**
   * A row that holds an artist name and ID.
   */

  var ArtistRow = RekordboxPdb.ArtistRow = (function() {
    function ArtistRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ArtistRow.prototype._read = function() {
      this.subtype = this._io.readU2le();
      this.indexShift = this._io.readU2le();
      this.id = this._io.readU4le();
      this._unnamed3 = this._io.readU1();
      this.ofsNameNear = this._io.readU1();
    }

    /**
     * For names that might be further than 0xff bytes from the
     * start of this row, this holds a two-byte offset, and is
     * signalled by the subtype value.
     */
    Object.defineProperty(ArtistRow.prototype, 'ofsNameFar', {
      get: function() {
        if (this._m_ofsNameFar !== undefined)
          return this._m_ofsNameFar;
        if (this.subtype == 100) {
          var _pos = this._io.pos;
          this._io.seek((this._parent.rowBase + 10));
          this._m_ofsNameFar = this._io.readU2le();
          this._io.seek(_pos);
        }
        return this._m_ofsNameFar;
      }
    });

    /**
     * The name of this artist.
     */
    Object.defineProperty(ArtistRow.prototype, 'name', {
      get: function() {
        if (this._m_name !== undefined)
          return this._m_name;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + (this.subtype == 100 ? this.ofsNameFar : this.ofsNameNear)));
        this._m_name = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_name;
      }
    });

    /**
     * Usually 0x60, but 0x64 means we have a long name offset
     * embedded in the row.
     */

    /**
     * TODO name from @flesniak, but what does it mean?
     */

    /**
     * The unique identifier by which this artist can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * @flesniak says: "always 0x03, maybe an unindexed empty string"
     */

    /**
     * The location of the variable-length name string, relative to
     * the start of this row, unless subtype is 0x64.
     */

    return ArtistRow;
  })();

  /**
   * A row that holds a tag name and its ID (found only in exportExt.pdb files).
   */

  var TagRow = RekordboxPdb.TagRow = (function() {
    function TagRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TagRow.prototype._read = function() {
      this._unnamed0 = this._io.readU2le();
      this.tagIndex = this._io.readU2le();
      this._unnamed2 = this._io.readU8le();
      this.category = this._io.readU4le();
      this.categoryPos = this._io.readU4le();
      this.id = this._io.readU4le();
      this.rawIsCategory = this._io.readU4le();
      this._unnamed7 = this._io.readU2le();
      this.flags = this._io.readU1();
      this.name = new DeviceSqlString(this._io, this, this._root);
      this._unnamed10 = this._io.readU1();
    }

    /**
     * Indicates whether this row stores a tag category instead of a tag.
     */
    Object.defineProperty(TagRow.prototype, 'isCategory', {
      get: function() {
        if (this._m_isCategory !== undefined)
          return this._m_isCategory;
        this._m_isCategory = this.rawIsCategory != 0;
        return this._m_isCategory;
      }
    });

    /**
     * Seems to always be 0x80, 0x06.
     */

    /**
     * Increasing index for each row in multiples of 0x20.
     */

    /**
     * Seems to always be zero.
     */

    /**
     * The ID of the tag category this tag belongs to.
     * If this row represents a tag category, this field is zero.
     */

    /**
     * The zero-based position of this tag in its category.
     * If this row represents a tag category, the zero-based position of the category itself in the category list.
     */

    /**
     * The ID of this tag or tag category.
     * Referenced by tag_track_row if this row is a tag.
     */

    /**
     * Non-zero when this row stores a tag category instead of a tag.
     */

    /**
     * Seems to always be 0x03, 0x1f.
     */

    /**
     * Maybe some kind of flags?
     */

    /**
     * The name of the tag or tag category.
     */

    /**
     * This seems to always be 0x03.
     */

    return TagRow;
  })();

  /**
   * An index which points to a table page (its offset can be found
   * by multiplying the index by the `page_len` value in the file
   * header). This type allows the linked page to be lazy loaded.
   */

  var PageRef = RekordboxPdb.PageRef = (function() {
    function PageRef(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PageRef.prototype._read = function() {
      this.index = this._io.readU4le();
    }

    /**
     * When referenced, loads the specified page and parses its
     * contents appropriately for the type of data it contains.
     */
    Object.defineProperty(PageRef.prototype, 'body', {
      get: function() {
        if (this._m_body !== undefined)
          return this._m_body;
        var io = this._root._io;
        var _pos = io.pos;
        io.seek((this._root.lenPage * this.index));
        this._raw__m_body = io.readBytes(this._root.lenPage);
        var _io__raw__m_body = new KaitaiStream(this._raw__m_body);
        this._m_body = new Page(_io__raw__m_body, this, this._root);
        io.seek(_pos);
        return this._m_body;
      }
    });

    /**
     * Identifies the desired page number.
     */

    return PageRef;
  })();

  /**
   * A row that describes a track that can be played, with many
   * details about the music, and links to other tables like artists,
   * albums, keys, etc.
   */

  var TrackRow = RekordboxPdb.TrackRow = (function() {
    function TrackRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TrackRow.prototype._read = function() {
      this._unnamed0 = this._io.readU2le();
      this.indexShift = this._io.readU2le();
      this.bitmask = this._io.readU4le();
      this.sampleRate = this._io.readU4le();
      this.composerId = this._io.readU4le();
      this.fileSize = this._io.readU4le();
      this._unnamed6 = this._io.readU4le();
      this._unnamed7 = this._io.readU2le();
      this._unnamed8 = this._io.readU2le();
      this.artworkId = this._io.readU4le();
      this.keyId = this._io.readU4le();
      this.originalArtistId = this._io.readU4le();
      this.labelId = this._io.readU4le();
      this.remixerId = this._io.readU4le();
      this.bitrate = this._io.readU4le();
      this.trackNumber = this._io.readU4le();
      this.tempo = this._io.readU4le();
      this.genreId = this._io.readU4le();
      this.albumId = this._io.readU4le();
      this.artistId = this._io.readU4le();
      this.id = this._io.readU4le();
      this.discNumber = this._io.readU2le();
      this.playCount = this._io.readU2le();
      this.year = this._io.readU2le();
      this.sampleDepth = this._io.readU2le();
      this.duration = this._io.readU2le();
      this._unnamed26 = this._io.readU2le();
      this.colorId = this._io.readU1();
      this.rating = this._io.readU1();
      this._unnamed29 = this._io.readU2le();
      this._unnamed30 = this._io.readU2le();
      this.ofsStrings = [];
      for (var i = 0; i < 21; i++) {
        this.ofsStrings.push(this._io.readU2le());
      }
    }

    /**
     * A string of unknown purpose, usually empty.
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString8', {
      get: function() {
        if (this._m_unknownString8 !== undefined)
          return this._m_unknownString8;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[18]));
        this._m_unknownString8 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString8;
      }
    });

    /**
     * A string of unknown purpose, usually empty.
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString6', {
      get: function() {
        if (this._m_unknownString6 !== undefined)
          return this._m_unknownString6;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[9]));
        this._m_unknownString6 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString6;
      }
    });

    /**
     * A string containing the date this track was analyzed by rekordbox.
     */
    Object.defineProperty(TrackRow.prototype, 'analyzeDate', {
      get: function() {
        if (this._m_analyzeDate !== undefined)
          return this._m_analyzeDate;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[15]));
        this._m_analyzeDate = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_analyzeDate;
      }
    });

    /**
     * The file path of the track audio file.
     */
    Object.defineProperty(TrackRow.prototype, 'filePath', {
      get: function() {
        if (this._m_filePath !== undefined)
          return this._m_filePath;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[20]));
        this._m_filePath = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_filePath;
      }
    });

    /**
     * A string containing the date this track was added to the collection.
     */
    Object.defineProperty(TrackRow.prototype, 'dateAdded', {
      get: function() {
        if (this._m_dateAdded !== undefined)
          return this._m_dateAdded;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[10]));
        this._m_dateAdded = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_dateAdded;
      }
    });

    /**
     * A string of unknown purpose; @flesniak said "strange
     * strings, often zero length, sometimes low binary values
     * 0x01/0x02 as content"
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString3', {
      get: function() {
        if (this._m_unknownString3 !== undefined)
          return this._m_unknownString3;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[3]));
        this._m_unknownString3 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString3;
      }
    });

    /**
     * A string of unknown purpose, which @flesniak named.
     */
    Object.defineProperty(TrackRow.prototype, 'texter', {
      get: function() {
        if (this._m_texter !== undefined)
          return this._m_texter;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[1]));
        this._m_texter = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_texter;
      }
    });

    /**
     * A string whose value is always either empty or "ON", and
     * which apparently for some insane reason is used, rather than
     * a single bit somewhere, to control whether the track
     * information is visible on Kuvo.
     */
    Object.defineProperty(TrackRow.prototype, 'kuvoPublic', {
      get: function() {
        if (this._m_kuvoPublic !== undefined)
          return this._m_kuvoPublic;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[6]));
        this._m_kuvoPublic = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_kuvoPublic;
      }
    });

    /**
     * A string naming the remix of the track, if known.
     */
    Object.defineProperty(TrackRow.prototype, 'mixName', {
      get: function() {
        if (this._m_mixName !== undefined)
          return this._m_mixName;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[12]));
        this._m_mixName = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_mixName;
      }
    });

    /**
     * A string of unknown purpose.
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString5', {
      get: function() {
        if (this._m_unknownString5 !== undefined)
          return this._m_unknownString5;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[8]));
        this._m_unknownString5 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString5;
      }
    });

    /**
     * A string of unknown purpose; @flesniak said "strange
     * strings, often zero length, sometimes low binary values
     * 0x01/0x02 as content"
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString4', {
      get: function() {
        if (this._m_unknownString4 !== undefined)
          return this._m_unknownString4;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[4]));
        this._m_unknownString4 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString4;
      }
    });

    /**
     * A string of unknown purpose, which @flesniak named.
     */
    Object.defineProperty(TrackRow.prototype, 'message', {
      get: function() {
        if (this._m_message !== undefined)
          return this._m_message;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[5]));
        this._m_message = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_message;
      }
    });

    /**
     * A string of unknown purpose; @flesniak said "thought
     * track number -> wrong!"
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString2', {
      get: function() {
        if (this._m_unknownString2 !== undefined)
          return this._m_unknownString2;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[2]));
        this._m_unknownString2 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString2;
      }
    });

    /**
     * International Standard Recording Code of track
     * when known (in mangled format).
     */
    Object.defineProperty(TrackRow.prototype, 'isrc', {
      get: function() {
        if (this._m_isrc !== undefined)
          return this._m_isrc;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[0]));
        this._m_isrc = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_isrc;
      }
    });

    /**
     * A string of unknown purpose, usually empty.
     */
    Object.defineProperty(TrackRow.prototype, 'unknownString7', {
      get: function() {
        if (this._m_unknownString7 !== undefined)
          return this._m_unknownString7;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[13]));
        this._m_unknownString7 = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_unknownString7;
      }
    });

    /**
     * The file name of the track audio file.
     */
    Object.defineProperty(TrackRow.prototype, 'filename', {
      get: function() {
        if (this._m_filename !== undefined)
          return this._m_filename;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[19]));
        this._m_filename = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_filename;
      }
    });

    /**
     * The file path of the track analysis, which allows rapid
     * seeking to particular times in variable bit-rate files,
     * jumping to particular beats, visual waveform previews, and
     * stores cue points and loops.
     */
    Object.defineProperty(TrackRow.prototype, 'analyzePath', {
      get: function() {
        if (this._m_analyzePath !== undefined)
          return this._m_analyzePath;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[14]));
        this._m_analyzePath = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_analyzePath;
      }
    });

    /**
     * The comment assigned to the track by the DJ, if any.
     */
    Object.defineProperty(TrackRow.prototype, 'comment', {
      get: function() {
        if (this._m_comment !== undefined)
          return this._m_comment;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[16]));
        this._m_comment = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_comment;
      }
    });

    /**
     * A string containing the date this track was released, if known.
     */
    Object.defineProperty(TrackRow.prototype, 'releaseDate', {
      get: function() {
        if (this._m_releaseDate !== undefined)
          return this._m_releaseDate;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[11]));
        this._m_releaseDate = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_releaseDate;
      }
    });

    /**
     * A string whose value is always either empty or "ON", and
     * which apparently for some insane reason is used, rather than
     * a single bit somewhere, to control whether hot-cues are
     * auto-loaded for the track.
     */
    Object.defineProperty(TrackRow.prototype, 'autoloadHotCues', {
      get: function() {
        if (this._m_autoloadHotCues !== undefined)
          return this._m_autoloadHotCues;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[7]));
        this._m_autoloadHotCues = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_autoloadHotCues;
      }
    });

    /**
     * The title of the track.
     */
    Object.defineProperty(TrackRow.prototype, 'title', {
      get: function() {
        if (this._m_title !== undefined)
          return this._m_title;
        var _pos = this._io.pos;
        this._io.seek((this._parent.rowBase + this.ofsStrings[17]));
        this._m_title = new DeviceSqlString(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_title;
      }
    });

    /**
     * Some kind of magic word? Usually 0x24, 0x00.
     */

    /**
     * TODO name from @flesniak, but what does it mean?
     */

    /**
     * TODO what do the bits mean?
     */

    /**
     * Playback sample rate of the audio file.
     */

    /**
     * References a row in the artist table if the composer is
     * known.
     */

    /**
     * The length of the audio file, in bytes.
     */

    /**
     * Some ID? Purpose as yet unknown.
     */

    /**
     * From @flesniak: "always 19048?"
     */

    /**
     * From @flesniak: "always 30967?"
     */

    /**
     * References a row in the artwork table if there is album art.
     */

    /**
     * References a row in the keys table if the track has a known
     * main musical key.
     */

    /**
     * References a row in the artwork table if this is a cover
     * performance and the original artist is known.
     */

    /**
     * References a row in the labels table if the track has a
     * known record label.
     */

    /**
     * References a row in the artists table if the track has a
     * known remixer.
     */

    /**
     * Playback bit rate of the audio file.
     */

    /**
     * The position of the track within an album.
     */

    /**
     * The tempo at the start of the track in beats per minute,
     * multiplied by 100.
     */

    /**
     * References a row in the genres table if the track has a
     * known musical genre.
     */

    /**
     * References a row in the albums table if the track has a
     * known album.
     */

    /**
     * References a row in the artists table if the track has a
     * known performer.
     */

    /**
     * The id by which this track can be looked up; players will
     * report this value in their status packets when they are
     * playing the track.
     */

    /**
     * The number of the disc on which this track is found, if it
     * is known to be part of a multi-disc album.
     */

    /**
     * The number of times this track has been played.
     */

    /**
     * The year in which this track was released.
     */

    /**
     * The number of bits per sample of the audio file.
     */

    /**
     * The length, in seconds, of the track when played at normal
     * speed.
     */

    /**
     * From @flesniak: "always 41?"
     */

    /**
     * References a row in the colors table if the track has been
     * assigned a color.
     */

    /**
     * The number of stars to display for the track, 0 to 5.
     */

    /**
     * From @flesniak: "always 1?"
     */

    /**
     * From @flesniak: "alternating 2 or 3"
     */

    /**
     * The location, relative to the start of this row, of a
     * variety of variable-length strings.
     */

    return TrackRow;
  })();

  /**
   * A row that holds a musical key and the associated ID.
   */

  var KeyRow = RekordboxPdb.KeyRow = (function() {
    function KeyRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    KeyRow.prototype._read = function() {
      this.id = this._io.readU4le();
      this.id2 = this._io.readU4le();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this key can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * Seems to be a second copy of the ID?
     */

    /**
     * The variable-length string naming the key.
     */

    return KeyRow;
  })();

  /**
   * A row that associates a track with a position in a playlist.
   */

  var PlaylistEntryRow = RekordboxPdb.PlaylistEntryRow = (function() {
    function PlaylistEntryRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PlaylistEntryRow.prototype._read = function() {
      this.entryIndex = this._io.readU4le();
      this.trackId = this._io.readU4le();
      this.playlistId = this._io.readU4le();
    }

    /**
     * The position within the playlist represented by this entry.
     */

    /**
     * The track found at this position in the playlist.
     */

    /**
     * The playlist to which this entry belongs.
     */

    return PlaylistEntryRow;
  })();

  /**
   * A row that holds a label name and the associated ID.
   */

  var LabelRow = RekordboxPdb.LabelRow = (function() {
    function LabelRow(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LabelRow.prototype._read = function() {
      this.id = this._io.readU4le();
      this.name = new DeviceSqlString(this._io, this, this._root);
    }

    /**
     * The unique identifier by which this label can be requested
     * and linked from other rows (such as tracks).
     */

    /**
     * The variable-length string naming the label.
     */

    return LabelRow;
  })();

  /**
   * A UTF-16LE-encoded string preceded by a two-byte length field in a four-byte header.
   */

  var DeviceSqlLongUtf16le = RekordboxPdb.DeviceSqlLongUtf16le = (function() {
    function DeviceSqlLongUtf16le(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    DeviceSqlLongUtf16le.prototype._read = function() {
      this.length = this._io.readU2le();
      this._unnamed1 = this._io.readU1();
      this.text = KaitaiStream.bytesToStr(this._io.readBytes((this.length - 4)), "UTF-16LE");
    }

    /**
     * Contains the length of the string in bytes, plus four trailing bytes that must be ignored.
     */

    /**
     * The content of the string.
     */

    return DeviceSqlLongUtf16le;
  })();

  /**
   * Each table is a linked list of pages containing rows of a single
   * type. This header describes the nature of the table and links to
   * its pages by index.
   */

  var Table = RekordboxPdb.Table = (function() {
    function Table(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Table.prototype._read = function() {
      if (!(this._root.isExt)) {
        this.type = this._io.readU4le();
      }
      if (this._root.isExt) {
        this.typeExt = this._io.readU4le();
      }
      this.emptyCandidate = this._io.readU4le();
      this.firstPage = new PageRef(this._io, this, this._root);
      this.lastPage = new PageRef(this._io, this, this._root);
    }

    /**
     * Identifies the kind of rows that are found in this table.
     */

    /**
     * Identifies the kind of rows that are found in this table from an exportExt.pdb file.
     */

    /**
     * Links to the chain of pages making up that table. The first
     * page seems to always contain similar garbage patterns and
     * zero rows, but the next page it links to contains the start
     * of the meaningful data rows.
     */

    /**
     * Holds the index of the last page that makes up this table.
     * When following the linked list of pages of the table, you
     * either need to stop when you reach this page, or when you
     * notice that the `next_page` link you followed took you to a
     * page of a different `type`.
     */

    return Table;
  })();

  /**
   * An offset which points to a row in the table, whose actual
   * presence is controlled by one of the bits in
   * `row_present_flags`. This instance allows the row itself to be
   * lazily loaded, unless it is not present, in which case there is
   * no content to be loaded.
   */

  var RowRef = RekordboxPdb.RowRef = (function() {
    function RowRef(_io, _parent, _root, rowIndex) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this.rowIndex = rowIndex;

      this._read();
    }
    RowRef.prototype._read = function() {
    }

    /**
     * The location of this row relative to the start of the page.
     * A variety of pointers (such as all device_sql_string values)
     * are calculated with respect to this position.
     */
    Object.defineProperty(RowRef.prototype, 'rowBase', {
      get: function() {
        if (this._m_rowBase !== undefined)
          return this._m_rowBase;
        this._m_rowBase = (this.ofsRow + this._parent._parent.heapPos);
        return this._m_rowBase;
      }
    });

    /**
     * The actual content of the row in an exportExt.pdb file, as long as it is present.
     */
    Object.defineProperty(RowRef.prototype, 'bodyExt', {
      get: function() {
        if (this._m_bodyExt !== undefined)
          return this._m_bodyExt;
        if ( ((this.present) && (this._root.isExt)) ) {
          var _pos = this._io.pos;
          this._io.seek(this.rowBase);
          switch (this._parent._parent.typeExt) {
          case RekordboxPdb.PageTypeExt.TAGS:
            this._m_bodyExt = new TagRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageTypeExt.TAG_TRACKS:
            this._m_bodyExt = new TagTrackRow(this._io, this, this._root);
            break;
          }
          this._io.seek(_pos);
        }
        return this._m_bodyExt;
      }
    });

    /**
     * The actual content of the row, as long as it is present.
     */
    Object.defineProperty(RowRef.prototype, 'body', {
      get: function() {
        if (this._m_body !== undefined)
          return this._m_body;
        if ( ((this.present) && (!(this._root.isExt))) ) {
          var _pos = this._io.pos;
          this._io.seek(this.rowBase);
          switch (this._parent._parent.type) {
          case RekordboxPdb.PageType.PLAYLIST_TREE:
            this._m_body = new PlaylistTreeRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.KEYS:
            this._m_body = new KeyRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.ARTISTS:
            this._m_body = new ArtistRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.ALBUMS:
            this._m_body = new AlbumRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.GENRES:
            this._m_body = new GenreRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.HISTORY_PLAYLISTS:
            this._m_body = new HistoryPlaylistRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.ARTWORK:
            this._m_body = new ArtworkRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.PLAYLIST_ENTRIES:
            this._m_body = new PlaylistEntryRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.LABELS:
            this._m_body = new LabelRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.TRACKS:
            this._m_body = new TrackRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.HISTORY_ENTRIES:
            this._m_body = new HistoryEntryRow(this._io, this, this._root);
            break;
          case RekordboxPdb.PageType.COLORS:
            this._m_body = new ColorRow(this._io, this, this._root);
            break;
          }
          this._io.seek(_pos);
        }
        return this._m_body;
      }
    });

    /**
     * Indicates whether the row index considers this row to be
     * present in the table. Will be `false` if the row has been
     * deleted.
     */
    Object.defineProperty(RowRef.prototype, 'present', {
      get: function() {
        if (this._m_present !== undefined)
          return this._m_present;
        this._m_present = (((this._parent.rowPresentFlags >>> this.rowIndex) & 1) != 0 ? true : false);
        return this._m_present;
      }
    });

    /**
     * The offset of the start of the row (in bytes past the end of
     * the page header).
     */
    Object.defineProperty(RowRef.prototype, 'ofsRow', {
      get: function() {
        if (this._m_ofsRow !== undefined)
          return this._m_ofsRow;
        var _pos = this._io.pos;
        this._io.seek((this._parent.base - (6 + (2 * this.rowIndex))));
        this._m_ofsRow = this._io.readU2le();
        this._io.seek(_pos);
        return this._m_ofsRow;
      }
    });

    /**
     * Identifies which row within the row index this reference
     * came from, so the correct flag can be checked for the row
     * presence and the correct row offset can be found.
     */

    return RowRef;
  })();

  /**
   * Unknown purpose, perhaps an unoriginal signature, seems to
   * always have the value 0.
   */

  /**
   * The database page size, in bytes. Pages are referred to by
   * index, so this size is needed to calculate their offset, and
   * table pages have a row index structure which is built from the
   * end of the page backwards, so finding that also requires this
   * value.
   */

  /**
   * Determines the number of table entries that are present. Each
   * table is a linked list of pages containing rows of a particular
   * type.
   */

  /**
   * @flesniak said: "Not used as any `empty_candidate`, points
   * past the end of the file."
   */

  /**
   * @flesniak said: "Always incremented by at least one,
   * sometimes by two or three."
   */

  /**
   * Only exposed until
   * https://github.com/kaitai-io/kaitai_struct/issues/825 can be
   * fixed.
   */

  /**
   * Describes and links to the tables present in the database.
   */

  /**
   * Indicates whether the database schema is export or exportExt.
   * Set this to true when parsing an exportExt.pdb file.
   */

  return RekordboxPdb;
})();
return RekordboxPdb;
}));
