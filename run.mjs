import create from "./src/generator/new.mjs";
import build from "./src/generator/build.mjs";
import backup from "./src/generator/backup.mjs";
import help from "./src/generator/help.mjs";
import { log } from "./src/generator/helpers.mjs";

import {
  colors,
  commands,
  flags,
  leftPadding,
} from "./src/generator/variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { HELP, HELP_SHORT, NEW, BACKUP, BUILD, BAD_COMMAND } = commands;
const { DISABLE_BACKUPS } = flags;

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || BAD_COMMAND;
  const noBackup = args.includes(DISABLE_BACKUPS);

  switch (command) {
    case NEW:
      create(args[1]);
      break;
    case BACKUP:
      backup();
      break;
    case BUILD:
      log(leftPadding, MAGENTA, "Generating Blog", CLEAR, "\n");
      if (!noBackup) {
        backup();
      }
      build(args[1]);
      break;
    case HELP:
    case HELP_SHORT:
      help();
      break;
    case BAD_COMMAND:
      // prettier-ignore
      log(leftPadding, RED, "Command not value. Please use a valid command:", CLEAR, "\n");
      help();
      break;
    default:
      // prettier-ignore
      log(leftPadding, RED, 
          "Command: ", command , " not recognized. Please use a recognized command:", 
          CLEAR, "\n");
      help();
      break;
  }
}

main();
