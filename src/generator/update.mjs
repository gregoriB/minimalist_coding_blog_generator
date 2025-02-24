import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { colors, directories, templateFile } from "./variables.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir } = directories;

const indexDom = await JSDOM.fromFile(sourceDir + templateFile);

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

  const files = fs.readdirSync(articlesDir);
  for (const file of files) {
    if (file == templateFile) continue;

    const filePath = path.join(articlesDir, file);
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
  let fileName = `${(date + titleText.trim()).toLowerCase().replace(/[^a-zA-Z0-9]/g, `_`)}.html`;

  console.log(`${GRAY}Building for blog post: ${BLUE}"${titleText}"${CLEAR}`);
  fs.writeFileSync(articlesDir + fileName, indexDom.serialize(), `utf8`);
  console.log(`${RED}${fileName}${CLEAR} file created`, "\n");
}

/**
 * Update existing HTML files with the data from index.html and create new blog html file
 */
export default async function updateHTML() {
  try {
    console.log(`${CYAN}Creating blog post${CLEAR}`, "\n");
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir);
    }
    await updateFiles();
    await createNewFile();
    console.log(`${GREEN}HTML updates complete!${CLEAR}`, "\n");
  } catch (error) {
    console.error(`ERROR PROCESSING FILES:`, error);
    console.log(`${ORANGE}!!! STOPPING UPDATES !!!${CLEAR}`);
  }
}
