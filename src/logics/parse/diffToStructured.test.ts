import { describe, expect, it } from "bun:test";
import {
  mockComplexExample,
  mockDeletedFile,
  mockDiffWithContextOnlyHunk,
  mockDiffWithOnlyAdditions,
  mockDiffWithOnlyDeletions,
  mockEmpty,
  mockMultipleFilesChange,
  mockMultipleHunks,
  mockNewFile,
  mockNoNewlineAtEndOfFile,
  mockRenamedFile,
  mockRenamedFileWithChanges,
  mockSingleFileChange,
} from "../../mocks/diffs";
import { FileChange } from "../../types";
import { parseDiffToStructured } from "./diffToStructured";

describe("parseDiffToStructured", () => {
  it("should return an empty array for an empty diff string", () => {
    const result = parseDiffToStructured(mockEmpty);
    expect(result).toEqual([]);
  });

  it("should parse a diff with a single file change", () => {
    const result = parseDiffToStructured(mockSingleFileChange);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("file1.txt");
    expect(fileChange.newPath).toBe("file1.txt");
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -1,3 +1,3 @@");
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "context", content: "Line 1" },
      { type: "deletion", content: "Line 2" },
      { type: "addition", content: "Line 2 changed" },
      { type: "context", content: "Line 3" },
    ]);
  });

  it("should parse a diff with multiple file changes", () => {
    const result = parseDiffToStructured(mockMultipleFilesChange);
    expect(result).toHaveLength(2);

    const firstFile = result[0];
    expect(firstFile.oldPath).toBe("fileA.txt");
    expect(firstFile.newPath).toBe("fileA.txt");
    expect(firstFile.additions).toBe(1);
    expect(firstFile.deletions).toBe(1);
    expect(firstFile.hunks).toHaveLength(1);
    expect(firstFile.hunks[0].header).toBe("@@ -1,2 +1,2 @@");
    expect(firstFile.hunks[0].lines).toEqual([
      { type: "deletion", content: "Original line in A" },
      { type: "addition", content: "New line in A" },
      { type: "context", content: "Common line" },
    ]);

    const secondFile = result[1];
    expect(secondFile.oldPath).toBe("fileB.txt");
    expect(secondFile.newPath).toBe("fileB.txt");
    expect(secondFile.additions).toBe(2);
    expect(secondFile.deletions).toBe(1);
    expect(secondFile.hunks).toHaveLength(1);
    expect(secondFile.hunks[0].header).toBe("@@ -5,3 +5,4 @@");
    expect(secondFile.hunks[0].lines).toEqual([
      { type: "context", content: "Another line" },
      { type: "deletion", content: "This will be removed" },
      { type: "addition", content: "This is added" },
      { type: "context", content: "And one more" },
      { type: "addition", content: "And a final new line" },
    ]);
  });

  it("should parse a diff for a new file", () => {
    const result = parseDiffToStructured(mockNewFile);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("/dev/null");
    expect(fileChange.newPath).toBe("new_file.txt");
    expect(fileChange.additions).toBe(3);
    expect(fileChange.deletions).toBe(0);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -0,0 +1,3 @@");
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "addition", content: "This is a new file." },
      { type: "addition", content: "It has multiple lines." },
      { type: "addition", content: "Added content." },
    ]);
  });

  it("should parse a diff for a deleted file", () => {
    const result = parseDiffToStructured(mockDeletedFile);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("deleted_file.txt");
    expect(fileChange.newPath).toBe("/dev/null");
    expect(fileChange.additions).toBe(0);
    expect(fileChange.deletions).toBe(2);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -1,2 +0,0 @@");
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "Content of the deleted file." },
      { type: "deletion", content: "Another line." },
    ]);
  });

  it("should parse a diff for a renamed file (no content changes)", () => {
    // Note: parseDiffToStructured focuses on content changes.
    // Pure renames without content changes might not produce hunks.
    const result = parseDiffToStructured(mockRenamedFile);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("old_name.txt");
    expect(fileChange.newPath).toBe("new_name.txt");
    expect(fileChange.additions).toBe(0);
    expect(fileChange.deletions).toBe(0);
    expect(fileChange.hunks).toEqual([]); // No content change, so no hunks
  });

  it("should parse a diff for a renamed file with content changes", () => {
    const result = parseDiffToStructured(mockRenamedFileWithChanges);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("source.txt");
    expect(fileChange.newPath).toBe("destination.txt");
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -1,4 +1,4 @@");
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "context", content: "First line" },
      { type: "deletion", content: "Second line (old)" },
      { type: "addition", content: "Second line (new)" },
      { type: "context", content: "Third line" },
      { type: "context", content: "Fourth line" },
    ]);
  });

  it("should parse a diff with multiple hunks in a single file", () => {
    const result = parseDiffToStructured(mockMultipleHunks);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("multi_hunk_file.txt");
    expect(fileChange.newPath).toBe("multi_hunk_file.txt");
    expect(fileChange.additions).toBe(2);
    expect(fileChange.deletions).toBe(2);
    expect(fileChange.hunks).toHaveLength(2);

    const firstHunk = fileChange.hunks[0];
    expect(firstHunk.header).toBe("@@ -1,5 +1,5 @@");
    expect(firstHunk.lines).toEqual([
      { type: "context", content: "Context line 1" },
      { type: "deletion", content: "Removed line 1" },
      { type: "addition", content: "Added line 1" },
      { type: "context", content: "Context line 2" },
      { type: "context", content: "Context line 3" },
      { type: "context", content: "Context line 4" },
    ]);

    const secondHunk = fileChange.hunks[1];
    expect(secondHunk.header).toBe("@@ -10,5 +10,5 @@");
    expect(secondHunk.lines).toEqual([
      { type: "context", content: "Context line 10" },
      { type: "context", content: "Context line 11" },
      { type: "deletion", content: "Removed line 2" },
      { type: "addition", content: "Added line 2" },
      { type: "context", content: "Context line 12" },
      { type: "context", content: "Context line 13" },
    ]);
  });

  it("should handle diffs with 'No newline at end of file' markers", () => {
    const result = parseDiffToStructured(mockNoNewlineAtEndOfFile);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("file.txt");
    expect(fileChange.newPath).toBe("file.txt");
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -1 +1 @@");
    // The '\ No newline...' lines are not part of hunk content in this parser
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "old content" },
      { type: "addition", content: "new content" },
    ]);
  });

  it("should parse a diff with only additions (new file)", () => {
    const result = parseDiffToStructured(mockDiffWithOnlyAdditions);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("/dev/null");
    expect(fileChange.newPath).toBe("added_only.txt");
    expect(fileChange.additions).toBe(2);
    expect(fileChange.deletions).toBe(0);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "addition", content: "New line 1" },
      { type: "addition", content: "New line 2" },
    ]);
  });

  it("should parse a diff with only deletions (deleted file)", () => {
    const result = parseDiffToStructured(mockDiffWithOnlyDeletions);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("deleted_only.txt");
    expect(fileChange.newPath).toBe("/dev/null");
    expect(fileChange.additions).toBe(0);
    expect(fileChange.deletions).toBe(2);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "Old line 1" },
      { type: "deletion", content: "Old line 2" },
    ]);
  });

  it("should parse a diff with a hunk containing only context lines", () => {
    const result = parseDiffToStructured(mockDiffWithContextOnlyHunk);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("context_only.txt");
    expect(fileChange.newPath).toBe("context_only.txt");
    // Additions and deletions should be 0 if only context lines are present in hunks
    expect(fileChange.additions).toBe(0);
    expect(fileChange.deletions).toBe(0);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "context", content: "unchanged line 1" },
      { type: "context", content: "unchanged line 2" },
      { type: "context", content: "unchanged line 3" },
    ]);
  });

  it("should correctly parse a complex diff example with multiple files and hunks", () => {
    const result: FileChange[] = parseDiffToStructured(mockComplexExample);
    expect(result).toHaveLength(2);

    const firstFile = result[0];
    expect(firstFile.oldPath).toBe("src/complex.js");
    expect(firstFile.newPath).toBe("src/complex.js");
    expect(firstFile.additions).toBe(6);
    expect(firstFile.deletions).toBe(2); // console.log and return null
    expect(firstFile.hunks).toHaveLength(2);

    expect(firstFile.hunks[0].header).toBe("@@ -5,7 +5,7 @@");
    expect(firstFile.hunks[0].lines).toEqual([
      { type: "context", content: "  function oldFunction() {" },
      { type: "deletion", content: '    console.log("old");' },
      { type: "addition", content: '    console.log("new");' },
      { type: "context", content: "  }" },
      { type: "context", content: "" },
      { type: "context", content: "  // unchanged part" },
    ]);

    expect(firstFile.hunks[1].header).toBe("@@ -20,3 +20,8 @@");
    expect(firstFile.hunks[1].lines).toEqual([
      { type: "context", content: "  function anotherFunction() {" },
      { type: "deletion", content: "    return null;" },
      { type: "addition", content: '    return "something";' },
      { type: "context", content: "  }" },
      { type: "addition", content: "" },
      { type: "addition", content: "  function newFunction() {" },
      { type: "addition", content: '    return "newly added";' },
      { type: "addition", content: "  }" },
    ]);

    const secondFile = result[1];
    expect(secondFile.oldPath).toBe("README.md");
    expect(secondFile.newPath).toBe("README.md");
    expect(secondFile.additions).toBe(2);
    expect(secondFile.deletions).toBe(1);
    expect(secondFile.hunks).toHaveLength(1);
    expect(secondFile.hunks[0].header).toBe("@@ -1,2 +1,3 @@");
    expect(secondFile.hunks[0].lines).toEqual([
      { type: "context", content: "# Project Title" },
      { type: "deletion", content: "Old description" },
      { type: "addition", content: "New and improved description" },
      { type: "addition", content: "Additional line." },
    ]);
  });

  it("should handle empty lines within hunks correctly", () => {
    const diffWithEmptyLines = `diff --git a/file.txt b/file.txt
index 123..456 100644
--- a/file.txt
+++ b/file.txt
@@ -1,5 +1,6 @@
 Line 1
-Line 2
+Line Two
+
 Line 3
 Line 4
+Line 5 added
`;
    const result = parseDiffToStructured(diffWithEmptyLines);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.additions).toBe(3);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "context", content: "Line 1" },
      { type: "deletion", content: "Line 2" },
      { type: "addition", content: "Line Two" },
      { type: "addition", content: "" },
      { type: "context", content: "Line 3" },
      { type: "context", content: "Line 4" },
      { type: "addition", content: "Line 5 added" },
    ]);
  });

  it("should handle diffs with no common lines at the end of a hunk", () => {
    const diff = `diff --git a/test.txt b/test.txt
index 123..456 100644
--- a/test.txt
+++ b/test.txt
@@ -1,2 +1,2 @@
-old line
+new line`; // No context line at the end
    const result = parseDiffToStructured(diff);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "old line" },
      { type: "addition", content: "new line" },
    ]);
  });

  it("should handle diffs with no common lines at the start of a hunk", () => {
    const diff = `diff --git a/test.txt b/test.txt
index 123..456 100644
--- a/test.txt
+++ b/test.txt
@@ -1,2 +1,2 @@
-old line
+new line
 common line`;
    const result = parseDiffToStructured(diff);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "old line" },
      { type: "addition", content: "new line" },
      { type: "context", content: "common line" },
    ]);
  });

  it("should handle diff with only one line change", () => {
    const diff = `diff --git a/single_line_change.txt b/single_line_change.txt
index e0262b5..29a8b95 100644
--- a/single_line_change.txt
+++ b/single_line_change.txt
@@ -1 +1 @@
-hello
+world
`;
    const result = parseDiffToStructured(diff);
    expect(result).toHaveLength(1);
    const fileChange = result[0];
    expect(fileChange.oldPath).toBe("single_line_change.txt");
    expect(fileChange.newPath).toBe("single_line_change.txt");
    expect(fileChange.additions).toBe(1);
    expect(fileChange.deletions).toBe(1);
    expect(fileChange.hunks).toHaveLength(1);
    expect(fileChange.hunks[0].header).toBe("@@ -1 +1 @@");
    expect(fileChange.hunks[0].lines).toEqual([
      { type: "deletion", content: "hello" },
      { type: "addition", content: "world" },
    ]);
  });

  it("should handle diff with binary file changes (no hunks expected)", () => {
    const diff = `diff --git a/image.png b/image.png
GIT binary patch
literal 0
HcmV?d00001

literal 15
HcmV;R00001{<*AW6<*AWcNGL@

`;
    const result = parseDiffToStructured(diff);
    // Binary files might not produce standard hunks, or the parser might skip them.
    // Depending on the desired behavior for binary files, this test might need adjustment.
    // For now, assume it creates a file entry but no hunks if no '@@' lines are found.
    if (result.length > 0) {
      const fileChange = result[0];
      expect(fileChange.oldPath).toBe("image.png");
      expect(fileChange.newPath).toBe("image.png");
      expect(fileChange.hunks).toEqual([]);
    } else {
      // Or, if binary files are skipped entirely:
      expect(result).toEqual([]);
    }
  });
});
