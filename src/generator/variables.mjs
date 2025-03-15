import fs from "fs";
export const colors = {
  CLEAR: `\x1b[0m`,
  RED: `\x1b[31m`,
  GREEN: `\x1b[32m`,
  YELLOW: `\x1b[33m`,
  BLUE: `\x1b[34m`,
  MAGENTA: `\x1b[35m`,
  CYAN: `\x1b[36m`,
  GRAY: `\x1b[90m`,
  ORANGE: `\x1b[38,5,214m`,
};

export const fileFormats = {
  yaml: "yaml",
  json: "json",
  html: "html",
};

export const directories = {
  backupsDir: "backups/",
  sourceDir: "src/",
  siteDir: "src/site/",
  buildDir: "build/",
  articlesDir: "articles/",
  templatesDir: "src/templates/",
  configsDir: "src/configs/",
};

export const configs = {
  main: {
    format: fileFormats.yaml,
    dir: directories.configsDir,
  },
};

export const commands = {
  BAD_COMMAND: "bad-command",
  HELP_SHORT: "-h",
  HELP: "help",
  BACKUP: "backup",
  BUILD: "build",
  NEW: "new",
};

export const flags = {
  DISABLE_BACKUPS: "--no-backup",
};

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const leftPadding = "     ";

function getFiles(dir, fileExtension) {
  return fs.readdirSync(dir).filter((file) => file.endsWith(fileExtension));
}

function createTemplateConfig(file) {
  return {
    name: file,
    selector: file === "page" ? "html" : `[data-find='${file}']`,
    marker: `{{TEMPLATE_${file.toUpperCase()}}}`,
  };
}

function generateTemplateConfigs() {
  const configs = {};
  const templateFiles = getFiles(directories.templatesDir, "html");
  for (const file of templateFiles) {
    const name = file.split(".")[0];
    configs[name] = createTemplateConfig(name);
  }

  return configs;
}

export const templates = generateTemplateConfigs();
