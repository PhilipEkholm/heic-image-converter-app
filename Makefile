.PHONY: install dev build test clean bundle

# Install all dependencies (npm + Rust)
install:
	npm install

# Run the app in development mode (hot-reload)
dev:
	npm run tauri dev

# Run unit tests
test:
	npm test

# Build the frontend (Vite)
build-frontend:
	npm run build

# Build a production binary
build:
	npm run tauri build

# Build production bundles (deb, AppImage, etc.)
bundle: build

# Clean build artifacts
clean:
	rm -rf dist node_modules/.vite
	cd src-tauri && cargo clean
