import fs from "fs";
import path from "path";

import { JSDOM } from "jsdom";
import { colors, directories, templates } from "./variables.mjs";
import { query, getFormattedDateName } from "./helpers.mjs";

const { GRAY, RED, CYAN, GREEN, BLUE, ORANGE, CLEAR } = colors;
const { articlesDir, sourceDir, siteDir, templatesDir } = directories;

async function createArticle(fileName) {
    const article = templates.article;

    if (!fileName) {
        fileName = getFormattedDateName();
    }
        
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir);
    }

    const templatePath = path.join(sourceDir, templatesDir, `${article.name}.html`);
    const newArticlePath = path.join(articlesDir, `${fileName}.html`);
    fs.copyFileSync(templatePath, newArticlePath);

    return newArticlePath;
}

export default async function create(fileName) {
    console.log(`${CYAN}Generating blog template${CLEAR}`, "\n");

    const filePath = await createArticle(fileName);

    console.log(`${RED}${filePath}${CLEAR} file created`, "\n");
    console.log(`${GREEN}Template generation complete!${CLEAR}`, "\n");
}
