import { open } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile, exists } from "@tauri-apps/plugin-fs";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import convert from "heic-convert/browser";
import {
  extractFileName,
  filterHeicPaths,
  toJpgPath,
  withConvertedSuffix,
  statusLabel,
  addFilesToList,
  removeFileFromList,
} from "./utils.js";

// State
let files = []; // Array of { path, name, status }
let quality = 0.92;

// DOM elements
const dropZone = document.getElementById("drop-zone");
const btnBrowse = document.getElementById("btn-browse");
const btnConvert = document.getElementById("btn-convert");
const controls = document.getElementById("controls");
const fileList = document.getElementById("file-list");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");

// Quality slider
qualitySlider.addEventListener("input", (e) => {
  quality = parseInt(e.target.value, 10) / 100;
  qualityValue.textContent = e.target.value;
});

// Browse button — open native file dialog
btnBrowse.addEventListener("click", async (e) => {
  e.stopPropagation();
  const selected = await open({
    multiple: true,
    filters: [{ name: "HEIC Images", extensions: ["heic", "HEIC", "heif", "HEIF"] }],
  });
  if (selected) {
    addFiles(selected);
  }
});

// Drop zone click also opens dialog
dropZone.addEventListener("click", () => btnBrowse.click());

// Tauri native drag-and-drop (HTML5 drop events don't provide file paths in Tauri)
getCurrentWebviewWindow().onDragDropEvent((event) => {
  if (event.payload.type === "over") {
    dropZone.classList.add("drag-over");
  } else if (event.payload.type === "leave") {
    dropZone.classList.remove("drag-over");
  } else if (event.payload.type === "drop") {
    dropZone.classList.remove("drag-over");
    const heicPaths = filterHeicPaths(event.payload.paths);
    if (heicPaths.length > 0) {
      addFiles(heicPaths);
    }
  }
});

// Convert button
btnConvert.addEventListener("click", convertAll);

function addFiles(paths) {
  files = addFilesToList(files, paths);
  renderFileList();
  controls.classList.toggle("hidden", files.length === 0);
}

function removeFile(index) {
  files = removeFileFromList(files, index);
  renderFileList();
  controls.classList.toggle("hidden", files.length === 0);
}

function renderFileList() {
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "file-item";

    const nameEl = document.createElement("span");
    nameEl.className = "file-item-name";
    nameEl.textContent = file.name;
    nameEl.title = file.path;

    const statusEl = document.createElement("span");
    statusEl.className = `file-item-status status-${file.status}`;
    statusEl.textContent = statusLabel(file.status);

    const removeBtn = document.createElement("button");
    removeBtn.className = "file-item-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", () => removeFile(index));

    item.appendChild(nameEl);
    item.appendChild(statusEl);
    item.appendChild(removeBtn);
    fileList.appendChild(item);
  });
}

async function convertAll() {
  btnConvert.disabled = true;
  btnConvert.textContent = "Converting…";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.status === "done") continue;

    file.status = "converting";
    renderFileList();

    try {
      // Read the HEIC file
      const heicBuffer = await readFile(file.path);

      // Convert to JPEG
      const jpegBlob = await convert({
        buffer: heicBuffer,
        format: "JPEG",
        quality,
      });

      // Determine output path: replace .heic/.heif with .jpg
      let outputPath = toJpgPath(file.path);

      // Overwrite protection: append -converted if target already exists
      if (await exists(outputPath)) {
        outputPath = withConvertedSuffix(outputPath);
      }

      // Write the output file
      const outputBuffer = new Uint8Array(jpegBlob);
      await writeFile(outputPath, outputBuffer);

      file.status = "done";
    } catch (err) {
      console.error(`Failed to convert ${file.name}:`, err);
      file.status = "error";
    }

    renderFileList();
  }

  btnConvert.disabled = false;
  btnConvert.textContent = "Convert All";
}
