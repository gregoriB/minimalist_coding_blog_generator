import { colors, leftPadding } from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;

const ITALICS = "\x1b[3m";
const BOLD = "\u001b[1m";
const EXAMPLE = `${ITALICS}$ npm run generate <command>${CLEAR}`;
const flagMessages = {
  NEW: "Generate a new blog post template. If no name is specified, then the file name will be the current date",
  BUILD: "Build the site contents in src/site/ to deployable build/ directory",
  BACKUP:
    "Backup the contents of articles/ to a new directory within the backups/ directory",
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
