import { warn } from "console";
import fs from "fs";
import path from "path";

const CLEAR = `\x1b[0m`;
const RED = `\x1b[31m`;
const GREEN = `\x1b[32m`;
const YELLOW = `\x1b[33m`;
const BLUE = `\x1b[34m`;
const MAGENTA = `\x1b[35m`;
const CYAN = `\x1b[36m`;
const GRAY = `\x1b[90m`;
const ORANGE = `\x1b[38;5;214m`;

const templateFile = `template.html`;
const buildDirectory = "build/";

function shouldMinify(file) {
  if (file.endsWith(".css") && !file.endsWith(".min.css")) return true;
  if (file.endsWith(".js") && !file.endsWith(".min.js")) return true;

  return false;
}

function copyDirectory(src, dest, shouldNotJoin = false) {
  let destPath = shouldNotJoin ? dest : path.join(dest, path.basename(src));

  fs.mkdirSync(destPath, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const finalDestPath = path.join(destPath, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      if (shouldMinify(file)) {
        let content = fs.readFileSync(srcPath, "utf8");
        content = content.replace(/\s+/g, " ").trim();
        fs.writeFileSync(finalDestPath, content);
      } else {
        fs.copyFileSync(srcPath, finalDestPath);
      }
    }
  });

  if (destPath == buildDirectory) destPath = src;

  console.log(
    `${MAGENTA}${src}${CLEAR} ${GRAY}copied to${CLEAR} ${BLUE}${destPath}${CLEAR}`,
  );
}

function makeBuildDirectory() {
  fs.rmSync(buildDirectory, { force: true, recursive: true });
  fs.mkdirSync(buildDirectory, { recursive: true });
  console.log(`${GRAY}Creating deployable build${CLEAR}`);
  copyDirectory("scripts", buildDirectory);
  copyDirectory("styles", buildDirectory);
  copyDirectory("deps", buildDirectory);
  copyDirectory("assets", buildDirectory);
  copyDirectory("articles", buildDirectory, true);
  fs.copyFileSync(templateFile, buildDirectory + "index.html");
}

/**
 * Create deployable build directory
 */
async function build() {
  try {
    console.log(`${CYAN}Building${CLEAR}`, "\n");
    makeBuildDirectory();
    console.log(`${GREEN}Build complete!${CLEAR}`, "\n");
  } catch (error) {
    console.error(`ERROR PROCESSING FILES:`, error);
    console.log(`${ORANGE}!!! STOPPING BUILD !!!${CLEAR}`);
  }
}

build();
