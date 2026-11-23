import { loadLaptops } from "./api.js";
import { renderLaptopCards, formatPrice, showStatus } from "./ui.js";
import { getFavorites, toggleFavorite, clearFavorites } from "./storage.js";

const grid = document.getElementById("favoritesGrid");
const emptyMessage = document.getElementById("favoritesEmpty");
const errorMessage = document.getElementById("favoritesError");
const clearButton = document.getElementById("clearFavorites");

const countElement = document.getElementById("favoritesCount");
const totalElement = document.getElementById("favoritesTotalPrice");
const averageElement = document.getElementById("favoritesAveragePrice");

let allLaptops = [];

// Keep comparison items in sync with favorites
function updateCompareSelection() {
  let saved = [];

  try {
    saved = JSON.parse(
      localStorage.getItem("lapwiseCompare") || "[]"
    );
  } catch (error) {
    console.error("Invalid comparison list:", error);
  }

  if (!Array.isArray(saved)) saved = [];

  const favoriteIds = getFavorites();

  const selected = saved.filter((id) =>
    favoriteIds.includes(Number(id))
  );

  localStorage.setItem(
    "lapwiseCompare",
    JSON.stringify(selected)
  );
}

// Display favorite laptops and calculate statistics
function updateFavorites() {
  const favoriteIds = getFavorites();

  const favorites = allLaptops.filter((laptop) =>
    favoriteIds.includes(Number(laptop.id))
  );

  const totalPrice = favorites.reduce(
    (total, laptop) => total + Number(laptop.price),
    0
  );

  const averagePrice = favorites.length
    ? totalPrice / favorites.length
    : 0;
  countElement.textContent = favorites.length;
  totalElement.textContent = formatPrice(totalPrice);
  averageElement.textContent = formatPrice(averagePrice);

  renderLaptopCards(
    grid,
    favorites,
    favoriteIds,
    (id) => {
      try {
        toggleFavorite(id);
        updateCompareSelection();
        updateFavorites();
      } catch (error) {
        console.error(error);

        showStatus(
          errorMessage,
          true,
          "Could not update favorites. Try again."
        );
      }
    }
  );

  showStatus(emptyMessage, favorites.length === 0);

  clearButton.disabled = favorites.length === 0;

  clearButton.classList.toggle(
    "opacity-50",
    favorites.length === 0
  );
}

// Clear all favorites
clearButton.addEventListener("click", () => {
  if (!getFavorites().length) return;

  if (!confirm("Remove all laptops from favorites?")) {
    return;
  }
  try {
    clearFavorites();
    updateCompareSelection();

    showStatus(errorMessage, false);
    updateFavorites();
  } catch (error) {
    console.error(error);
    showStatus(
      errorMessage,
      true,
      "Could not clear favorites. Try again."
    );
  }
});
// Load laptop data
async function startFavorites() {
  showStatus(emptyMessage, false);
  showStatus(errorMessage, false);

  grid.textContent = "Loading saved laptops...";

  try {
    allLaptops = await loadLaptops();
    updateFavorites();
  } catch (error) {
    console.error(error);

    grid.textContent = "";

    showStatus(
      errorMessage,
      true,
      "Unable to load your favorite laptops."
    );
  }
}

// Update favorites if changed in another tab
window.addEventListener("storage", (event) => {
  if (event.key === "lapwiseFavorites") {
    updateFavorites();
  }
});

startFavorites();