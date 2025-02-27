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

export const directories = {
  backupsDir: "backups/",
  sourceDir: "src/",
  siteDir: "site/",
  buildDir: "build/",
  articlesDir: "articles/",
  templatesDir: "templates/",
};

export const templates = {
    main: { name: "head", selector: "html" }, 
    banner: { name: "banner", selector: "[data-find='banner']" }, 
    sidebar: { name: "sidebar", selector: "[data-find='side-bar']" }, 
    article: { name: "article", selector: "[data-find='main-content']" }, 
    footer: { name: "footer", selector: "[data-find='footer']" },
};

export const templateFile = "template.html";

export const commands = {
  HELP_SHORT: "-h",
  HELP: "help",
  BACKUP: "backup",
  UPDATE: "update",
  BUILD: "build",
  NEW: "new",
  ALL: "all",
};

export const months = [
"January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];


export const leftPadding = "     ";
