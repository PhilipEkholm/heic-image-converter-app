import { describe, it, expect } from "vitest";
import {
    extractFileName,
    isHeicFile,
    filterHeicPaths,
    toJpgPath,
    withConvertedSuffix,
    statusLabel,
    addFilesToList,
    removeFileFromList,
} from "./utils.js";

describe("extractFileName", () => {
    it("extracts filename from Unix path", () => {
        expect(extractFileName("/home/user/photos/image.heic")).toBe("image.heic");
    });

    it("extracts filename from Windows path", () => {
        expect(extractFileName("C:\\Users\\user\\photos\\image.heic")).toBe("image.heic");
    });

    it("handles filename only (no directory)", () => {
        expect(extractFileName("image.heic")).toBe("image.heic");
    });

    it("handles mixed separators", () => {
        expect(extractFileName("/home/user\\photos/image.heic")).toBe("image.heic");
    });
});

describe("isHeicFile", () => {
    it("returns true for .heic", () => {
        expect(isHeicFile("photo.heic")).toBe(true);
    });

    it("returns true for .HEIC (uppercase)", () => {
        expect(isHeicFile("photo.HEIC")).toBe(true);
    });

    it("returns true for .heif", () => {
        expect(isHeicFile("photo.heif")).toBe(true);
    });

    it("returns true for .HEIF (uppercase)", () => {
        expect(isHeicFile("photo.HEIF")).toBe(true);
    });

    it("returns false for .jpg", () => {
        expect(isHeicFile("photo.jpg")).toBe(false);
    });

    it("returns false for .png", () => {
        expect(isHeicFile("photo.png")).toBe(false);
    });

    it("returns true for full path ending in .heic", () => {
        expect(isHeicFile("/home/user/photo.heic")).toBe(true);
    });

    it("returns false for .heic in the middle of path", () => {
        expect(isHeicFile("/home/user/.heic/photo.jpg")).toBe(false);
    });
});

describe("filterHeicPaths", () => {
    it("filters to only HEIC/HEIF files", () => {
        const paths = [
            "/photos/a.heic",
            "/photos/b.jpg",
            "/photos/c.HEIF",
            "/photos/d.png",
        ];
        expect(filterHeicPaths(paths)).toEqual([
            "/photos/a.heic",
            "/photos/c.HEIF",
        ]);
    });

    it("returns empty array when no HEIC files", () => {
        expect(filterHeicPaths(["/a.jpg", "/b.png"])).toEqual([]);
    });

    it("returns all when all are HEIC", () => {
        const paths = ["/a.heic", "/b.heif"];
        expect(filterHeicPaths(paths)).toEqual(paths);
    });
});

describe("toJpgPath", () => {
    it("converts .heic to .jpg", () => {
        expect(toJpgPath("/photos/image.heic")).toBe("/photos/image.jpg");
    });

    it("converts .HEIC to .jpg", () => {
        expect(toJpgPath("/photos/image.HEIC")).toBe("/photos/image.jpg");
    });

    it("converts .heif to .jpg", () => {
        expect(toJpgPath("/photos/image.heif")).toBe("/photos/image.jpg");
    });

    it("converts .HEIF to .jpg", () => {
        expect(toJpgPath("/photos/image.HEIF")).toBe("/photos/image.jpg");
    });

    it("preserves the directory path", () => {
        expect(toJpgPath("/home/user/Photos/vacation.heic")).toBe(
            "/home/user/Photos/vacation.jpg"
        );
    });
});

describe("withConvertedSuffix", () => {
    it("appends -converted before .jpg", () => {
        expect(withConvertedSuffix("/photos/image.jpg")).toBe(
            "/photos/image-converted.jpg"
        );
    });

    it("works with deep paths", () => {
        expect(withConvertedSuffix("/home/user/photos/pic.jpg")).toBe(
            "/home/user/photos/pic-converted.jpg"
        );
    });
});

describe("statusLabel", () => {
    it("returns Pending for pending", () => {
        expect(statusLabel("pending")).toBe("Pending");
    });

    it("returns Converting… for converting", () => {
        expect(statusLabel("converting")).toBe("Converting…");
    });

    it("returns Done ✓ for done", () => {
        expect(statusLabel("done")).toBe("Done ✓");
    });

    it("returns Error ✗ for error", () => {
        expect(statusLabel("error")).toBe("Error ✗");
    });

    it("returns the status string itself for unknown status", () => {
        expect(statusLabel("unknown")).toBe("unknown");
    });
});

describe("addFilesToList", () => {
    it("adds new files to empty list", () => {
        const result = addFilesToList([], ["/photos/a.heic", "/photos/b.heic"]);
        expect(result).toEqual([
            { path: "/photos/a.heic", name: "a.heic", status: "pending" },
            { path: "/photos/b.heic", name: "b.heic", status: "pending" },
        ]);
    });

    it("skips duplicate paths", () => {
        const existing = [
            { path: "/photos/a.heic", name: "a.heic", status: "pending" },
        ];
        const result = addFilesToList(existing, ["/photos/a.heic", "/photos/b.heic"]);
        expect(result).toHaveLength(2);
        expect(result[1].path).toBe("/photos/b.heic");
    });

    it("does not mutate the original array", () => {
        const existing = [
            { path: "/photos/a.heic", name: "a.heic", status: "pending" },
        ];
        const result = addFilesToList(existing, ["/photos/b.heic"]);
        expect(existing).toHaveLength(1);
        expect(result).toHaveLength(2);
    });

    it("handles empty paths array", () => {
        const existing = [
            { path: "/photos/a.heic", name: "a.heic", status: "pending" },
        ];
        const result = addFilesToList(existing, []);
        expect(result).toEqual(existing);
    });
});

describe("removeFileFromList", () => {
    it("removes file at given index", () => {
        const files = [
            { path: "/a.heic", name: "a.heic", status: "pending" },
            { path: "/b.heic", name: "b.heic", status: "pending" },
            { path: "/c.heic", name: "c.heic", status: "pending" },
        ];
        const result = removeFileFromList(files, 1);
        expect(result).toHaveLength(2);
        expect(result.map((f) => f.name)).toEqual(["a.heic", "c.heic"]);
    });

    it("does not mutate the original array", () => {
        const files = [
            { path: "/a.heic", name: "a.heic", status: "pending" },
            { path: "/b.heic", name: "b.heic", status: "pending" },
        ];
        const result = removeFileFromList(files, 0);
        expect(files).toHaveLength(2);
        expect(result).toHaveLength(1);
    });
});
