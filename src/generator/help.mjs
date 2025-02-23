import { colors, leftPadding } from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;

const EXAMPLE = "npm run generate <command>";
const flagMessages = {
  BUILD: "Build the site contents in src/site/ to deployable build/ directory",
  BACKUP:
    "Backup the contents of articles/ to a new directory within the backups/ directory",
  UPDATE:
    "Generates a new HTML article from template.html and updates all existing blog posts to include it",
  ALL: "Creates a backup of the existing articles, generates the new article, and creates a deployable build/ directory",
  HELP: "Display helpful usage information in the terminal",
};

function getHelpStr(flag, message) {
  const MAX_FLAG_CHAR = 10;
  if (flag.length <= MAX_FLAG_CHAR) {
    const diff = MAX_FLAG_CHAR - flag.length;
    flag = flag + new Array(diff).fill(" ").join("");
  }

  return `${flag} - ${leftPadding + message}`;
}

export default function logHelp() {
  console.log(`${leftPadding}${CYAN}Generator Usage Information${CLEAR}`, "\n");
  console.log(leftPadding + EXAMPLE, "\n");
  console.log(`${leftPadding}Commands:\n`);
  for (let m in flagMessages) {
    console.log(leftPadding + getHelpStr(m.toLowerCase(), flagMessages[m]));
  }
  console.log("\n");
}
