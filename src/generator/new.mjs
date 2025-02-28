import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { JSDOM } from "jsdom";
import { colors, directories, templates } from "./variables.mjs";
import { query, getFormattedDateName } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, templatesDir } = directories;

async function createArticleHTML(fileName) {
  const article = templates.article;

  if (!fileName) {
    fileName = getFormattedDateName();
  }

  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir);
  }

  const templatePath = path.join(
    sourceDir,
    templatesDir,
    `${article.name}.html`,
  );
  const newArticlePath = path.join(articlesDir, `${fileName}.html`);
  fs.copyFileSync(templatePath, newArticlePath);

  return newArticlePath;
}

async function createArticleYAML(fileName) {
  const article = templates.article;

  if (!fileName) {
    fileName = getFormattedDateName();
  }

  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir);
  }

  const yamlPath = path.join(sourceDir, templatesDir, `${article.name}.yaml`);
  const newArticlePath = path.join(articlesDir, `${fileName}.yaml`);
  const data = fs.readFileSync(yamlPath, "utf-8");
  const parsed = yaml.load(data);

  const date = new Date();
  const dateFormatted = date.toISOString().slice(0, 19);
  parsed.DATE_TIME = dateFormatted;

  const yamlString = yaml.dump(parsed, { noRefs: true });

  fs.writeFileSync(newArticlePath, yamlString, "utf8");

  return newArticlePath;
}

export default async function create(fileName) {
  console.log(`${CYAN}Generating blog template${CLEAR}`, "\n");

  const filePath = await createArticleYAML(fileName);

  console.log(`${RED}${filePath}${CLEAR} file created`, "\n");
  console.log(`${GREEN}Template generation complete!${CLEAR}`, "\n");
}
