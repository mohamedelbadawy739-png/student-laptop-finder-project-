// storage.js - Save favorites and theme using localStorage

const FAVORITES_KEY = "lapwiseFavorites";
const THEME_KEY = "lapwiseTheme";

// Get saved favorite laptop IDs
export function getFavorites() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return [...new Set(
      saved.map(Number).filter(id => Number.isInteger(id) && id > 0)
    )];
  } catch (error) {
    console.error("Could not read favorites:", error);
    return [];
  }
}
// Save favorite IDs
function saveFavorites(ids) {
  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(ids)
  );
}
// Check if a laptop is a favorite
export function isFavorite(id) {
  return getFavorites().includes(Number(id));
}
// Add a laptop to favorites
export function addFavorite(id) {
  const laptopId = Number(id);
  if (!Number.isInteger(laptopId) || laptopId <= 0) return;
  const favorites = getFavorites();

  if (!favorites.includes(laptopId)) {
    favorites.push(laptopId);
    saveFavorites(favorites);
  }
}
// Remove a laptop from favorites
export function removeFavorite(id) {
  const favorites = getFavorites().filter(
    savedId => savedId !== Number(id)
  );
  saveFavorites(favorites);
}
// Add or remove a favorite
export function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return isFavorite(id);
}
// Clear all favorites
export function clearFavorites() {
  saveFavorites([]);
}
// Get saved theme
export function getSavedTheme() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(THEME_KEY)
    );

    return saved === "performance"
      ? "performance"
      : "battery";
  } catch (error) {
    console.error("Could not read theme:", error);
    return "battery";
  }
}
// Save selected theme
export function saveTheme(theme) {
  const selectedTheme = theme === "performance"
    ? "performance"
    : "battery";

  localStorage.setItem(
    THEME_KEY,
    JSON.stringify(selectedTheme)
  );
  return selectedTheme;
}