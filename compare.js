// compare.js - Shared comparison calculations
import { formatPrice, formatStorage } from "./ui.js";

// A lower number is better for price and weight.
// A higher number is better for RAM, storage, and battery life.
export const comparisonSpecs = [
  { label: "Price", key: "price", best: "lowest", format: (value) => formatPrice(value) },
  { label: "Processor", key: "cpu", best: null, format: (value) => value },
  { label: "RAM", key: "ramGB", best: "highest", format: (value) => `${value} GB` },
  { label: "Storage", key: "storageGB", best: "highest", format: (value) => formatStorage(value) },
  { label: "Battery life", key: "batteryHours", best: "highest", format: (value) => `${value} hours` },
  { label: "Weight", key: "weightKg", best: "lowest", format: (value) => `${value} kg` },
  { label: "Screen size", key: "screenInches", best: null, format: (value) => `${value} inches` },
  { label: "Category", key: "category", best: null, format: (value) => value }
];

export function getBestValue(laptops, spec) {
  if (!laptops.length || !spec.best) return null;

  const values = laptops.map((laptop) => Number(laptop[spec.key]));

  return spec.best === "lowest"
    ? Math.min(...values)
    : Math.max(...values);
}

export function getComparisonRows(laptops) {
  return comparisonSpecs.map((spec) => {
    const bestValue = getBestValue(laptops, spec);

    return {
      label: spec.label,
      cells: laptops.map((laptop) => ({
        value: spec.format(laptop[spec.key]),
        isBest: bestValue !== null && Number(laptop[spec.key]) === bestValue
      }))
    };
  });
}