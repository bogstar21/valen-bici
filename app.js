// Crear el mapa centrado en Valencia, zoom 15
const map = L.map('map').setView([39.4699, -0.3763], 15);

// Capa de mapa oscuro moderno
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Marcadores guardados para filtros
let markers = [];

// --- Cargar estaciones Valenbisi ---
async function loadStations() {
  try {
    const url = "https://api.citybik.es/v2/networks/valenbisi";
    const response = await fetch(url);
    const data = await response.json();

    const estaciones = data.network.stations;

    estaciones.forEach(estacion => {
      const color = getColor(estacion.free_bikes);

      // Tamaño del círculo entre 5 y 12
      const minSize = 25;
      const maxSize = 40;
      const maxBikes = 10; // supongamos que 20 bicis es el máximo normal
      const size = Math.min(minSize + (estacion.free_bikes / maxBikes) * (maxSize - minSize), maxSize);

      const marker = L.circle([estacion.latitude, estacion.longitude], {
        radius: size,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <b>${estacion.name}</b><br>
        🚲 Bicis disponibles: ${estacion.free_bikes}<br>
        🅿️ Anclajes libres: ${estacion.empty_slots}
      `);

      marker.free_bikes = estacion.free_bikes;
      markers.push(marker);
    });

  } catch (error) {
    console.error("Error cargando estaciones:", error);
  }
}

// Función color según bicis
function getColor(bikes) {
  if (bikes === 0) return "red";
  if (bikes <= 3) return "orange";
  return "#00d8ff"; // azul brillante para muchas bicis
}

// --- FILTROS ---
document.getElementById("filter-bikes").addEventListener("click", () => {
  markers.forEach(m => {
    if (m.free_bikes > 0) m.addTo(map);
    else map.removeLayer(m);
  });
});

document.getElementById("filter-empty").addEventListener("click", () => {
  markers.forEach(m => {
    if (m.free_bikes === 0) m.addTo(map);
    else map.removeLayer(m);
  });
});

document.getElementById("filter-all").addEventListener("click", () => {
  markers.forEach(m => m.addTo(map));
});

// Cargar estaciones al inicio
loadStations();
