# HEIC Image Converter

A cross-platform desktop app that converts HEIC/HEIF images to JPEG. Built with [Tauri v2](https://v2.tauri.app/), Vite, and JavaScript.

## Features

- Drag-and-drop HEIC/HEIF files onto the window
- Browse for files using a native file picker
- Batch conversion of multiple files at once
- Adjustable JPEG quality slider (10–100%)
- Overwrite protection (appends `-converted` if the output file already exists)
- Converted files are saved next to the originals

## Prerequisites

- **Node.js** >= 18
- **Rust** >= 1.70
- **System dependencies** (Ubuntu/Debian):
  ```sh
  sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
    libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), WebView2 (pre-installed on Windows 10+)

## Getting Started

```sh
# Install dependencies
make install

# Run in development mode (hot-reload)
make dev
```

## Usage

1. Launch the app
2. Drag HEIC/HEIF files onto the drop zone, or click **Browse Files**
3. Adjust JPEG quality with the slider (default 92%)
4. Click **Convert All**
5. Converted `.jpg` files appear next to the originals

## Commands

| Command | Description |
|---------|-------------|
| `make install` | Install npm dependencies |
| `make dev` | Run the app in development mode |
| `make test` | Run unit tests |
| `make build` | Build a production binary |
| `make bundle` | Build distributable packages (deb, AppImage, dmg, msi) |
| `make clean` | Remove build artifacts |

## Tech Stack

- **Tauri v2** — lightweight cross-platform desktop framework
- **Vite** — frontend bundler
- **heic-convert** — WASM-based HEIC to JPEG conversion
- **Vitest** — unit testing

## Project Structure

```
heic-image-converter/
├── index.html              # App entry point
├── src/
│   ├── main.js             # App logic (file handling, conversion)
│   ├── utils.js            # Pure utility functions
│   ├── utils.test.js       # Unit tests
│   └── styles.css          # Styling
├── src-tauri/
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri configuration
│   ├── capabilities/       # Permission definitions
│   └── src/
│       ├── main.rs         # Rust entry point
│       └── lib.rs          # Plugin initialization
├── Makefile
└── package.json
```

## License

MIT
