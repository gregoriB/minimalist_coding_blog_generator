import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const args = process.argv;
const noLinkGen = args.includes("-no-link-updates");
const noFileGen = args.includes("-no-file-gen");
const noGen = args.includes("-do-nothing");

const mainHtml = "index.html";
const folderPath = "./articles/";
const indexDom = await JSDOM.fromFile(folderPath + mainHtml);

async function query(dom, selector) {
  return dom.window.document.querySelector(selector);
}
async function insertLinkIntoFiles() {
  const indexSideBarSection = await query(
    indexDom,
    "[data-find='side-bar-section']",
  );
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (file == mainHtml) continue;

    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isFile() && filePath.endsWith(".html")) {
      const dom = await JSDOM.fromFile(filePath);
      const element = await query(dom, "[data-find='side-bar-section']");
      const elDate = element.dataset.date;
      const indexDate = indexSideBarSection.dataset.date;
      if (!noLinkGen && !noGen) {
        if (elDate != indexDate) {
          console.log("Creating new date block and link");
          element.parentNode.insertBefore(
            indexSideBarSection.cloneNode(true),
            element,
          );
        } else {
          console.log("Creating new date link");
          const content = indexSideBarSection.querySelector(
            "[data-find='side-bar-list'] li",
          );
          const elementList = element.querySelector(
            "[data-find='side-bar-list']",
          );
          elementList.innerHTML = content.outerHTML + elementList.innerHTML;
        }
      }

      if (noGen || noFileGen) return;

      fs.writeFileSync(filePath, dom.serialize(), "utf8");
      console.log(`Updated ${file}`);
    }
  }
}

async function createNewFile() {
  const title = await query(indexDom, "[data-find='main-content-title']");
  const sidebarSection = await query(
    indexDom,
    "[data-find='side-bar-section']",
  );
  const date = `${sidebarSection.dataset.date}_`;
  const titleText = title.textContent;
  let fileName = (date + titleText).toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  if (noGen || noFileGen) return;

  fs.writeFileSync(
    `${folderPath + fileName}.html`,
    indexDom.serialize(),
    "utf8",
  );
  console.log(`${fileName} created`);
}

async function processFiles() {
  try {
    await insertLinkIntoFiles();
    await createNewFile();
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

processFiles();
