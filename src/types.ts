export interface ParseOptions<
  PDate extends boolean = boolean, // Allow any boolean for the base definition
  SDiff extends boolean = boolean // Allow any boolean for the base definition
> {
  parseDates?: PDate;
  structuredDiff?: SDiff;
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

interface DiffLine {
  type: "addition" | "deletion" | "context";
  content: string;
}

type SelectIfTrue<T extends boolean | undefined, U, V> = T extends true ? U : V;

export interface ParsedCommit<
  O extends ParseOptions<boolean, boolean> = ParseOptions<false, false>
> {
  sha: string;
  authorName: string;
  authorEmail: string;
  date: SelectIfTrue<O["parseDates"], Date, string>;
  message: string;
  diff: SelectIfTrue<O["structuredDiff"], FileChange[], string>;
}
