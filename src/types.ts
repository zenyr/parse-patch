export interface ParseOptions {
  parseDates?: boolean;
  structuredDiff?: boolean;
}

export interface FileChange {
  oldPath: string;
  newPath: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffLine {
  type: "addition" | "deletion" | "context";
  content: string;
}

export interface ParsedCommit {
  sha: string;
  authorName: string;
  authorEmail: string;
  date: string | Date;
  message: string;
  diff: string | FileChange[];
}