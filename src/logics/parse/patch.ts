import { ParseOptions, ParsedCommit } from "../../types";
import { parseDiffToStructured } from "./diffToStructured";
import { HEADERS, REGEX } from "../../consts";

export function parseGitPatch<
  O extends ParseOptions<any, any> = ParseOptions<false, false>
>(
  patch: string,
  options: O = { parseDates: false, structuredDiff: false } as O
): ParsedCommit<O>[] {
  type DateType = ParsedCommit<O>["date"];
  type DiffType = ParsedCommit<O>["diff"];
  const lines = patch.split("\n");
  const commits: ParsedCommit<O>[] = [];

  let currentSha = "";
  let currentAuthorName = "";
  let currentAuthorEmail = "";
  let currentDate = "";
  let currentMessageLines: string[] = [];
  let currentDiffLines: string[] = [];
  let inMessageSection = false;
  let inDiffSection = false;
  let foundDiffStart = false;

  const finalizeCommit = () => {
    if (!currentSha) return;

    const message = currentMessageLines.join("\n").trimEnd();
    let diffString = currentDiffLines.join("\n").replace(/\n+$/, "");
    if (diffString.length > 0) {
      diffString += "\n";
    }

    const date = (
      options.parseDates && currentDate ? new Date(currentDate) : currentDate
    ) as DateType;

    const shouldStructurizeDiff =
      options.structuredDiff && diffString.trim().length > 0;
    const diff = (
      shouldStructurizeDiff ? parseDiffToStructured(diffString) : diffString
    ) as DiffType;

    commits.push({
      sha: currentSha,
      authorName: currentAuthorName,
      authorEmail: currentAuthorEmail,
      date,
      message,
      diff,
    });

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
    const fromMatch = line.match(REGEX.FROM);
    if (fromMatch) {
      finalizeCommit();
      currentSha = fromMatch[1];
      continue;
    }

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

    if (line.startsWith(HEADERS.DATE)) {
      currentDate = line.slice(HEADERS.DATE.length).trim();
      continue;
    }

    if (line.startsWith(HEADERS.SUBJECT)) {
      let subject = line.slice(HEADERS.SUBJECT.length).trim();
      subject = subject.replace(REGEX.PATCH_HEADER, "");
      currentMessageLines.push(subject);
      inMessageSection = true;
      continue;
    }

    if (inMessageSection && line.trim() === "---") {
      inMessageSection = false;
      inDiffSection = true;
      continue;
    }

    if (inMessageSection) {
      currentMessageLines.push(line);
      continue;
    }

    if (inDiffSection && !foundDiffStart) {
      if (line.startsWith("diff --git ")) {
        foundDiffStart = true;
        currentDiffLines.push(line);
      }
      continue;
    }

    if (inDiffSection && foundDiffStart) {
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
