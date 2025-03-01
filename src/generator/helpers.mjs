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
  fileFormats,
} from "./variables.mjs";
const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, MAGENTA, CLEAR } = colors;
const { articlesDir, sourceDir, buildDir, templatesDir } = directories;

export function log(...args) {
  let str = "";
  for (let i = 0; i < args.length; i++) str += `${args[i]}`;

  console.log(`${str}`);
}

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

  log(MAGENTA, src, CLEAR, GRAY, " copied to ", CLEAR, BLUE, destPath, CLEAR);
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

export function query(dom, selector) {
  return dom.window.document.querySelector(selector);
}

export async function addElement(dom, data) {
  const filePath = path.join(
    sourceDir,
    templatesDir,
    `${data.name}.${fileFormats.html}`,
  );
  const page = query(dom, templates.main.selector);
  const tmplDom = await JSDOM.fromFile(filePath);
  const innerHTML = tmplDom.window.document.body.innerHTML.trim();
  let pageHTML = page.innerHTML;
  pageHTML = pageHTML.replaceAll(data.marker, innerHTML);
  page.innerHTML = pageHTML;
}

export async function getTemplatePageDOM() {
  const main = templates.main;
  let headPath = `${sourceDir}${templatesDir}${main.name}.${fileFormats.html}`;

  let pageDom = await JSDOM.fromFile(headPath);

  for (let tmpl in templates) {
    if (templates[tmpl].name == main.name) continue;

    await addElement(pageDom, templates[tmpl]);
  }

  return pageDom;
}

function getFilesByDate(dir, fileExtension) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(fileExtension))
    .map((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const data = fs.readFileSync(filePath, "utf-8");

      const parser = getConfigLoader(fileExtension);
      const parsed = parser(data);
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
    `${templates.sidebar.name}.${fileFormats.html}`,
  );
  const sideBarDom = await JSDOM.fromFile(sidebarPath);
  const sideBarHTML = sideBarDom.window.document.documentElement;
  const sideBar = query(sideBarDom, "[data-find='side-bar-section']");

  let newHTML = sideBar.outerHTML;
  newHTML = newHTML.replaceAll("{{ARTICLE_LINK}}", `${url}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_TITLE}}", `${title}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_DATE}}", `${month} ${year}`);
  sideBarHTML.innerHTML = newHTML;

  return sideBarDom;
}

function reverseElements(dom, container) {
  const parent = query(dom, container);
  const children = Array.from(parent.children).reverse();

  children.forEach((child) => parent.appendChild(child));
}

async function updateSidebar(sidebarDom, pageDom, fileData, url) {
  const { month, year } = fileData;
  const articleTitle = query(pageDom, "[data-find='main-content-title']");
  const titleText = articleTitle.textContent.trim();
  const newEntryDom = await createNewSidebarSection(
    titleText,
    url,
    month.name,
    year,
  );

  let sideBarSection = query(
    sidebarDom,
    `[data-date='${fileData.month.name} ${fileData.year}']`,
  );

  if (sideBarSection) {
    const newItem = query(newEntryDom, "[data-find='side-bar-section-item']");

    const existingList = sideBarSection.querySelector(
      "[data-find='side-bar-section-list']",
    );
    existingList.innerHTML = existingList.innerHTML + newItem.outerHTML;

    return;
  }

  sideBarSection = query(sidebarDom, "[data-find='side-bar-section']");

  const newSectionHTML = newEntryDom.window.document.body.innerHTML.trim();
  if (sideBarSection.outerHTML.includes("{{ARTICLE_DATE}}")) {
    sideBarSection.outerHTML = newSectionHTML;
  } else {
    sideBarSection.outerHTML = newSectionHTML + sideBarSection.outerHTML;
  }
}

export function getConfigLoader(format) {
  switch (format) {
    case fileFormats.yaml:
      return yaml.load;
    default:
      throw new Error(`${format} does not have a supported loader`);
  }
}

export function getConfigSerializer(format) {
  switch (format) {
    case fileFormats.yaml:
      return (data) => yaml.dump(data, { noRefs: true });
    default:
      throw new Error(`${format} does not have a supported loader`);
  }
}

function populatePageFromConfigs(pageDom, file) {
  const { main, article } = configs;

  const parseMain = getConfigLoader(main.format);
  const parseArticle = getConfigLoader(article.format);

  const mainConfigPath = path.join(sourceDir, `${main.name}.${main.format}`);
  const articleConfigPath = path.join(articlesDir, `${file}`);

  const mainConfig = fs.readFileSync(mainConfigPath, "utf-8");
  const articleConfig = fs.readFileSync(articleConfigPath, "utf-8");

  const mainParsed = parseMain(mainConfig);
  const articleParsed = parseArticle(articleConfig);

  const page = pageDom.window.document.documentElement;
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

async function addNewSidebarToFiles(sidebarDom) {
  reverseElements(sidebarDom, "[data-find='side-bar-link-sections']");
  const builtBlogFiles = fs.readdirSync(buildDir);
  for (const file of builtBlogFiles) {
    const filePath = path.join(buildDir, file);
    if (
      fs.statSync(filePath).isFile() &&
      filePath.endsWith(`.${fileFormats.html}`)
    ) {
      const fileDom = await JSDOM.fromFile(filePath);
      const fileSidebar = query(fileDom, templates.sidebar.selector);
      if (!fileSidebar) continue;

      const newSidebar = query(sidebarDom, templates.sidebar.selector);
      fileSidebar.outerHTML = newSidebar.outerHTML;
      fs.writeFileSync(filePath, fileDom.serialize(), `utf8`);
    }
  }
}

function createArticle(pageDom, destDir, fileData, isPreferred) {
  const { file, uuid } = fileData;
  populatePageFromConfigs(pageDom, file);

  const newName = `${String(uuid)}.${fileFormats.html}`;
  const destPath = path.join(destDir, newName);

  fs.writeFileSync(destPath, pageDom.serialize(), `utf8`);
  log(RED, destPath, CLEAR, " file created from ", RED, file, CLEAR);

  if (!isPreferred) return newName;

  const indexPath = path.join(destDir, `index.${fileFormats.html}`);
  fs.writeFileSync(indexPath, pageDom.serialize(), `utf8`);
  log(RED, indexPath, CLEAR, " file created from ", RED, file, CLEAR);

  return newName;
}

export async function generateSite(destDir, preferredPost) {
  const { article } = configs;
  let articleFiles = getFilesByDate(articlesDir, article.format);
  const preferred = preferredPost
    ? `${preferredPost}.${article.format}`
    : articleFiles[0].file;

  const sidebarPath = path.join(
    sourceDir,
    templatesDir,
    `${templates.sidebar.name}.${fileFormats.html}`,
  );
  const sidebarDom = await JSDOM.fromFile(sidebarPath);

  for (const fileData of articleFiles) {
    const { file } = fileData;
    const articlePath = path.join(articlesDir, file);

    if (
      fs.statSync(articlePath).isFile() &&
      articlePath.endsWith(`.${article.format}`)
    ) {
      const pageDom = await getTemplatePageDOM();
      const articleBuiltName = createArticle(
        pageDom,
        destDir,
        fileData,
        file === preferred,
      );

      await updateSidebar(sidebarDom, pageDom, fileData, articleBuiltName);
    }
  }

  await addNewSidebarToFiles(sidebarDom);

  log("\n");
}
