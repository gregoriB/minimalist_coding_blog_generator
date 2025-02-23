import build from "./src/generator/build.mjs";
import backup from "./src/generator/backup.mjs";
import update from "./src/generator/update.mjs";
import help from "./src/generator/help.mjs";

import { colors, commands, leftPadding } from "./src/generator/variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { HELP, HELP_SHORT, BACKUP, UPDATE, BUILD, ALL } = commands;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case BACKUP:
      backup();
      break;
    case UPDATE:
      update();
      break;
    case BUILD:
      build();
      break;
    case ALL:
      console.log(`${leftPadding}${MAGENTA}   Generating Blog${CLEAR}`, "\n");
      backup();
      await update();
      build();
      break;
    case HELP:
    case HELP_SHORT:
    default:
      help();
      break;
  }
}

main();
