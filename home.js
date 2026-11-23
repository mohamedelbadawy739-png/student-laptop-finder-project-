import { loadLaptops } from "./api.js";
import { renderLaptopCards, formatPrice, showStatus } from "./ui.js";
import { getFavorites, toggleFavorite } from "./storage.js";
const totalElement = document.getElementById("totalLaptops");
const lowestElement = document.getElementById("lowestPrice");
const favoritesElement = document.getElementById("homeFavoritesCount");
const featuredGrid = document.getElementById("featuredLaptops");
const loading = document.getElementById("featuredLoading");
const errorBox = document.getElementById("featuredError");
let allLaptops = [];
// Update favorites count and featured cards
function updateFavorites() {
  const savedIds = getFavorites();
  const validIds = savedIds.filter((id) =>
    allLaptops.some((laptop) => Number(laptop.id) === id)
  );
  favoritesElement.textContent = validIds.length;
  renderLaptopCards(
    featuredGrid,
    allLaptops.slice(0, 3),
    savedIds,
    (id) => {
      toggleFavorite(id);
      updateFavorites();
    }
  );
}
// Load laptops and update home statistics
async function startHome() {
  showStatus(loading, true);
  showStatus(errorBox, false);
  try {
    allLaptops = await loadLaptops();
    totalElement.textContent = allLaptops.length;
    const lowestPrice = allLaptops.reduce(
      (lowest, laptop) =>
        Math.min(lowest, Number(laptop.price)),
      Infinity
    );
    lowestElement.textContent = allLaptops.length
      ? formatPrice(lowestPrice)
      : "—";
    updateFavorites();
  } catch (error) {
    console.error(error);
    totalElement.textContent = "—";
    lowestElement.textContent = "—";
    favoritesElement.textContent = "—";
    showStatus(errorBox, true);
  } finally {
    showStatus(loading, false);
  }
}
// Update when favorites change in another tab
window.addEventListener("storage", (event) => {
  if (event.key === "lapwiseFavorites" && allLaptops.length) {
    updateFavorites();
  }
});
startHome();