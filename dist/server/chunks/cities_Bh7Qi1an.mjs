const CITIES = [
  { id: "bogota", name: "Bogotá", postal_code: "11001" },
  { id: "medellin", name: "Medellín", postal_code: "05001" },
  { id: "cali", name: "Cali", postal_code: "76001" },
  { id: "barranquilla", name: "Barranquilla", postal_code: "08001" },
  { id: "cartagena", name: "Cartagena", postal_code: "13001" },
  { id: "bucaramanga", name: "Bucaramanga", postal_code: "68001" },
  { id: "pereira", name: "Pereira", postal_code: "66001" },
  { id: "manizales", name: "Manizales", postal_code: "17001" },
  { id: "cucuta", name: "Cúcuta", postal_code: "54001" },
  { id: "ibague", name: "Ibagué", postal_code: "73001" },
  { id: "santa-marta", name: "Santa Marta", postal_code: "47001" },
  { id: "villavicencio", name: "Villavicencio", postal_code: "50001" }
];
const DEFAULT_CITY = CITIES[0];
function findCity(cityId) {
  const key = (cityId || "").trim().toLowerCase();
  const found = CITIES.find((c) => c.id === key);
  return found || DEFAULT_CITY;
}
function cityCatalog() {
  return CITIES.map((c) => ({ id: c.id, name: c.name }));
}

export { cityCatalog as c, findCity as f };
