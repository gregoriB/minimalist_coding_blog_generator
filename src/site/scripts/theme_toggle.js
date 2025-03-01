const lightStyling = "atom-one-light";
const darkStyling = "atom-one-dark";
const defaultTheme = "dark";
const otherTheme = "light";
const themeSelector = "data-theme";

function changeTheme(theme) {
  document.getElementById("hljs-theme").href =
    `deps/highlight/styles/${theme}.min.css`;

  // reload iframes with new theme
  document.querySelectorAll("iframe").forEach((el) => {
    el.src += "";
  });
}

function getThemeStyling(theme = defaultTheme) {
  return theme === "dark" ? darkStyling : lightStyling;
}

const toggle = document.querySelector('.theme-switch input[type="checkbox"]');

function setCurrentTheme() {
  const currentTheme = localStorage.getItem("theme") || defaultTheme;
  document.documentElement.setAttribute(themeSelector, currentTheme);
  toggle.checked = currentTheme != defaultTheme;
  changeTheme(getThemeStyling(currentTheme));
}

function switchTheme(e) {
  const theme = e.target.checked ? otherTheme : defaultTheme;
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute(themeSelector, theme);

  changeTheme(getThemeStyling(theme));
}

toggle.addEventListener("change", switchTheme, false);

setCurrentTheme();
