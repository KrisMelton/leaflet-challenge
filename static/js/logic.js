// Constant for marker size scaling
const MARKER_SCALE_FACTOR = 4.5;

// Function to set up the base layer
function buildTileLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map tiles © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
}

// Function to initialize the map
function createMapView(initialCoordinates, zoomValue, baseLayers) {
    return L.map("map", {
        center: initialCoordinates,
        zoom: zoomValue,
        layers: baseLayers
    });
}

// Function to add layer control to the map
function applyLayerControl(mapInstance, baseLayers, overlayLayers) {
    L.control.layers(baseLayers, overlayLayers, {
        collapsed: false
    }).addTo(mapInstance);
}

// Function to generate legend HTML
function generateLegendHTML(legendLevels) {
    return legendLevels.map(level => {
        return `<ul style="background-color: ${level.color}"><span>${level.range}</span></ul>`;
    }).join('');
}

// Function to create and add the legend to the map
function attachLegendToMap(mapInstance) {
    const mapLegend = L.control({ position: 'bottomleft' });
    
    mapLegend.onAdd = function () {
        const legendBox = L.DomUtil.create('div', 'info legend');
        legendBox.innerHTML = '<h4>Magnitude Range</h4>' + generateLegendHTML(MAGNITUDE_LEVELS);  // Using MAGNITUDE_LEVELS directly
        return legendBox;
    };

    mapLegend.addTo(mapInstance);
}

// Constant to define magnitude ranges and corresponding colors
const MAGNITUDE_LEVELS = [
    { color: '#00bcd4', range: '0-1' },    // Cyan (low severity)
    { color: '#8bc34a', range: '1-2' },    // Green (slightly stronger)
    { color: '#ffeb3b', range: '2-3' },    // Yellow (mid-range magnitude)
    { color: '#ff9800', range: '3-4' },    // Orange (higher magnitude)
    { color: '#f44336', range: '4+' }      // Red (dangerous, highest magnitude)
];

// Function to determine the marker color based on magnitude
function pickColorByMagnitude(magValue) {
    if (magValue < 1) return MAGNITUDE_LEVELS[0].color;
    if (magValue < 2) return MAGNITUDE_LEVELS[1].color;
    if (magValue < 3) return MAGNITUDE_LEVELS[2].color;
    if (magValue < 4) return MAGNITUDE_LEVELS[3].color;
    return MAGNITUDE_LEVELS[4].color;
}

// Function to create markers for each earthquake event
function constructEarthquakeMarkers(quakeFeatures) {
    return quakeFeatures.map(feature => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;
        const markerRadius = magnitude * MARKER_SCALE_FACTOR;

        return L.circleMarker([latitude, longitude], {
            radius: markerRadius,
            color: pickColorByMagnitude(magnitude),
            fillOpacity: 0.5,
            weight: 1
        }).bindPopup(`<h3>${feature.properties.place}</h3><p>Magnitude: ${magnitude}</p>`);
    });
}

// Main function to initialize the map and handle earthquake data
function setupEarthquakeMap(geoData) {
    const quakeMarkers = constructEarthquakeMarkers(geoData.features);
    const earthquakeLayer = L.layerGroup(quakeMarkers);
    
    const baseLayer = buildTileLayer();
    const mapInstance = createMapView([39.7417, -105.0707], 4.5, [baseLayer, earthquakeLayer]);
    
    applyLayerControl(mapInstance, { "Base Layer": baseLayer }, { "Earthquake Layer": earthquakeLayer });
    attachLegendToMap(mapInstance);

    // Handle map resizing to ensure it fits the container
    window.addEventListener('resize', () => {
        mapInstance.invalidateSize();
    });
}

// Fetch earthquake data and pass it to the main setup function with error handling
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(setupEarthquakeMap)
    .catch(error => {
        console.error("Error fetching earthquake data:", error);
        alert("Could not load earthquake data.");
    });
