import fs from "fs";
import { colors, directories, templateFile } from "./variables.mjs";
import { copyDir } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, buildDir, backupsDir } = directories;

export default function createBackups() {
  if (!fs.existsSync(articlesDir)) return;

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }

  const newDir = new Date()
    .toLocaleString("en-US", { hour12: false })
    .replace(/[/:, ]/g, "_");

  fs.mkdirSync(backupsDir + newDir);

  console.log(`${CYAN}Creating Backups${CLEAR}`, "\n");
  copyDir(articlesDir, backupsDir + newDir);
  console.log();
}
