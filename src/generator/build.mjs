import fs from "fs";
import { colors, configs, directories } from "./variables.mjs";
import { copyDir, generateSite, log } from "./helpers.mjs";

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

  const articleFiles = fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith(configs.article.format));

  if (articleFiles.length === 0)
    throw new Error(
      articlesDir + " directory is empty. There are no articles to build!",
    );

  return true;
}

function makeBuildDir() {
  fs.rmSync(buildDir, { force: true, recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });

  log(GRAY, "Creating deployable build", CLEAR);

  copyDir(sourceDir + siteDir, buildDir, { minify: true });
}

/**
 * Create deployable build Dir
 */
export default async function createBuild(preferredPost) {
  try {
    log(CYAN, "Building", CLEAR, "\n");

    verifyArticlesDir();
    makeBuildDir();
    await generateSite(buildDir, preferredPost);

    log(GREEN, "Build complete!", CLEAR, "\n");
  } catch (error) {
    console.error(`ERROR PROCESSING FILES:`, error);
    log(ORANGE, "!!! STOPPING BUILD !!!", CLEAR);
  }
}
