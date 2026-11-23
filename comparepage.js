// comparePage.js - Favorites picker and comparison table

import { loadLaptops } from "./api.js";
import { getFavorites } from "./storage.js";
import { formatPrice, showStatus } from "./ui.js";
import { getComparisonRows } from "./compare.js";

const COMPARE_KEY = "lapwiseCompare";

const picker = document.getElementById("comparePicker");
const count = document.getElementById("selectedCompareCount");
const message = document.getElementById("compareMessage");
const empty = document.getElementById("compareEmpty");
const wrapper = document.getElementById("compareTableWrapper");
const head = document.getElementById("compareTableHead");
const body = document.getElementById("compareTableBody");
const errorBox = document.getElementById("compareError");

let allLaptops = [];
let selectedIds = [];

function readSelectedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];

    const favorites = getFavorites();
    const available = new Set(allLaptops.map((laptop) => Number(laptop.id)));

    return [...new Set(saved.map(Number))]
      .filter((id) => Number.isInteger(id) && favorites.includes(id) && available.has(id))
      .slice(0, 4);
  } catch (error) {
    console.error("Could not read comparison selection:", error);
    return [];
  }
}

function saveSelectedIds() {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(selectedIds));
}

function showPicker() {
  const favorites = getFavorites();
  const laptops = allLaptops.filter((laptop) => favorites.includes(Number(laptop.id)));
  picker.replaceChildren();

  if (!laptops.length) {
    const paragraph = document.createElement("p");
    paragraph.className = "text-sm leading-6 text-[var(--muted)]";
    paragraph.textContent = "No favorites yet. Save some laptops first.";
    picker.append(paragraph);
    return;
  }

  laptops.forEach((laptop) => {
    const label = document.createElement("label");
    label.className = "flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 transition hover:border-[var(--accent)]";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = laptop.id;
    checkbox.checked = selectedIds.includes(Number(laptop.id));
    checkbox.className = "h-4 w-4 shrink-0 accent-[var(--accent)]";

    const details = document.createElement("span");
    details.className = "min-w-0 text-sm";

    const name = document.createElement("span");
    name.className = "block font-bold text-[var(--ink)]";
    name.textContent = laptop.name;

    const price = document.createElement("span");
    price.className = "block text-xs text-[var(--muted)]";
    price.textContent = formatPrice(laptop.price);

    details.append(name, price);
    label.append(checkbox, details);
    picker.append(label);
  });
}

function showComparison() {
  count.textContent = selectedIds.length;

  if (selectedIds.length < 2) {
    showStatus(empty, true);
    showStatus(wrapper, false);
    head.replaceChildren();
    body.replaceChildren();
    return;
  }

  // Preserve the order in which the laptops were selected.
  const laptops = selectedIds
    .map((id) => allLaptops.find((laptop) => Number(laptop.id) === id))
    .filter(Boolean);

  head.replaceChildren();
  body.replaceChildren();

  const headerRow = document.createElement("tr");
  const firstHeader = document.createElement("th");

  firstHeader.scope = "col";
  firstHeader.className = "sticky left-0 z-10 min-w-32 bg-[var(--surface)] p-4 font-bold text-[var(--muted)]";
  firstHeader.textContent = "Specification";

  headerRow.append(firstHeader);

  laptops.forEach((laptop) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = "min-w-44 border-b border-[var(--line)] p-4 text-left font-bold";

    const image = document.createElement("img");
    image.src = laptop.image;
    image.alt = laptop.name;
    image.loading = "lazy";
    image.className = "mb-2 h-20 w-full object-contain";

    const name = document.createElement("span");
    name.textContent = laptop.name;

    th.append(image, name);
    headerRow.append(th);
  });

  head.append(headerRow);

  getComparisonRows(laptops).forEach((row) => {
    const tr = document.createElement("tr");
    const label = document.createElement("th");

    label.scope = "row";
    label.className = "sticky left-0 z-10 border-b border-[var(--line)] bg-[var(--surface)] p-4 text-left font-bold";
    label.textContent = row.label;

    tr.append(label);

    row.cells.forEach((cell) => {
      const td = document.createElement("td");
      td.className = "border-b border-[var(--line)] p-4 text-[var(--ink)]";
      td.textContent = cell.value;

      if (cell.isBest) {
        td.classList.add(
          "bg-[var(--accent-soft)]",
          "font-extrabold",
          "text-[var(--accent)]"
        );
        td.title = "Best value";
      }

      tr.append(td);
    });

    body.append(tr);
  });

  showStatus(empty, false);
  showStatus(wrapper, true);
}

function refreshPage() {
  selectedIds = readSelectedIds();
  showPicker();
  showComparison();
}

picker.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;

  const id = Number(checkbox.value);
  message.textContent = "";

  if (checkbox.checked) {
    if (selectedIds.length >= 4) {
      checkbox.checked = false;
      message.textContent = "You can compare up to 4 laptops. Remove one first.";
      return;
    }

    selectedIds.push(id);
  } else {
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
  }

  saveSelectedIds();
  showComparison();
});

window.addEventListener("storage", (event) => {
  if (event.key === "lapwiseFavorites" || event.key === COMPARE_KEY) {
    refreshPage();
  }
});

async function startCompare() {
  showStatus(errorBox, false);
  picker.textContent = "Loading favorites...";

  try {
    allLaptops = await loadLaptops();
    refreshPage();
    saveSelectedIds();
  } catch (error) {
    console.error(error);
    picker.textContent = "";
    showStatus(
      errorBox,
      true,
      "Unable to load laptops. Please refresh the page."
    );
  }
}

startCompare();