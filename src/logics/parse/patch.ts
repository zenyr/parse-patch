import { ParseOptions, ParsedCommit, FileChange } from "../../types";
import { parseDiffToStructured } from "./diffToStructured";

const HEADERS = {
  FROM: "From: ",
  DATE: "Date: ",
  SUBJECT: "Subject: ",
};

const REGEX = {
  FROM: /^From\s+([0-9a-f]{40})\s/,
  AUTHOR_EMAIL: /<(.*)>/,
  PATCH_HEADER: /^\[PATCH[^\]]*\]\s*/,
};

export function parseGitPatch(
  patch: string,
  options: ParseOptions = {}
): ParsedCommit[] {
  const lines = patch.split("\n");
  const commits: ParsedCommit[] = [];

  let currentSha = "";
  let currentAuthorName = "";
  let currentAuthorEmail = "";
  let currentDate = "";
  let currentMessageLines: string[] = [];
  let currentDiffLines: string[] = [];
  let inMessageSection = false;
  let inDiffSection = false;
  let foundDiffStart = false; // To track when we've hit `diff --git`

  const finalizeCommit = () => {
    if (!currentSha) return; // No commit started yet

    const message = currentMessageLines.join("\n").trimEnd(); // trimEnd to preserve leading/internal newlines
    let date: string | Date = currentDate;
    // Join lines, then trim trailing newlines that might have been added if the original patch ended with multiple blank lines.
    // Then, ensure a single trailing newline if there's content.
    let diffString = currentDiffLines.join("\n").replace(/\n+$/, "");
    if (diffString.length > 0) {
      diffString += "\n";
    }
    
    let diff: string | FileChange[] = diffString;

    // Process based on options
    if (options.parseDates && currentDate) {
      try {
        date = new Date(currentDate);
      } catch (e) {
        // Keep original string if date parsing fails
        console.warn(`Failed to parse date: ${currentDate}`);
      }
    }

    // Process structured diff
    if (
      options.structuredDiff &&
      typeof diff === "string" &&
      diff.trim().length > 0
    ) {
      diff = parseDiffToStructured(diff);
    }

    commits.push({
      sha: currentSha,
      authorName: currentAuthorName,
      authorEmail: currentAuthorEmail,
      date,
      message,
      diff,
    });

    // Reset for next commit
    resetCommitState();
  };

  const resetCommitState = () => {
    currentSha = "";
    currentAuthorName = "";
    currentAuthorEmail = "";
    currentDate = "";
    currentMessageLines = [];
    currentDiffLines = [];
    inMessageSection = false;
    inDiffSection = false;
    foundDiffStart = false;
  };

  for (const line of lines) {
    // Detect the start of a new commit
    const fromMatch = line.match(REGEX.FROM);
    if (fromMatch) {
      finalizeCommit();
      currentSha = fromMatch[1];
      continue;
    }

    // Parse author line: From: Name <email>
    if (line.startsWith(HEADERS.FROM)) {
      const authorLine = line.slice(HEADERS.FROM.length).trim();
      const emailMatch = authorLine.match(REGEX.AUTHOR_EMAIL);
      if (emailMatch) {
        currentAuthorEmail = emailMatch[1];
        currentAuthorName = authorLine.slice(0, authorLine.indexOf("<")).trim();
      } else {
        currentAuthorName = authorLine;
      }
      continue;
    }

    // Parse date line: Date: ...
    if (line.startsWith(HEADERS.DATE)) {
      currentDate = line.slice(HEADERS.DATE.length).trim();
      continue;
    }

    // Parse subject line
    if (line.startsWith(HEADERS.SUBJECT)) {
      let subject = line.slice(HEADERS.SUBJECT.length).trim();
      // Remove leading "[PATCH ...]" if present
      subject = subject.replace(REGEX.PATCH_HEADER, "");
      currentMessageLines.push(subject);
      inMessageSection = true;
      continue;
    }

    // Check if we are transitioning to diff section
    if (inMessageSection && line.trim() === "---") {
      inMessageSection = false;
      inDiffSection = true;
      continue;
    }

    // If we are in the message section, just append lines to message
    if (inMessageSection) {
      // For subject lines, they are already pushed.
      // For subsequent message lines, they might have leading spaces from the patch format.
      // We should preserve these as they are part of the message.
      currentMessageLines.push(line);
      continue;
    }

    // If we are in the diff section but haven't found `diff --git` yet
    if (inDiffSection && !foundDiffStart) {
      // Look for the start of the actual diff
      if (line.startsWith("diff --git ")) {
        foundDiffStart = true;
        currentDiffLines.push(line);
      }
      // Ignore everything until we find `diff --git`
      continue;
    }

    // If we are in diff section and already found `diff --git`
    if (inDiffSection && foundDiffStart) {
      // Stop capturing when we hit a line that, after trimming, is `--`
      if (line.trim() === "--") {
        inDiffSection = false;
        foundDiffStart = false;
        continue;
      }
      currentDiffLines.push(line);
      continue;
    }
  }

  finalizeCommit();

  return commits;
}