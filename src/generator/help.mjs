import { colors, leftPadding } from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;

const ITALICS = "\x1b[3m";
const BOLD = "\u001b[1m";
const EXAMPLE = `${ITALICS}$ npm run generate <command>${CLEAR}`;
const MAX_FLAG_CHAR = 10;

function createPadding(space) {
  return new Array(space).fill(" ").join("");
}

function log(...args) {
  let str = "";
  for (let i = 0; i < args.length; i++) str += `${args[i]}`;

  console.log(`${leftPadding}${str}`);
}

const noFlagFiller = createPadding(leftPadding.length * 2 + MAX_FLAG_CHAR + 3);

const flagMessages = {
  NEW:
    "Generate a new blog post template. A name for the generated file can be specified.\n" +
    noFlagFiller +
    "If no name is specified, then the file name will be the current date",

  BUILD:
    "Build the articles from articles/ and the site contents in src/site/ to a deployable build/ directory.\n" +
    noFlagFiller +
    "A preferred article can be specified by name as the featured article, otherwise the most recent article will be featured",

  BACKUP:
    "Backup the contents of articles/ to a new directory within the backups/ directory",
  HELP: "Display helpful usage information in the terminal",
};

function getHelpStr(flag, message) {
  if (flag.length <= MAX_FLAG_CHAR) {
    const diff = MAX_FLAG_CHAR - flag.length;
    flag = flag + createPadding(diff);
  }

  return `${flag} - ${leftPadding + message}`;
}

export default function logHelp() {
  log(CYAN, "Generator Usage Information", CLEAR, "\n");
  log(EXAMPLE, "\n");
  log("Commands:", "\n");

  for (let m in flagMessages) {
    log(getHelpStr(m.toLowerCase(), flagMessages[m]), "\n");
  }

  log("\n");
}
