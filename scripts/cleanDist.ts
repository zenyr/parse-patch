import { rm } from "node:fs/promises";

const dirToDelete = "dist";

async function cleanDist() {
  try {
    const dirExists = await Bun.file(dirToDelete).exists();
    if (dirExists) {
      await rm(dirToDelete, { recursive: true, force: true });
      console.log(`Directory '${dirToDelete}' successfully deleted.`);
    }
  } catch (error) {
    console.error(`Error deleting directory '${dirToDelete}':`, error);
    process.exit(1);
  }
}

cleanDist();
