import UglifyJS from "uglify-js";
import UglifyCSS from "uglifycss";
import path from "path";
import fs from "fs";

import { colors, directories } from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, buildDir } = directories;

function canMinifyJS(file) {
  if (file.endsWith(".js") && !file.endsWith(".min.js")) return true;

  return false;
}

function canMinifyCSS(file) {
  if (file.endsWith(".css") && !file.endsWith(".min.css")) return true;

  return false;
}

function canMinify(file) {
  if (canMinifyJS(file) || canMinifyCSS(file)) return true;

  return false;
}

/**
 * Creates a recursive copy of a directory
 *
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {object} config
 * @param {bool} config.minify
 * @param {bool} config.copySrc - Should copy src directory itself into dest, rather than copying the contents of src
 */
export function copyDir(src, dest, config = {}) {
  let destPath = config.copySrc ? path.join(dest, path.basename(src)) : dest;

  fs.mkdirSync(destPath, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const finalDestPath = path.join(destPath, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      config.copySrc = true;
      copyDir(srcPath, destPath, config);
    } else {
      if (canMinify(file) && config.minify) {
        let content = fs.readFileSync(srcPath, "utf8");
        content = canMinifyJS(file)
          ? UglifyJS.minify(content).code
          : UglifyCSS.processString(content);
        fs.writeFileSync(finalDestPath, content);
      } else {
        fs.copyFileSync(srcPath, finalDestPath);
      }
    }
  });

  // if (destPath == buildDir) destPath = src;

  console.log(
    `${MAGENTA}${src}${CLEAR} ${GRAY}copied to${CLEAR} ${BLUE}${destPath}${CLEAR}`,
  );
}
