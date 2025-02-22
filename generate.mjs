import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const CLEAR = `\x1b[0m`;
const RED = `\x1b[31m`;
const GREEN = `\x1b[32m`;
const YELLOW = `\x1b[33m`;
const BLUE = `\x1b[34m`;
const MAGENTA = `\x1b[35m`;
const CYAN = `\x1b[36m`;
const GRAY = `\x1b[90m`;
const ORANGE = `\x1b[38;5;214m`;

const indexFile = `index.html`;
const articlesFolder = `./articles/`;
const indexDom = await JSDOM.fromFile(articlesFolder + indexFile);

async function query(dom, selector) {
  return dom.window.document.querySelector(selector);
}

/**
 * Copies the blog article in each file, updates all of the HTML in that file
 * with the HTML from index.html, and then replaces the blog article with the copy
 * of the original from the current HTML file.
 */
async function updateFiles() {
  console.log(`${GRAY}Updating existing blog posts with current data${CLEAR}`);

  const files = fs.readdirSync(articlesFolder);
  for (const file of files) {
    if (file == indexFile) continue;

    const filePath = path.join(articlesFolder, file);
    if (fs.statSync(filePath).isFile() && filePath.endsWith(`.html`)) {
      const dom = await JSDOM.fromFile(filePath);
      const indexHtml = await query(indexDom, `html`);
      let existingHTML = await query(dom, `html`);

      // Clone existing article, update file html, query article node
      // again, update node article html with the cloned article html
      let existingArticle = existingHTML.querySelector(
        `[data-find='main-content']`,
      );
      const clone = existingArticle.cloneNode(true);
      existingHTML.innerHTML = indexHtml.innerHTML;
      existingHTML = await query(dom, `html`);
      existingArticle = existingHTML.querySelector(
        `[data-find='main-content']`,
      );
      existingArticle.outerHTML = clone.outerHTML;

      fs.writeFileSync(filePath, dom.serialize(), `utf8`);

      console.log(`${RED}${file}${CLEAR} file updated`);
    }
  }
  console.log("\n");
}

async function createNewFile() {
  const title = await query(indexDom, `[data-find='main-content-title']`);
  const sidebarSection = await query(
    indexDom,
    `[data-find='side-bar-section']`,
  );
  const date = `${sidebarSection.dataset.date}_`;
  const titleText = title.textContent;

  // replace all special characters with `_` and set everything to lowercase
  let fileName = `${(date + titleText).toLowerCase().replace(/[^a-zA-Z0-9]/g, `_`)}.html`;

  console.log(`${GRAY}Building for blog post: ${BLUE}"${titleText}"${CLEAR}`);
  fs.writeFileSync(articlesFolder + fileName, indexDom.serialize(), `utf8`);
  console.log(`${RED}${fileName}${CLEAR} file created`, "\n");
}

/**
 * Update existing HTML files with the data from index.html and create new blog html file
 */
async function processFiles() {
  try {
    console.log(`${CYAN}Building blog post${CLEAR}`, "\n");
    await updateFiles();
    await createNewFile();
    console.log(`${GREEN}Build complete!${CLEAR}`, "\n");
  } catch (error) {
    console.error(`ERROR PROCESSING FILES:`, error);
    console.log(`${ORANGE}!!! STOPPING BUILD !!!${CLEAR}`);
  }
}

processFiles();
