import create from "./src/generator/new.mjs";
import build from "./src/generator/build.mjs";
import backup from "./src/generator/backup.mjs";
import help from "./src/generator/help.mjs";

import { colors, commands, leftPadding } from "./src/generator/variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { HELP, HELP_SHORT, NEW, BACKUP, BUILD } = commands;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || HELP;

  switch (command) {
    case NEW:
      create(args[1]);
      break;
    case BACKUP:
      backup();
      break;
    case BUILD:
      console.log(`${leftPadding}${MAGENTA}   Generating Blog${CLEAR}`, "\n");
      backup();
      build(args[1]);
      break;
    case HELP:
    case HELP_SHORT:
      help();
      break;
    default:
      console.log(
        `${leftPadding}${RED}Command: '${command}' not recognized${CLEAR}`,
        "\n",
      );
      help();
      break;
  }
}

main();
