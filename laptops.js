  // laptops.js
// Search, filter and sort laptops

import { loadLaptops } from "./api.js";
import { renderLaptopCards, showStatus } from "./ui.js";

const grid = document.getElementById("laptopsGrid");
const loading = document.getElementById("catalogLoading");
const empty = document.getElementById("catalogEmpty");
const errorMessage = document.getElementById("catalogError");
const resultCount = document.getElementById("resultCount");
const filtersForm = document.getElementById("catalogFilters");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const maxPriceFilter = document.getElementById("maxPriceFilter");
const minRamFilter = document.getElementById("minRamFilter");
const sortSelect = document.getElementById("sortSelect");

let allLaptops = [];

// Apply search, filters and sorting
function updateLaptops() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const maxPrice = maxPriceFilter.value === ""
    ? Infinity
    : Number(maxPriceFilter.value);

  const minRam = Number(minRamFilter.value);

  const filtered = allLaptops.filter((laptop) => {
    const matchesSearch =
      laptop.name.toLowerCase().includes(search) ||
      laptop.brand.toLowerCase().includes(search);

    const matchesCategory =
      !category || laptop.category === category;

    const matchesPrice = laptop.price <= maxPrice;
    const matchesRam = laptop.ramGB >= minRam;

    return matchesSearch && matchesCategory &&
           matchesPrice && matchesRam;
  });

  // Sorting options
  const sortOptions = {
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,

    batteryAsc: (a, b) => a.batteryHours - b.batteryHours,
    batteryDesc: (a, b) => b.batteryHours - a.batteryHours,

    weightAsc: (a, b) => a.weightKg - b.weightKg,
    weightDesc: (a, b) => b.weightKg - a.weightKg
  };

  const laptopsToShow = [...filtered];

  const sortFunction = sortOptions[sortSelect.value];

  if (sortFunction) {
    laptopsToShow.sort(sortFunction);
  }

  // Display laptops
  renderLaptopCards(grid, laptopsToShow);

  resultCount.textContent = laptopsToShow.length;

  showStatus(empty, laptopsToShow.length === 0);
}

// Load laptops from JSON
async function startCatalogue() {
  showStatus(loading, true);
  showStatus(empty, false);
  showStatus(errorMessage, false);

  try {
    allLaptops = await loadLaptops();
    updateLaptops();

  } catch (error) {
    console.error(error);

    resultCount.textContent = "0";
    grid.innerHTML = "";

    showStatus(
      errorMessage,
      true,
      "Could not load laptop data. Please refresh the page."
    );

  } finally {
    showStatus(loading, false);
  }
}

// Update results when filters change
filtersForm.addEventListener("input", updateLaptops);
filtersForm.addEventListener("change", updateLaptops);

// Reset all filters
filtersForm.addEventListener("reset", () => {
  setTimeout(updateLaptops, 0);
});

// Start the page
startCatalogue();