import fs from "fs";
import { colors, directories } from "./variables.mjs";
import { copyDir, log } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, backupsDir } = directories;

export default function createArticleBackups(noBackups = false) {
  log(CYAN, "Creating Backups", CLEAR, "\n");

  if (noBackups) {
    log(RED, "Backups disabled!", CLEAR, '\n');
    return;
  }

  if (!fs.existsSync(articlesDir)) {
    log(RED, "There is nothing to backup!", CLEAR, '\n');
    return;
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }

  const newDir = new Date()
    .toLocaleString("en-US", { hour12: false })
    .replace(/[/:, ]/g, "_");

  fs.mkdirSync(backupsDir + newDir);

  copyDir(articlesDir, backupsDir + newDir);
  log();
}
