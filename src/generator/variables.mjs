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
  siteDir: "site/",
  buildDir: "build/",
  articlesDir: "articles/",
  templatesDir: "templates/",
};

export const templates = {
  main: {
    name: "head",
    selector: "html",
  },
  banner: {
    name: "banner",
    selector: "[data-find='banner']",
    marker: "{{SITE_BANNER}}",
  },
  sidebar: {
    name: "sidebar",
    selector: "[data-find='side-bar']",
    marker: "{{SIDE_BAR}}",
  },
  article: {
    name: "article",
    selector: "[data-find='main-content']",
    marker: "{{ARTICLE}}",
  },
  footer: {
    name: "footer",
    selector: "[data-find='footer']",
    marker: "{{SITE_FOOTER}}",
  },
};

export const configs = {
  main: { name: "config", format: fileFormats.yaml },
  article: { name: "article", format: fileFormats.yaml },
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
