const lightStyling = "atom-one-light";
const darkStyling = "atom-one-dark";
const defaultTheme = "dark";
const otherTheme = "light";
const themeSelector = "data-theme";

function getThemeStyling(theme = defaultTheme) {
  return theme === "dark" ? darkStyling : lightStyling;
}

const toggle = document.querySelector('.theme-switch input[type="checkbox"]');

function setCurrentTheme() {
  const currentTheme = localStorage.getItem("theme") || defaultTheme;
  document.documentElement.setAttribute(themeSelector, currentTheme);
  toggle.checked = currentTheme != defaultTheme;
console.log("setting theme: ", currentTheme);

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
