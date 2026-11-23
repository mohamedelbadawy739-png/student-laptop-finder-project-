// ui.js
// Shared UI functions for Student Laptop Finder

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const codes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return codes[char];
  });

// Format laptop price
export const formatPrice = (price) =>
  "$" + Number(price).toLocaleString("en-US");

// Format storage size
export function formatStorage(storageGB) {
  return storageGB >= 1024
    ? `${storageGB / 1024} TB`
    : `${storageGB} GB`;
}

// Create one laptop card
export function createLaptopCard(laptop, isFavorite = false, enableFavorites = true) {
  const name = escapeHtml(laptop.name);
  const brand = escapeHtml(laptop.brand);
  const category = escapeHtml(laptop.category);
  const image = escapeHtml(laptop.image);
  const cpu = escapeHtml(laptop.cpu);
  const id = Number(laptop.id);

  return `
    <article class="laptop-card flex h-full flex-col">
      <div class="relative rounded-2xl bg-[var(--surface-alt)] p-4">
        <img src="${image}" alt="${name}" loading="lazy"
             class="h-40 w-full object-contain">

        <span class="absolute left-3 top-3 rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold capitalize text-[var(--muted)]">
          ${category}
        </span>
      </div>

      <div class="mt-4 flex flex-1 flex-col">
        <p class="text-xs font-semibold text-[var(--muted)]">
          ${brand}
        </p>

        <h3 class="mt-1 text-lg font-extrabold text-[var(--ink)]">
          ${name}
        </h3>

        <p class="mt-2 text-sm text-[var(--muted)]">
          ${cpu}
        </p>

        <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
          <span class="rounded-lg bg-[var(--surface-alt)] px-3 py-2">
            ${laptop.ramGB} GB RAM
          </span>

          <span class="rounded-lg bg-[var(--surface-alt)] px-3 py-2">
            ${formatStorage(laptop.storageGB)} SSD
          </span>

          <span class="rounded-lg bg-[var(--surface-alt)] px-3 py-2">
            ${laptop.batteryHours}h battery
          </span>
        </div>

        <div class="mt-auto flex items-center justify-between gap-3 pt-5">
          <p class="text-xl font-black text-[var(--accent)]">
            ${formatPrice(laptop.price)}
          </p>

          <button
            type="button"
            data-favorite-id="${id}"
            aria-label="${isFavorite ? "Remove" : "Add"} ${name} ${isFavorite ? "from" : "to"} favorites"
            aria-pressed="${isFavorite}"
            ${enableFavorites ? "" : "disabled title=\"Favorites will be enabled in the next step\""}
            class="rounded-xl border border-[var(--line)] px-3 py-2 text-xl text-[var(--accent)] transition hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ${isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <a class="btn-action mt-3 w-full text-sm"
           href="details.html?id=${id}">
          View Details
        </a>
      </div>
    </article>
  `;
}

// Render laptop cards
export function renderLaptopCards(
  container,
  laptops,
  favoriteIds = [],
  onFavoriteToggle = null
) {
  if (!container) return;

  const savedIds = favoriteIds.map((item) =>
    Number(typeof item === "object" ? item.id : item)
  );

  const canToggle = typeof onFavoriteToggle === "function";

  container.innerHTML = laptops
    .map((laptop) =>
      createLaptopCard(
        laptop,
        savedIds.includes(Number(laptop.id)),
        canToggle
      )
    )
    .join("");

  // Handle favorite button clicks
  container.onclick = (event) => {
    const button = event.target.closest("[data-favorite-id]");

    if (button && container.contains(button) && canToggle) {
      onFavoriteToggle(Number(button.dataset.favoriteId));
    }
  };
}

// Render laptop specifications
export function renderSpecifications(tableBody, laptop) {
  if (!tableBody) return;

  const specs = [
    ["Brand", laptop.brand],
    ["Category", laptop.category],
    ["Processor", laptop.cpu],
    ["RAM", `${laptop.ramGB} GB`],
    ["Storage", formatStorage(laptop.storageGB)],
    ["Battery life", `${laptop.batteryHours} hours`],
    ["Weight", `${laptop.weightKg} kg`],
    ["Screen size", `${laptop.screenInches} inches`]
  ];

  tableBody.innerHTML = specs
    .map(([label, value]) => `
      <tr>
        <th scope="row"
            class="px-6 py-4 text-sm font-bold text-[var(--ink)]">
          ${escapeHtml(label)}
        </th>

        <td class="px-6 py-4 text-sm text-[var(--muted)]">
          ${escapeHtml(value)}
        </td>
      </tr>
    `)
    .join("");
}
// Show or hide loading and error messages
export function showStatus(element, visible, message = "") {
  if (!element) return;

  element.classList.toggle("hidden", !visible);

  if (message) {
    element.textContent = message;
  }
}