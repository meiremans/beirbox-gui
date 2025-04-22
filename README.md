# beirbox-gui

**beirbox-gui** is a tool to prepare USB sticks for use with Pioneer CDJs, XDJs, and similar gear — without relying on Rekordbox. This makes it easier to manage music exports directly and transparently.

> ⚠️ WARNING: THIS IS A PROTOTYPE, DO NOT USE THIS UNTIL V1.  
> Pull requests appreciated.

---

### ✨ Features

- Export music to USB in a format compatible with CDJs/XDJs  
- GUI-based tool built with [Fyne](https://fyne.io/) for ease of use  
- Works across Windows, macOS, and Linux (yes finally you linux users!)

---

### 🚀 Requirements

- **Node.js** (tested with version 22)  
  Install here: [https://nodejs.org/en](https://nodejs.org/en)  

  Sadly Node.js is necessary for now. Should be the only thing you need though.

---

### ✅ Done

- [x] Select music folder  
- [x] GUI  
- [x] Select USB  
- [x] Export to USB  
- [x] Show waveform preview placeholder (on CDJ)  
- [x] Artist - trackname shows and is searchable (on CDJ)  
- [x] BPM shows (on CDJ)  

---

### 📅 Roadmap (to v1)

- [ ] Add `.EXT` for the waveform (v2) — this is the oldest format of waveform and thus should be supported by all players  
- [ ] Add a real waveform preview instead of the waveform placeholder  
- [ ] Re-encode every track that is not supported  
- [ ] Preserve hotcues? (maybe a v2 thing)

**Main goal for v1-prerelease:**  
- [ ] Make a stick on Windows  
- [ ] Play it on an XDJ-RX2  
- [ ] Make the experience not (too) different from a stick made in Rekordbox  

**Main goal for v1:**  
- [ ] Same, but cross-platform tested  
- [ ] Tested across multiple players  

---

### 🙏 Special Thanks

- [@kimtore](https://github.com/kimtore) – for his excellent [`rex`](https://github.com/kimtore/rex) repository for PDB writing  
- [@Deep-Symmetry](https://github.com/Deep-Symmetry) – for [`crate-digger`](https://github.com/Deep-Symmetry/crate-digger) and the Kaitai struct for `.DAT` parsing  
- [@jandk](https://github.com/jandk) – for figuring out how Pioneer path hashing is generated  
- [@bartvg](https://github.com/bartvg) – **Vettige Weust** – for listening to my bacon 🥓
- ChatGPT for the vibe programming
