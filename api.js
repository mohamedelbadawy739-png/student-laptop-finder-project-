export async function loadLaptops() {
  try {
    const response = await fetch("./data/laptops.json");

    if (!response.ok) {
      throw new Error("Failed to load laptops");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}