// details.js - Laptop details page

import { getLaptopById } from "./api.js";
import { formatPrice, renderSpecifications, showStatus } from "./ui.js";
import { isFavorite, addFavorite, toggleFavorite, getFavorites } from "./storage.js";

const loading = document.getElementById("detailsLoading");
const content = document.getElementById("detailsContent");
const errorBox = document.getElementById("detailsError");
const favoriteButton = document.getElementById("detailsFavoriteButton");
const compareButton = document.getElementById("detailsCompareButton");
const message = document.getElementById("detailsMessage");

const COMPARE_KEY = "lapwiseCompare";

function showError(title, description) {
  errorBox.querySelector("h1").textContent = title;

  const descriptionElement = errorBox.querySelector("h1 + p");
  if (descriptionElement) {
    descriptionElement.textContent = description;
  }

  showStatus(content, false);
  showStatus(errorBox, true);
}

function getCompareIds() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(COMPARE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    const favorites = getFavorites();

    return [...new Set(saved.map(Number))]
      .filter(id => Number.isInteger(id) && favorites.includes(id))
      .slice(0, 4);

  } catch (error) {
    console.error("Could not read comparison list:", error);
    return [];
  }
}

function saveCompareIds(ids) {
  localStorage.setItem(
    COMPARE_KEY,
    JSON.stringify(ids)
  );
}

function updateFavoriteButton(id) {
  const saved = isFavorite(id);

  favoriteButton.textContent = saved
    ? "♥ Remove from favorites"
    : "♡ Add to favorites";

  favoriteButton.setAttribute("aria-pressed", String(saved));
}

function updateCompareButton(id) {
  const selected = getCompareIds().includes(id);

  compareButton.textContent = selected
    ? "✓ Remove from compare"
    : "⇄ Add to compare";

  compareButton.setAttribute("aria-pressed", String(selected));
}

function showMessage(text) {
  message.textContent = text;
}

function displayLaptop(laptop) {
  document.getElementById("detailsImage").src = laptop.image;
  document.getElementById("detailsImage").alt = laptop.name;

  document.getElementById("detailsCategory").textContent = laptop.category;
  document.getElementById("detailsName").textContent = laptop.name;
  document.getElementById("detailsBrand").textContent = laptop.brand;
  document.getElementById("detailsPrice").textContent = formatPrice(laptop.price);
  document.getElementById("detailsDescription").textContent = laptop.description;

  renderSpecifications(
    document.getElementById("detailsSpecTable"),
    laptop
  );

  updateFavoriteButton(laptop.id);
  updateCompareButton(laptop.id);

  favoriteButton.addEventListener("click", () => {
    try {
      const added = toggleFavorite(laptop.id);

      updateFavoriteButton(laptop.id);
      updateCompareButton(laptop.id);

      showMessage(
        added ? "Added to favorites." : "Removed from favorites."
      );
    } catch (error) {
      showMessage("Could not update favorites. Please try again.");
    }
  });

  compareButton.addEventListener("click", () => {
    try {
      const selected = getCompareIds();
      if (selected.includes(laptop.id)) {
        saveCompareIds(
          selected.filter(id => id !== laptop.id)
        );
        showMessage("Removed from comparison.");
      } else {
        if (selected.length >= 4) {
          showMessage("You can compare up to 4 laptops. Remove one first.");
          return;
        }
        const wasFavorite = isFavorite(laptop.id);
        if (!wasFavorite) {
          addFavorite(laptop.id);
        }
        saveCompareIds([...selected, laptop.id]);
        updateFavoriteButton(laptop.id);
        showMessage(
          wasFavorite
            ? "Added to comparison. Open Compare to view your selection."
            : "Added to favorites and comparison. Open Compare to view your selection."
        );
      }
      updateCompareButton(laptop.id);
    } catch (error) {
      showMessage("Could not update comparison. Please try again.");
    }
  });
  showStatus(content, true);
}
async function startDetails() {
  showStatus(loading, true);
  showStatus(content, false);
  showStatus(errorBox, false);

  const idText = new URLSearchParams(
    window.location.search
  ).get("id");

  const id = Number(idText);

  if (!idText || !Number.isInteger(id) || id <= 0) {
    showError(
      "Laptop not found",
      "This link has a missing or invalid laptop ID."
    );

    showStatus(loading, false);
    return;
  }

  try {
    const laptop = await getLaptopById(id);

    if (laptop) {
      displayLaptop(laptop);
    } else {
      showError(
        "Laptop not found",
        "No laptop matches this ID."
      );
    }

  } catch (error) {
    console.error(error);

    showError(
      "Unable to load laptop",
      "Please check your connection and try again."
    );

  } finally {
    showStatus(loading, false);
  }
}
startDetails();