export const mockSingleCommit = `From f9ec51d9919f16c09476f51eaa19b818564904b2 Mon Sep 17 00:00:00 2001
From: John Doe <john@example.com>
Date: Wed, 12 Oct 2022 14:38:15 +0200
Subject: [PATCH] My commit message

Some more lines of the commit message.

---
 file1.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/file1.txt b/file1.txt
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
-- 
2.47.1`;

export const mockMultipleCommits = `From f9ec51d9919f16c09476f51eaa19b818564904b2 Mon Sep 17 00:00:00 2001
From: John Doe <john@example.com>
Date: Wed, 12 Oct 2022 14:38:15 +0200
Subject: [PATCH 1/2] First commit message

Line two of message.

---
 file1.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/file1.txt b/file1.txt
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
From 4e9c51d9919f16c09476f51eaa19b818564904b1 Mon Sep 17 00:00:00 2001
From: Jane Smith <jane@example.com>
Date: Thu, 13 Oct 2022 15:38:15 +0200
Subject: [PATCH 1/2] Second commit message

Another line
And another.

---
 file2.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/file2.txt b/file2.txt
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
Line bar`;

export const mockNoMessageLinesAfterSubject = `From abcdef1111111111111111111111111111111111 Mon Sep 17 00:00:00 2001
From: No Extra <noextra@example.com>
Date: Fri, 14 Oct 2022 10:00:00 +0000
Subject: Just a subject

---
 file.txt | 1 +
 1 file changed, 1 insertion(+)

diff --git a/file.txt b/file.txt
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/file.txt
@@ -0,0 +1 @@
+Hello world
`;

export const mockNoDiff = `From abcdef1111111111111111111111111111111111 Mon Sep 17 00:00:00 2001
From: Jane Doe <jane@example.com>
Date: Fri, 14 Oct 2022 10:00:00 +0000
Subject: [PATCH] No diff commit

No changes in this commit.

---
`;

export const mockMalformed = `This is just random text
with no From line at all.
`;

export const mockMultipleFilesAndHunks = `From 1234567890abcdef1234567890abcdef12345678 Mon Sep 17 00:00:00 2001
From: Multi Hunk <multihunk@example.com>
Date: Sat, 15 Oct 2022 16:00:00 +0000
Subject: [PATCH] Multiple files and hunks commit

This commit changes multiple files and has multiple hunks in one file.

---
 fileA.txt | 3 ++-
 fileB.txt | 5 +++++
 2 files changed, 7 insertions(+), 1 deletion(-)

diff --git a/fileA.txt b/fileA.txt
index 24967d3..b37620a 100644
--- a/fileA.txt
+++ b/fileA.txt
@@ -1,3 +1,3 @@
 Line A1
-Line A2
+Line A2 changed
 Line A3
@@ -5,6 +5,7 @@ Line A4
 Line A5
+Line A6 new line

diff --git a/fileB.txt b/fileB.txt
new file mode 100644
index 0000000..0abcd12
--- /dev/null
+++ b/fileB.txt
@@ -0,0 +1,5 @@
+Line B1
+Line B2
+Line B3
+Line B4
+Line B5
`;

export const mockLongTrickyMessage = `From abc123abc123abc123abc123abc123abc123abc1 Mon Sep 17 00:00:00 2001
From: Tricky Author <tricky@example.com>
Date: Mon, 16 Oct 2022 12:34:56 +0000
Subject: [PATCH] This is a long, multi-line commit message
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

At the end of the day, this should all be captured as part of the commit message.

---
 fileC.txt | 2 ++
 1 file changed, 2 insertions(+)

diff --git a/fileC.txt b/fileC.txt
new file mode 100644
index 0000000..1111111
--- /dev/null
+++ b/fileC.txt
@@ -0,0 +1,2 @@
+Tricky line 1
+Tricky line 2
`;

export const mockCreateWorkerPlaceholder = `
From 44c8f979f6b96b9dd8c06a36a5a0cb13a5a67ab6 Mon Sep 17 00:00:00 2001
From: Foo <foo@dexa.ai>
Date: Thu, 19 Dec 2024 20:54:06 +0000
Subject: [PATCH] feat: Some changes

---
 src/ai/workers/create-worker.ts | 7 ++++---
 1 file changed, 4 insertions(+), 3 deletions(-)

diff --git a/src/ai/workers/create-worker.ts b/src/ai/workers/create-worker.ts
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
-- 
2.39.5`;

export const mockDateParsing = `From f9ec51d9919f16c09476f51eaa19b818564904b2 Mon Sep 17 00:00:00 2001
From: John Doe <john@example.com>
Date: Wed, 12 Oct 2022 14:38:15 +0200
Subject: [PATCH] My commit message

---
 file1.txt | 1 +
 1 file changed, 1 insertion(+)

diff --git a/file1.txt b/file1.txt
index 24967d3..b37620a 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1,2 @@
 Line 1
+Line 2
`;

export const mockStructuredDiff = `From f9ec51d9919f16c09476f51eaa19b818564904b2 Mon Sep 17 00:00:00 2001
From: John Doe <john@example.com>
Date: Wed, 12 Oct 2022 14:38:15 +0200
Subject: [PATCH] My commit message

---
 file1.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/file1.txt b/file1.txt
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
`;