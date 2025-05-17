import { describe, expect, it } from "bun:test";

import {
  mockCreateWorkerPlaceholder,
  mockLongTrickyMessage,
  mockMalformed,
  mockMultipleCommits,
  mockMultipleFilesAndHunks,
  mockNoDiff,
  mockNoMessageLinesAfterSubject,
  mockSingleCommit,
} from "../../mocks/patch.js";
import { parseGitPatch } from "./patch.js";

describe("parseGitPatch", () => {
  it("parses a single commit patch", () => {
    const commits = parseGitPatch(mockSingleCommit);
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(commit.sha).toBe("f9ec51d9919f16c09476f51eaa19b818564904b2");
    expect(commit.authorName).toBe("John Doe");
    expect(commit.authorEmail).toBe("john@example.com");
    expect(commit.date).toBe("Wed, 12 Oct 2022 14:38:15 +0200");
    expect(commit.message).toBe(
      "My commit message\n\nSome more lines of the commit message."
    );
    expect(commit.diff).toBe(`diff --git a/file1.txt b/file1.txt
index 24967d3..b37620a 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,6 +1,6 @@
Line 1
-Line 2
+Line 2 changed
Line 3
Line 4
Line 5
Line 6
`);
  });

  it("parses multiple commits patch", () => {
    const commits = parseGitPatch(mockMultipleCommits);
    expect(commits).toHaveLength(2);

    const [first, second] = commits;

    expect(first.sha).toBe("f9ec51d9919f16c09476f51eaa19b818564904b2");
    expect(first.authorName).toBe("John Doe");
    expect(first.authorEmail).toBe("john@example.com");
    expect(first.date).toBe("Wed, 12 Oct 2022 14:38:15 +0200");
    expect(first.message).toBe("First commit message\n\nLine two of message.");
    expect(first.diff).toBe(`diff --git a/file1.txt b/file1.txt
index 24967d3..b37620a 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,6 +1,6 @@
Line 1
-Line 2
+Line 2 changed
Line 3
Line 4
Line 5
Line foo
`);
    expect(second.sha).toBe("4e9c51d9919f16c09476f51eaa19b818564904b1");
    expect(second.authorName).toBe("Jane Smith");
    expect(second.authorEmail).toBe("jane@example.com");
    expect(second.date).toBe("Thu, 13 Oct 2022 15:38:15 +0200");
    expect(second.message).toBe(
      "Second commit message\n\nAnother line\nAnd another."
    );
    expect(second.diff).toBe(`diff --git a/file2.txt b/file2.txt
index 24967d3..b37620a 100644
--- a/file2.txt
+++ b/file2.txt
@@ -1,6 +1,6 @@
Line 1
-Line 2
+Line 2 changed again
Line 3
Line 4
Line 5
Line bar
`);
  });

  it("handles multiline messages without any message lines after subject", () => {
    const commits = parseGitPatch(mockNoMessageLinesAfterSubject);
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(commit.message).toBe("Just a subject");
    expect(commit.diff).toContain("diff --git a/file.txt b/file.txt");
  });

  it("handles no diff scenario (just a commit message)", () => {
    const commits = parseGitPatch(mockNoDiff);
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(commit.message).toBe("No diff commit\n\nNo changes in this commit.");
    expect(commit.diff).toBe("");
  });

  it("handles malformed input gracefully (no commits)", () => {
    const commits = parseGitPatch(mockMalformed);
    expect(commits).toHaveLength(0);
  });

  it("parses a commit with multiple files changed and multiple hunks", () => {
    const commits = parseGitPatch(mockMultipleFilesAndHunks);
    expect(commits).toHaveLength(1);
    const commit = commits[0];

    expect(commit.sha).toBe("1234567890abcdef1234567890abcdef12345678");
    expect(commit.authorName).toBe("Multi Hunk");
    expect(commit.authorEmail).toBe("multihunk@example.com");
    expect(commit.date).toBe("Sat, 15 Oct 2022 16:00:00 +0000");
    expect(commit.message).toBe(
      "Multiple files and hunks commit\n\nThis commit changes multiple files and has multiple hunks in one file."
    );

    // Check that diff contains both files and multiple hunks
    expect(commit.diff).toContain("diff --git a/fileA.txt b/fileA.txt");
    expect(commit.diff).toContain("+Line A2 changed");
    expect(commit.diff).toContain("+Line A6 new line"); // from the second hunk in fileA.txt

    expect(commit.diff).toContain("diff --git a/fileB.txt b/fileB.txt");
    expect(commit.diff).toContain("new file mode 100644");
    expect(commit.diff).toContain("+Line B5");
  });

  it("parses a commit with a long multi-line message and tricky formatting", () => {
    const commits = parseGitPatch(mockLongTrickyMessage);
    expect(commits).toHaveLength(1);
    const commit = commits[0];

    expect(commit.sha).toBe("abc123abc123abc123abc123abc123abc123abc1");
    expect(commit.authorName).toBe("Tricky Author");
    expect(commit.authorEmail).toBe("tricky@example.com");
    expect(commit.date).toBe("Mon, 16 Oct 2022 12:34:56 +0000");

    // Verify that the message includes all expected lines and formatting.
    // Be sure it includes lines that look like patch headers but aren't, trailing spaces, and so forth.
    const expectedMessage = `This is a long, multi-line commit message
 that spans multiple lines,
 includes some empty lines,
 and lines that might look like diffs but are not.

Some lines have trailing spaces:
And some lines have unusual indentation:
    Indented line here
Another line that looks like a patch hunk header but isn't:
@@ -10,5 +10,7 @@ This is not really a diff

Also lines that might contain symbols like +++ or --- in the message body are still part of the message:
+++ Still message line
--- Still message line

At the end of the day, this should all be captured as part of the commit message.`.trim();

    expect(commit.message).toBe(expectedMessage);

    // Verify the diff
    expect(commit.diff).toContain("diff --git a/fileC.txt b/fileC.txt");
    expect(commit.diff).toContain("+Tricky line 1");
    expect(commit.diff).toContain("+Tricky line 2");
  });

  it("parses this patch", () => {
    const expectedDiff = `diff --git a/src/ai/workers/create-worker.ts b/src/ai/workers/create-worker.ts
index 4328ba4..63af774 100644
--- a/src/ai/workers/create-worker.ts
+++ b/src/ai/workers/create-worker.ts
@@ -1,4 +1,5 @@
-export function createWorker(): void {
-  // TODO: implement your worker logic here
-  console.log('createWorker called');
+// placeholder to begin.
+
+export function createWorkerPlaceholder() {
+  return 'placeholder';
 }
`;

    const commits = parseGitPatch(mockCreateWorkerPlaceholder);
    expect(commits).toHaveLength(1);
    expect(commits[0].diff).toBe(expectedDiff);
  });
});

describe("parseGitPatch with options", () => {
  const mockCommit = mockSingleCommit; // Use a simple mock for option testing

  it("parses with parseDates: true", () => {
    const commits = parseGitPatch(mockCommit, { parseDates: true });
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(commit.date).toBeInstanceOf(Date);
    expect((commit.date as Date).toISOString()).toBe(
      new Date("Wed, 12 Oct 2022 14:38:15 +0200").toISOString()
    );
    expect(typeof commit.diff).toBe("string"); // structuredDiff is false by default or explicitly
  });

  it("parses with structuredDiff: true", () => {
    const commits = parseGitPatch(mockCommit, { structuredDiff: true });
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(typeof commit.date).toBe("string"); // parseDates is false
    expect(Array.isArray(commit.diff)).toBe(true);
    expect(commit.diff.length).toBeGreaterThan(0);
    const firstDiff = commit.diff[0];
    expect(firstDiff).toHaveProperty("oldPath");
    expect(firstDiff).toHaveProperty("newPath");
    expect(firstDiff).toHaveProperty("hunks");
    expect(firstDiff.oldPath).toBe("file1.txt");
    expect(firstDiff.newPath).toBe("file1.txt");
    expect(firstDiff.hunks).toBeArray();
    expect(firstDiff.hunks[0].lines).toBeArray();
  });

  it("parses with parseDates: true and structuredDiff: true", () => {
    const commits = parseGitPatch(mockCommit, {
      parseDates: true,
      structuredDiff: true,
    });
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(commit.date).toBeInstanceOf(Date);
    expect((commit.date as Date).toISOString()).toBe(
      new Date("Wed, 12 Oct 2022 14:38:15 +0200").toISOString()
    );
    expect(Array.isArray(commit.diff)).toBe(true);
    expect(commit.diff.length).toBeGreaterThan(0);
    const firstDiff = commit.diff[0];
    expect(firstDiff).toHaveProperty("oldPath");
    expect(firstDiff).toHaveProperty("newPath");
    expect(firstDiff).toHaveProperty("hunks");
    expect(firstDiff.oldPath).toBe("file1.txt");
    expect(firstDiff.newPath).toBe("file1.txt");
  });

  it("parses with default options (equivalent to parseDates: false, structuredDiff: false)", () => {
    const commits = parseGitPatch(mockCommit, {}); // Empty options object
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(typeof commit.date).toBe("string");
    expect(commit.date).toBe("Wed, 12 Oct 2022 14:38:15 +0200");
    expect(typeof commit.diff).toBe("string");
    expect(commit.diff).toContain("diff --git a/file1.txt b/file1.txt");
  });

  it("parses with explicit false options", () => {
    const commits = parseGitPatch(mockCommit, {
      parseDates: false,
      structuredDiff: false,
    });
    expect(commits).toHaveLength(1);
    const commit = commits[0];
    expect(typeof commit.date).toBe("string");
    expect(commit.date).toBe("Wed, 12 Oct 2022 14:38:15 +0200");
    expect(typeof commit.diff).toBe("string");
    expect(commit.diff).toContain("diff --git a/file1.txt b/file1.txt");
  });
});
