import { colors, leftPadding } from "./variables.mjs";
import { log } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;

const ITALICS = "\x1b[3m";
const BOLD = "\u001b[1m";
const EXAMPLE = `${ITALICS}$ npm run generate <command>${CLEAR}`;
const MAX_FLAG_CHAR = 10;

function createPadding(space) {
  return new Array(space).fill(" ").join("");
}

function helpLog(...args) {
  log(leftPadding, ...args);
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
  helpLog(CYAN, "Generator Usage Information", CLEAR, "\n");
  helpLog(EXAMPLE, "\n");
  helpLog("Commands:", "\n");

  for (let m in flagMessages) {
    helpLog(getHelpStr(m.toLowerCase(), flagMessages[m]), "\n");
  }

  helpLog("\n");
}
