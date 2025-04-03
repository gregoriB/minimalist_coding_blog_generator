import fs from "fs";
import { colors, configs, directories } from "./variables.mjs";
import { generateSite, log } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, buildDir } = directories;

/**
 * Makes sure the article directory exists and has articles
 */
function verifyArticlesDir() {
  if (!fs.existsSync(articlesDir)) {
    throw new Error(
      articlesDir +
        " directory does not exist. There are no articles to build!",
    );
  }

  const { format } = configs.article || configs.main;
  const articleFiles = fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith(format));

  if (articleFiles.length === 0)
    throw new Error(
      articlesDir + " directory is empty. There are no articles to build!",
    );

  return true;
}

function verifyPreferred(preferred) {
  if (!preferred) return;
  const { format } = configs.article || configs.main;
  const preferredFile = `${preferred}.${format}`;

  if (!fs.existsSync(articlesDir + preferredFile)) {
    log("\n", RED, 'Article "', preferred, '" not found!', CLEAR, "\n");
    throw new Error(`${articlesDir + preferredFile} article does not exist!`);
  }
}

function makeBuildDir() {
  fs.rmSync(buildDir, { force: true, recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });
}

function copySiteDirToBuildDir() {}

/**
 * Create deployable build Dir
 */
export default async function createBuild(preferredPost) {
  try {
    log(CYAN, "Building", CLEAR, "\n");

    verifyPreferred(preferredPost);
    verifyArticlesDir();
    makeBuildDir();
    copySiteDirToBuildDir();
    await generateSite(buildDir, preferredPost);

    log(GREEN, "Build complete!", CLEAR, "\n");
  } catch (error) {
    console.error(`ERROR PROCESSING FILES:`, error);
    log(ORANGE, "!!! STOPPING BUILD !!!", CLEAR);
  }
}
