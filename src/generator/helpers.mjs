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
const { articlesDir, siteDir, buildDir, templatesDir, configsDir } =
  directories;

export function getFiles(dir, fileExtension) {
  return fs.readdirSync(dir).filter((file) => file.endsWith(fileExtension));
}

export function log(...args) {
  let str = "";
  for (let i = 0; i < args.length; i++) str += `${args[i]}`;

  console.log(`${str}`);
}

function canMinifyJS(file) {
  if (file.endsWith(".js")) return true;

  return false;
}

function canMinifyCSS(file) {
  if (file.endsWith(".css")) return true;

  return false;
}

function canMinify(file) {
  if (canMinifyJS(file) || canMinifyCSS(file)) return true;

  return false;
}

function getMinified(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  return canMinifyJS(filePath)
    ? UglifyJS.minify(content).code
    : UglifyCSS.processString(content);
}

/**
 * Gets file data from a directory by extension, and sort it by the most recent date.
 * Uses the date from the file content for sorting, and returns date and file data.
 */
function getFileDataByDate(dir, fileExtension) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(fileExtension))
    .map((file) => {
      const filePath = path.join(dir, file);
      const data = fs.readFileSync(filePath, "utf-8");

      const parser = getConfigLoader(fileExtension);
      const parsed = parser(data);
      const date = new Date(parsed.DATE_TIME);
      const month = date.getMonth();

      return {
        file,
        datetime: parsed.DATE_TIME,
        day: date.getDate(),
        month: { name: months[month], index: month },
        year: date.getFullYear(),
      };
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
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
    const filePath = path.join(src, file);
    const finalDestPath = path.join(destPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      copyDir(filePath, destPath, { ...config, copySrc: true });
    } else {
      if (canMinify(file) && config.minify) {
        fs.writeFileSync(finalDestPath, getMinified(filePath));
      } else {
        fs.copyFileSync(filePath, finalDestPath);
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

/**
 * Gets html from a template file and inserts the html into
 * the DOM at the matching marker
 */
export async function addHTMLFromTemplate(dom, templateData) {
  if (!templateData.marker) return;

  const filePath = path.join(
    templatesDir,
    `${templateData.name}.${fileFormats.html}`,
  );

  const tmplDom = await getFileDom(filePath);

  const tmplBody = query(tmplDom, "body");
  let tmplHTML = tmplBody.innerHTML;
  if (templateData.name === templates.head.name) {
    const tmplHead = query(tmplDom, "head");
    // Have to do some hackiness because JSDOM seems to move invalid
    // HTML into the body of the document, which includes the template
    // markers.  So instead the head HTML is manually replaced
    // by the template HTML, and then the set to an empty string to
    // remove the template marker from the body
    let mainHTML = dom.window.document.head.outerHTML;
    mainHTML = mainHTML.replaceAll("<head></head>", tmplHead.outerHTML);
    dom.window.document.head.outerHTML = mainHTML;
    tmplHTML = "";
  }

  const main = query(dom, "html");
  main.innerHTML = main.innerHTML.replaceAll(templateData.marker, tmplHTML);
}

export async function addHTMLFromTemplates(pageDom, skipTemplates) {
  for (let tmpl in templates) {
    if (skipTemplates && skipTemplates.includes(templates[tmpl].name)) continue;

    await addHTMLFromTemplate(pageDom, templates[tmpl]);
  }
}

export async function buildPageFromTemplates(skipTemplates) {
  const page = templates.page;
  let headPath = `${templatesDir}${page.name}.${fileFormats.html}`;

  let pageDom = await getFileDom(headPath);
  await addHTMLFromTemplates(pageDom, skipTemplates);

  return pageDom;
}

async function createNewSidebarSection(title, url, month, year) {
  const sidebarPath = path.join(
    templatesDir,
    `${templates.sidebar.name}.${fileFormats.html}`,
  );
  const sideBarDom = await getFileDom(sidebarPath);
  const sideBarHTML = sideBarDom.window.document.documentElement;
  const sideBar = query(sideBarDom, "[data-find='side-bar-section']");

  let newHTML = sideBar.outerHTML;
  newHTML = newHTML.replaceAll("{{ARTICLE_LINK}}", `${url}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_TITLE}}", `${title}`);
  newHTML = newHTML.replaceAll("{{ARTICLE_DATE}}", `${month} ${year}`);
  sideBarHTML.innerHTML = newHTML;

  return sideBarDom;
}

function updateHTMLFromConfigs(html, configsArr = []) {
  if (!configsArr.size) {
    configsArr[0] = configs.main;
  }
  for (const { dir, format } of configsArr) {
    const files = getFiles(dir, format);
    files.forEach((file) => {
      let configPath = path.join(dir, `${file}`);
      html = insertConfigDataIntoHTML(html, configPath, format);
    });
  }

  return html;
}

function getConfigProperty(key) {
  const { dir, format } = configs.main;
  const configPaths = getFiles(dir, format);
  for (const path of configPaths) {
    const configFile = fs.readFileSync(configsDir + path, "utf-8");
    const parse = getConfigLoader(format);
    const parsed = parse(configFile);
    if (key in parsed) {
      return parsed[key];
    }
  }

  return "";
}

function updateSidebarHomeLink(dom) {
  const sideBarHTML = dom.window.document.documentElement;
  sideBarHTML.innerHTML = updateHTMLFromConfigs(sideBarHTML.innerHTML);
}

function reverseElements(dom, selector) {
  const parent = query(dom, selector);
  const children = Array.from(parent.children).reverse();

  children.forEach((child) => parent.appendChild(child));
}

/**
 * Creates or updates a new sidebar section based on the existing
 * section dates.  If no matching section exists, a new one is created
 * and added to the sidebar, otherwise the new item is added to the
 * existing section.
 */
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

/**
 * Insert data from config into HTML
 */
function insertConfigDataIntoHTML(html, configPath, format) {
  const configFile = fs.readFileSync(configPath, "utf-8");
  const parse = getConfigLoader(format);
  const parsed = parse(configFile);
  for (let key in parsed) {
    let value = parsed[key] || "";

    value = value instanceof Date ? value.toISOString() : value;
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}

/**
 * Insert data from all specified configs into the HTML
 */
export async function populatePageFromConfigDirs(pageDom, configs) {
  const page = pageDom.window.document.documentElement;
  let pageHTML = page.innerHTML;

  page.innerHTML = updateHTMLFromConfigs(pageHTML, configs);
}

async function addSidebarToFiles(sidebarDom) {
  const builtBlogFiles = fs.readdirSync(buildDir);
  for (const file of builtBlogFiles) {
    const filePath = path.join(buildDir, file);
    if (
      fs.statSync(filePath).isFile() &&
      filePath.endsWith(`.${fileFormats.html}`)
    ) {
      const newSidebarBody = query(sidebarDom, "body");
      const fileDom = await getFileDom(filePath);
      const fileBody = fileDom.window.document.body;
      const fileDomHTML = fileBody.outerHTML;

      fileBody.outerHTML = fileDomHTML.replaceAll(
        templates.sidebar.marker,
        newSidebarBody.innerHTML,
      );

      fs.writeFileSync(filePath, fileDom.serialize(), `utf8`);
    }
  }
}

/**
 * Populates the DOM for the article page and writes it to a new HTML file.
 * If the article is the preferred article, it is also copied into the specified homepage file
 */
function createArticle(pageDom, destDir, file, isPreferred) {
  const config = configs.article || configs.main;
  const page = pageDom.window.document.documentElement;
  const filePath = path.join(articlesDir, file);
  const updatedHTML = insertConfigDataIntoHTML(
    page.innerHTML,
    filePath,
    config.format,
  );
  page.innerHTML = updatedHTML;

  const newName = `${file.split(".")[0]}.${fileFormats.html}`;
  const destPath = path.join(destDir, newName);

  fs.writeFileSync(destPath, pageDom.serialize(), `utf8`);
  log(RED, destPath, CLEAR, " file created from ", RED, file, CLEAR);

  if (!isPreferred) return newName;

  const indexFile = getConfigProperty("SITE_HOME_PAGE");
  console.log("index:", indexFile);
  const indexPath = path.join(destDir, indexFile);
  fs.writeFileSync(indexPath, pageDom.serialize(), `utf8`);
  log(RED, indexPath, CLEAR, " file created from ", RED, file, CLEAR);

  return newName;
}

export async function getFileDom(filePath) {
  return JSDOM.fromFile(filePath);
}

export async function populateHTMLFromConfigs(targetDir) {
  const files = getFiles(targetDir, fileFormats.html);
  for (let file of files) {
    const filePath = path.join(targetDir, file);
    const dom = await getFileDom(filePath, file);
    await addHTMLFromTemplates(dom, [templates.sidebar?.name]);
    populatePageFromConfigDirs(dom, [
      { dir: configs.main.dir, format: configs.main.format },
    ]);
    fs.writeFileSync(filePath, dom.serialize(), `utf8`);
  }
}

/**
 * Builds the site from the article and other configs, and the contents of the site/ directory
 */
export async function generateSite(destDir, preferredPost) {
  const config = configs.article || configs.main;
  let articleFiles = getFileDataByDate(articlesDir, config.format);
  const preferred = preferredPost
    ? `${preferredPost}.${config.format}`
    : articleFiles[0].file;

  const sidebarPath = templates.sidebar
    ? path.join(templatesDir, `${templates.sidebar.name}.${fileFormats.html}`)
    : "";

  let sidebarDom;
  try {
    sidebarDom = await getFileDom(sidebarPath);
  } catch (e) {
    log(GRAY, "No sidebar template found. Skipping sidebar", CLEAR);
  }

  for (const fileData of articleFiles) {
    const { file } = fileData;
    const articlePath = path.join(articlesDir, file);

    if (
      fs.statSync(articlePath).isFile() &&
      articlePath.endsWith(`.${config.format}`)
    ) {
      const pageDom = await buildPageFromTemplates([templates.sidebar?.name]);
      const isPreferred = file === preferred;
      const articleBuiltName = createArticle(
        pageDom,
        destDir,
        file,
        isPreferred,
      );

      const sidebarLink = isPreferred ? "{{SITE_HOME_PAGE}}" : articleBuiltName;
      if (sidebarDom) {
        await updateSidebar(sidebarDom, pageDom, fileData, sidebarLink);
      }
    }
  }

  log(GRAY, "Creating deployable build", CLEAR);
  copyDir(siteDir, buildDir, { minify: true });

  if (sidebarDom) {
    // Since the sidebar is updated in reverse order,
    // the order needs to be reversed before being added
    reverseElements(sidebarDom, "[data-find='side-bar-link-sections']");
    updateSidebarHomeLink(sidebarDom);
    log(GRAY, "Adding updated side bar", CLEAR);
    await addSidebarToFiles(sidebarDom);
  }

  // Update all HTML copied to the build/ directory with config data
  log(GRAY, "Updating build HTML files with data", CLEAR);
  await populateHTMLFromConfigs(buildDir);

  log("\n");
}
