import { DiffHunk, FileChange } from "../../types";

export function parseDiffToStructured(diffString: string): FileChange[] {
  const fileChanges: FileChange[] = [];
  const lines = diffString.split("\n");

  let currentFile: FileChange | null = null;
  let currentHunk: DiffHunk | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of a new file diff
    if (line.startsWith("diff --git ")) {
      // Previous file processing complete
      if (currentFile) {
        if (currentHunk && currentHunk.lines.length > 0) {
          currentFile.hunks.push(currentHunk);
        }
        fileChanges.push(currentFile);
      }

      const paths = line.match(/diff --git a\/(.*) b\/(.*)/);
      // Initialize with paths from diff --git, can be overridden by --- and +++ lines
      let oldPath = paths?.[1] || "";
      let newPath = paths?.[2] || "";
      
      // Check for new or deleted files based on subsequent lines
      // This is a heuristic and might need refinement for complex cases
      if (lines[i + 1] && lines[i + 1].startsWith("new file mode")) {
        oldPath = "/dev/null";
      }
      if (lines[i + 1] && lines[i + 1].startsWith("deleted file mode")) {
        newPath = "/dev/null";
      }


      currentFile = {
        oldPath,
        newPath,
        additions: 0,
        deletions: 0,
        hunks: [],
      };
      currentHunk = null; // Reset hunk for the new file
      continue;
    }

    if (!currentFile) continue; // Skip lines until a diff --git is found

    // Handle --- a/path and +++ b/path lines to correctly set oldPath and newPath
    if (line.startsWith("--- a/")) {
      currentFile.oldPath = line.substring(6);
      continue;
    }
    if (line.startsWith("--- /dev/null")) {
      currentFile.oldPath = "/dev/null";
      continue;
    }
    if (line.startsWith("+++ b/")) {
      currentFile.newPath = line.substring(6);
      continue;
    }
    if (line.startsWith("+++ /dev/null")) {
      currentFile.newPath = "/dev/null";
      continue;
    }
    
    // Hunk header (e.g., @@ -1,5 +1,5 @@)
    if (line.startsWith("@@ ") && line.includes(" @@")) {
      if (currentHunk && currentHunk.lines.length > 0) { // Push previous hunk if it has lines
        currentFile.hunks.push(currentHunk);
      }
      currentHunk = { // Start a new hunk
        header: line,
        lines: [],
      };
      continue;
    }

    // Process diff line if inside a hunk
    if (currentHunk) {
      if (line.startsWith("+")) {
        currentHunk.lines.push({
          type: "addition",
          content: line.substring(1),
        });
        currentFile.additions++;
      } else if (line.startsWith("-")) {
        currentHunk.lines.push({
          type: "deletion",
          content: line.substring(1),
        });
        currentFile.deletions++;
      } else if (line.startsWith(" ")) { // Context line
        currentHunk.lines.push({
          type: "context",
          content: line.substring(1),
        });
      } else if (line.startsWith("\\ No newline at end of file")) {
        // This line indicates the preceding line didn't have a newline.
        // Depending on strictness, you might want to mark the previous line or ignore this.
        // For now, we'll add it as a special type of context if needed, or simply ignore.
        // If the goal is to match the `git diff` output structure closely, these lines are often omitted
        // from the "content" lines of hunks in many parsers.
        // Let's try ignoring it for now to pass the tests that expect it to be excluded.
      } else if (line.length > 0 && (!line.startsWith("diff --git") && !line.startsWith("index") && !line.startsWith("---") && !line.startsWith("+++") && !line.startsWith("@@"))) {
        // Capture non-empty lines that are not control lines as context.
        // Also capture empty lines if they are not the very last line of the input (which is often just a trailing newline on the diff string itself)
        if (line.trim().length > 0 || i < lines.length - 1) {
             currentHunk.lines.push({
                type: "context",
                content: line,
            });
        }
      }
      // Note: Trailing empty line (if it's the absolute last line of `lines` array and is empty) will be skipped by the loop or this logic.
    }
  }

  // Finalize the last processed file and hunk
  if (currentFile) {
    if (currentHunk && currentHunk.lines.length > 0) {
      currentFile.hunks.push(currentHunk);
    }
    // Add the file if it has meaningful changes.
    if (currentFile.hunks.length > 0 ||
        currentFile.oldPath === "/dev/null" ||
        currentFile.newPath === "/dev/null" ||
        (currentFile.oldPath !== currentFile.newPath) // Covers renames even without content change
       ) {
      // Check for binary files or other non-hunk changes that still constitute a file change
      const isBinaryOrSpecialChange = lines.some(l => l.startsWith(`Binary files ${currentFile.oldPath} and ${currentFile.newPath} differ`)) ||
                                   (currentFile.oldPath !== currentFile.newPath && currentFile.hunks.length === 0 && currentFile.additions === 0 && currentFile.deletions === 0);

      if(currentFile.hunks.length > 0 || isBinaryOrSpecialChange || currentFile.additions > 0 || currentFile.deletions > 0 || currentFile.oldPath === "/dev/null" || currentFile.newPath === "/dev/null") {
        fileChanges.push(currentFile);
      }
    }
  }
  return fileChanges;
}