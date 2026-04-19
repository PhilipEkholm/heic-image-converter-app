/**
 * Extract filename from a file path (handles both / and \).
 */
export function extractFileName(filePath) {
    return filePath.split(/[\\/]/).pop();
}

/**
 * Check if a filename has a HEIC/HEIF extension.
 */
export function isHeicFile(name) {
    return /\.heic$/i.test(name) || /\.heif$/i.test(name);
}

/**
 * Filter an array of file paths down to only HEIC/HEIF files.
 */
export function filterHeicPaths(paths) {
    return paths.filter((p) => isHeicFile(p));
}

/**
 * Convert a HEIC/HEIF path to a .jpg output path.
 */
export function toJpgPath(filePath) {
    return filePath.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
}

/**
 * Get the output path with overwrite protection suffix.
 */
export function withConvertedSuffix(outputPath) {
    const ext = ".jpg";
    const base = outputPath.slice(0, -ext.length);
    return `${base}-converted${ext}`;
}

/**
 * Return a human-readable label for a file status.
 */
export function statusLabel(status) {
    switch (status) {
        case "pending": return "Pending";
        case "converting": return "Converting…";
        case "done": return "Done ✓";
        case "error": return "Error ✗";
        default: return status;
    }
}

/**
 * Add file paths to a files array, skipping duplicates.
 * Returns a new array with the additions.
 */
export function addFilesToList(existingFiles, paths) {
    const result = [...existingFiles];
    for (const filePath of paths) {
        if (result.some((f) => f.path === filePath)) continue;
        const name = extractFileName(filePath);
        result.push({ path: filePath, name, status: "pending" });
    }
    return result;
}

/**
 * Remove a file at the given index. Returns a new array.
 */
export function removeFileFromList(existingFiles, index) {
    const result = [...existingFiles];
    result.splice(index, 1);
    return result;
}
