
import { getSavedTheme, saveTheme } from "./storage.js";//app.js-shared theme and mobile navagation
const root = document.documentElement;
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const mobileMenu = document.querySelector("header details");
function applyTheme(theme) {
  const isPerformance = theme === "performance";
  root.dataset.theme = isPerformance ? "performance" : "battery";
  document.querySelectorAll("[data-theme-label]").forEach((label) => {
    label.textContent = isPerformance ? "Performance" : "Battery Saver";
  });
  document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
    icon.textContent = isPerformance ? "☾" : "☀";
  });
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(isPerformance));
    button.setAttribute(
      "aria-label",
      isPerformance ? "Switch to Battery Saver Mode" : "Switch to Performance Mode"
    );
  });
}
// Restore the same theme on all five pages.
applyTheme(getSavedTheme());
// Switch between Battery Saver and Performance modes.
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "battery" ? "performance" : "battery";
    try {
      saveTheme(nextTheme);
      applyTheme(nextTheme);
    } catch (error) {
      console.error("Could not save theme:", error);
      applyTheme(nextTheme);
    }
  });
});
// Keep the theme in sync if another browser tab changes it.
window.addEventListener("storage", (event) => {
  if (event.key === "lapwiseTheme") {
    applyTheme(getSavedTheme());
  }
});
// The HTML <details> element opens the mobile menu without extra JavaScript.
// This code closes it when the user clicks outside or presses Escape.
if (mobileMenu) {
  const menuButton = mobileMenu.querySelector("summary");
  mobileMenu.addEventListener("toggle", () => {
    menuButton?.setAttribute("aria-expanded", String(mobileMenu.open));
  });
  menuButton?.setAttribute("aria-expanded", String(mobileMenu.open));
  document.addEventListener("click", (event) => {
    if (mobileMenu.open && !mobileMenu.contains(event.target)) {
      mobileMenu.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.open) {
      mobileMenu.open = false;
      menuButton?.focus();
    }
  });
  mobileMenu.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.open = false;
    });
  });
}