import UglifyJS from "uglify-js";
import UglifyCSS from "uglifycss";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { JSDOM } from "jsdom";

import {
  colors,
  directories,
  configs,
  templates,
  months,
} from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, buildDir, templatesDir } = directories;

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

  console.log(
    `${MAGENTA}${src}${CLEAR} ${GRAY}copied to${CLEAR} ${BLUE}${destPath}${CLEAR}`,
  );
}

/**
 * Creates a date string based on the current date, using this format:
 * <year>_<month>_<day>_<total_seconds>
 */
export function getFormattedDateName() {
  const now = new Date();
  const totalSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  return `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${totalSeconds}`;
}

export async function query(dom, selector) {
  return dom.window.document.querySelector(selector);
}

export async function addElement(dom, data) {
  const filePath = path.join(sourceDir, templatesDir, `${data.name}.html`);
  const page = await query(dom, templates.main.selector);
  const tmplDom = await JSDOM.fromFile(filePath);
  const innerHTML = tmplDom.window.document.body.innerHTML.trim();
  let pageHTML = page.innerHTML;
  pageHTML = pageHTML.replaceAll(data.marker, innerHTML);
  page.innerHTML = pageHTML;
}

export async function getTemplatePageDOM() {
  const main = templates.main;
  let headPath = `${sourceDir}${templatesDir}${main.name}.html`;

  let pageDom = await JSDOM.fromFile(headPath);

  for (let tmpl in templates) {
    if (templates[tmpl].name == main.name) continue;

    await addElement(pageDom, templates[tmpl]);
  }

  return pageDom;
}

function getFilesByDateYAML(dir, fileExtension = ".yaml") {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(fileExtension))
    .map((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const data = fs.readFileSync(filePath, "utf-8");

      const parsed = yaml.load(data);
      let uuid = String(stats.birthtimeMs);
      if (parsed.DATE_TIME instanceof Date) {
        uuid += parsed.DATE_TIME.toISOString();
      } else {
        uuid += parsed.DATE_TIME;
      }
      uuid = replaceSpecialChars(uuid, "_");
      const date = new Date(parsed.DATE_TIME);
      const month = date.getMonth();

      return {
        file,
        uuid,
        datetime: parsed.DATE_TIME,
        day: date.getDate(),
        month: { name: months[month], index: month },
        year: date.getFullYear(),
      };
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
}

function replaceSpecialChars(str, char = "") {
  if (!str) return "";

  return str.replace(/[^a-zA-Z0-9]/g, char);
}

async function createNewSidebarSection(title, url, month, year) {
  const sidebarPath = path.join(
    sourceDir,
    templatesDir,
    `${templates.sidebar.name}.html`,
  );
  const sideBarDom = await JSDOM.fromFile(sidebarPath);
  const sideBarHTML = await query(sideBarDom, "html");
  const sideBar = await query(sideBarDom, "[data-find='side-bar-section']");

  let newHTML = sideBar.outerHTML;
  newHTML = newHTML.replaceAll("{{ARTICLE_LINK}}", `${url}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_TITLE}}", `${title}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_DATE}}", `${month} ${year}`);
  sideBarHTML.innerHTML = newHTML;

  return sideBarDom;
}

async function updateSidebarLinks(
  sidebarDom,
  pageDom,
  fileData,
  url,
  isNewMonth,
) {
  const { month, year } = fileData;
  const articleTitle = await query(pageDom, "[data-find='main-content-title']");
  const titleText = articleTitle.textContent.trim();
  const newEntryDom = await createNewSidebarSection(
    titleText,
    url,
    month.name,
    year,
  );

  if (!isNewMonth) {
    const newItem = await query(
      newEntryDom,
      "[data-find='side-bar-section-item']",
    );

    const sideBarSection = await query(
      sidebarDom,
      `[data-date='${fileData.month.name} ${fileData.year}']`,
    );
    const existingList = sideBarSection.querySelector(
      "[data-find='side-bar-section-list']",
    );
    existingList.innerHTML = existingList.innerHTML + newItem.outerHTML;

    return;
  }

  const sideBarSection = await query(
    sidebarDom,
    "[data-find='side-bar-section']",
  );
  const newSectionHTML = newEntryDom.window.document.body.innerHTML.trim();
  if (sideBarSection.outerHTML.includes("{{ARTICLE_DATE}}")) {
    sideBarSection.outerHTML = newSectionHTML;
  } else {
    sideBarSection.outerHTML = sideBarSection.outerHTML + newSectionHTML;
  }
}

async function populatePageFromYAML(pageDom, file) {
  const { main } = configs;
  const mainConfigPath = path.join(sourceDir, `${main.name}.${main.format}`);
  const articleConfigPath = path.join(articlesDir, `${file}`);

  const mainConfigYaml = fs.readFileSync(mainConfigPath, "utf-8");
  const articleConfigYaml = fs.readFileSync(articleConfigPath, "utf-8");

  const mainParsed = yaml.load(mainConfigYaml);
  const articleParsed = yaml.load(articleConfigYaml);

  const page = await query(pageDom, "html");
  let pageHTML = page.innerHTML;

  for (let [key, value] of Object.entries(mainParsed)) {
    pageHTML = pageHTML.replaceAll(`{{${key}}}`, value);
  }

  for (let [key, value] of Object.entries(articleParsed)) {
    value = value instanceof Date ? value.toISOString() : value;
    pageHTML = pageHTML.replaceAll(`{{${key}}}`, value);
  }

  page.innerHTML = pageHTML;
}

async function addUpdatedSidebarToFiles(sidebarDom) {
  const builtBlogFiles = fs.readdirSync(buildDir);
  for (const file of builtBlogFiles) {
    const filePath = path.join(buildDir, file);
    if (fs.statSync(filePath).isFile() && filePath.endsWith(`.html`)) {
      const fileDom = await JSDOM.fromFile(filePath);
      const fileSidebar = await query(fileDom, templates.sidebar.selector);
      if (!fileSidebar) continue;

      const newSidebar = await query(sidebarDom, templates.sidebar.selector);
      fileSidebar.outerHTML = newSidebar.outerHTML;
      fs.writeFileSync(filePath, fileDom.serialize(), `utf8`);
    }
  }
}

async function createPostsFromYAML(destDir, preferredPost) {
  let articleFiles = getFilesByDateYAML(articlesDir);
  const preferred = preferredPost
    ? `${preferredPost}.yaml`
    : articleFiles[0].file;

  let currentMonth = Number.MAX_VALUE;
  let currentYear = Number.MAX_VALUE;

  const sidebarPath = path.join(
    sourceDir,
    templatesDir,
    `${templates.sidebar.name}.html`,
  );
  const sidebarDom = await JSDOM.fromFile(sidebarPath);

  for (const fileData of articleFiles) {
    const { file, uuid, month, year } = fileData;
    let isNewMonth = false;
    if (currentMonth != month.index || year != currentYear) {
      currentMonth = month.index;
      currentYear = year;
      isNewMonth = true;
    }

    const articlePath = path.join(articlesDir, file);

    if (fs.statSync(articlePath).isFile() && articlePath.endsWith(`.yaml`)) {
      const pageDom = await getTemplatePageDOM();

      await populatePageFromYAML(pageDom, file);

      const newName = `${String(uuid)}.html`;
      const destPath = path.join(destDir, newName);
      fs.writeFileSync(destPath, pageDom.serialize(), `utf8`);

      if (file == preferred) {
        const indexPath = path.join(destDir, `index.html`);
        fs.writeFileSync(indexPath, pageDom.serialize(), `utf8`);
        console.log(`${RED}${indexPath}${CLEAR} file created`);
      }

      await updateSidebarLinks(
        sidebarDom,
        pageDom,
        fileData,
        newName,
        isNewMonth,
      );
      console.log(`${RED}${destPath}${CLEAR} file created`);
    }
  }

  await addUpdatedSidebarToFiles(sidebarDom);

  console.log("\n");
}

export async function generateBlogPosts(destDir, preferredPost) {
  createPostsFromYAML(destDir, preferredPost);
}
