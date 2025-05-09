import fs from "fs";
import path from "path";

import { colors, configs, directories, templates } from "./variables.mjs";
import {
  log,
  getFormattedDateName,
  getConfigLoader,
  getConfigSerializer,
} from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, CLEAR } = colors;
const { articlesDir, configsDir, sourceDir, templatesDir } = directories;

function createArticle(fileName = "") {
  const template = templates.article;
  const { format } = configs.article || configs.main;
  const parseFile = getConfigLoader(format);
  const serialize = getConfigSerializer(format);

  const newFileName = fileName || getFormattedDateName();

  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir);
  }

  const filePath = path.join(configsDir, `${template.name}.${format}`);
  const newArticlePath = path.join(articlesDir, `${newFileName}.${format}`);

  if (fs.existsSync(newArticlePath)) {
    throw new Error(
      `Article "${newFileName}" already exists!  Cannot create file`,
    );
  }

  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = parseFile(data);

  const date = new Date();
  const dateFormatted = date.toISOString().slice(0, 19);
  parsed.DATE_TIME = dateFormatted;
  parsed.HEADING = fileName;

  const serialized = serialize(parsed);
  fs.writeFileSync(newArticlePath, serialized, "utf8");

  return newArticlePath;
}

export default function create(fileName) {
  log(CYAN, "Generating blog template", CLEAR, "\n");

  const filePath = createArticle(fileName);

  log(RED, filePath, CLEAR, " file created", "\n");
  log(GREEN, "Template generation complete!", CLEAR, "\n");
}
