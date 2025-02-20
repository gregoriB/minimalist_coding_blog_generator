const lightCodetheme = "atom-one-light";
const darkCodetheme = "atom-one-dark";

const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]',
);
const currentTheme = localStorage.getItem("theme");

if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "dark") {
    changeTheme(darkCodetheme);
    toggleSwitch.checked = true;
  }
}

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    changeTheme(darkCodetheme);
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    changeTheme(lightCodetheme);
  }
}

toggleSwitch.addEventListener("change", switchTheme, false);
