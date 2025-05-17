export const mockEmpty = "";

export const mockSingleFileChange = `diff --git a/file1.txt b/file1.txt
index 24967d3..b37620a 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,3 +1,3 @@
 Line 1
-Line 2
+Line 2 changed
 Line 3
`;

export const mockMultipleFilesChange = `diff --git a/fileA.txt b/fileA.txt
index 24967d3..b37620a 100644
--- a/fileA.txt
+++ b/fileA.txt
@@ -1,2 +1,2 @@
-Original line in A
+New line in A
 Common line
diff --git a/fileB.txt b/fileB.txt
index da971a1..055c8a5 100644
--- a/fileB.txt
+++ b/fileB.txt
@@ -5,3 +5,4 @@
 Another line
-This will be removed
+This is added
 And one more
+And a final new line
`;

export const mockNewFile = `diff --git a/new_file.txt b/new_file.txt
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/new_file.txt
@@ -0,0 +1,3 @@
+This is a new file.
+It has multiple lines.
+Added content.
`;

export const mockDeletedFile = `diff --git a/deleted_file.txt b/deleted_file.txt
deleted file mode 100644
index e69de29..0000000
--- a/deleted_file.txt
+++ /dev/null
@@ -1,2 +0,0 @@
-Content of the deleted file.
-Another line.
`;

export const mockRenamedFile = `diff --git a/old_name.txt b/new_name.txt
similarity index 100%
rename from old_name.txt
rename to new_name.txt
`;

export const mockRenamedFileWithChanges = `diff --git a/source.txt b/destination.txt
similarity index 90%
rename from source.txt
rename to destination.txt
index 5a3a1a7..5b1b2b8 100644
--- a/source.txt
+++ b/destination.txt
@@ -1,4 +1,4 @@
 First line
-Second line (old)
+Second line (new)
 Third line
 Fourth line
`;

export const mockMultipleHunks = `diff --git a/multi_hunk_file.txt b/multi_hunk_file.txt
index abc1234..def5678 100644
--- a/multi_hunk_file.txt
+++ b/multi_hunk_file.txt
@@ -1,5 +1,5 @@
 Context line 1
-Removed line 1
+Added line 1
 Context line 2
 Context line 3
 Context line 4
@@ -10,5 +10,5 @@
 Context line 10
 Context line 11
-Removed line 2
+Added line 2
 Context line 12
 Context line 13
`;

export const mockNoNewlineAtEndOfFile = `diff --git a/file.txt b/file.txt
index 123..456 100644
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old content
\\ No newline at end of file
+new content
\\ No newline at end of file
`;

export const mockDiffWithOnlyAdditions = `diff --git a/added_only.txt b/added_only.txt
new file mode 100644
index 0000000..1ab2c3d
--- /dev/null
+++ b/added_only.txt
@@ -0,0 +1,2 @@
+New line 1
+New line 2
`;

export const mockDiffWithOnlyDeletions = `diff --git a/deleted_only.txt b/deleted_only.txt
deleted file mode 100644
index 1ab2c3d..0000000
--- a/deleted_only.txt
+++ /dev/null
@@ -1,2 +0,0 @@
-Old line 1
-Old line 2
`;

export const mockDiffWithContextOnlyHunk = `diff --git a/context_only.txt b/context_only.txt
index abc..def 100644
--- a/context_only.txt
+++ b/context_only.txt
@@ -1,3 +1,3 @@
 unchanged line 1
 unchanged line 2
 unchanged line 3
`;

export const mockComplexExample = `diff --git a/src/complex.js b/src/complex.js
index 1111111..2222222 100644
--- a/src/complex.js
+++ b/src/complex.js
@@ -5,7 +5,7 @@
   function oldFunction() {
-    console.log("old");
+    console.log("new");
   }
 
   // unchanged part
@@ -20,3 +20,8 @@
   function anotherFunction() {
-    return null;
+    return "something";
   }
+
+  function newFunction() {
+    return "newly added";
+  }
diff --git a/README.md b/README.md
index 3333333..4444444 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,3 @@
 # Project Title
-Old description
+New and improved description
+Additional line.
`;