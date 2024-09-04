// Initialize the map and tile layer
function createMap(earthquakeLayer) {
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const map = L.map("map", {
        center: [39.7417, -105.0707],
        zoom: 4.5,
        layers: [tileLayer, earthquakeLayer]
    });

    // Layer Control
    L.control.layers({
        "Earthquakes": earthquakeLayer
    }, {}, {
        collapsed: false
    }).addTo(map);

    // Legend Control
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        const magnitudeLevels = [
            { color: '#81de87', range: '0-1' },
            { color: '#6b872c', range: '1-2' },
            { color: '#e7b416', range: '2-3' },
            { color: '#af6222', range: '3-4' },
            { color: '#661919', range: '4+' }
        ];
        div.innerHTML = '<h4>Magnitude</h4>';
        magnitudeLevels.forEach(level => {
            div.innerHTML += `<ul style="background: ${level.color}"><span>${level.range}</span><br>`;
        });
        return div;
    };
    legend.addTo(map);
}

// Create markers for each earthquake
function createMarkers(response) {
    const features = response.features;
    const earthquakeMarkers = features.map(quake => {
        const [longitude, latitude] = quake.geometry.coordinates;
        const magnitude = quake.properties.mag;
        const radius = magnitude * 4.5;

        return L.circleMarker([latitude, longitude], {
            radius: radius,
            color: getMagnitudeColor(magnitude),
            opacity: 0.5,
            weight: 1
        }).bindPopup(`<h3>${quake.properties.place}</h3><br>Magnitude: ${magnitude}`);
    });

    // Add earthquake markers to the map
    createMap(L.layerGroup(earthquakeMarkers));
}

// Function to determine marker color based on magnitude
function getMagnitudeColor(magnitude) {
    if (magnitude < 1) return '#81de87';
    if (magnitude < 2) return '#6b872c';
    if (magnitude < 3) return '#e7b416';
    if (magnitude < 4) return '#af6222';
    return '#661919';
}

// Fetch earthquake data and create markers
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
