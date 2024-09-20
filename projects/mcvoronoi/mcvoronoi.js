// Initialize the map, default to London
var map = L.map('map').setView([51.5074, -0.1278], 13);  // Latitude and Longitude of London

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize variables to hold McDonald's locations, the selected city, and the marker group
var mcdonaldsLocations = [];
var selectedCity = 'london';
var markerLayerGroup = L.layerGroup().addTo(map);  // Create an empty layer group for markers

// Function to load data for a selected city
function loadCityData(city) {
    // Define city coordinates and corresponding GeoJSON files
    var cityCoords = {
        london: [51.5074, -0.1278],
        sydney: [-33.8688, 151.2093],
        newyork: [40.7128, -74.0060],
        paris: [48.8566, 2.3522],
        australia: [-25.2744, 133.7751],
        wollongong: [-34.424, 150.893]
    };

    var geojsonFiles = {
        london: 'data/mcdonalds-london.geojson',
        sydney: 'data/mcdonalds-sydney.geojson',
        newyork: 'data/mcdonalds-newyork.geojson',
        paris: 'data/mcdonalds-paris.geojson',
        australia: 'data/mcdonalds-australia.geojson',  // Use the file for all McDonald's in Australia
        wollongong: 'data/mcdonalds-wollongong.geojson'
    };

    // Clear previous data (markers and Voronoi)
    markerLayerGroup.clearLayers();  // Remove all previous markers
    if (map.voronoiLayer) {
        map.removeLayer(map.voronoiLayer);  // Remove the Voronoi layer if it exists
    }

    map.setView(cityCoords[city], city === 'australia' ? 4 : 13);  // Zoom level based on city or whole Australia

    // Fetch the appropriate GeoJSON data based on the selected city
    fetch(geojsonFiles[city])
      .then(response => response.json())  // Parse the GeoJSON file
      .then(data => {
        mcdonaldsLocations = [];  // Reset the locations array

        // Extract coordinates from GeoJSON and store them in mcdonaldsLocations array
        data.features.forEach(function(feature) {
            var lat = feature.geometry.coordinates[1];
            var lng = feature.geometry.coordinates[0];
            mcdonaldsLocations.push([lng, lat]);  // Format [lng, lat] for D3-Delaunay

            // Add a marker to the marker layer group
            var marker = L.marker([lat, lng]);
            markerLayerGroup.addLayer(marker);  // Add the marker to the group
        });

        // Create the Voronoi diagram
        createVoronoiDiagram();
      })
      .catch(error => console.error('Error loading the GeoJSON file:', error));
}

// Function to create Voronoi diagram dynamically based on current map view
function createVoronoiDiagram() {
    // Clear any existing Voronoi layers
    if (map.voronoiLayer) {
        map.removeLayer(map.voronoiLayer);
    }

    // Recalculate pixel positions for each McDonald's location based on the current map view
    var points = mcdonaldsLocations.map(function(loc) {
        var point = map.latLngToContainerPoint([loc[1], loc[0]]);
        return [point.x, point.y];
    });

    var size = map.getSize();
    var delaunay = d3.Delaunay.from(points);
    var voronoi = delaunay.voronoi([0, 0, size.x, size.y]);

    var voronoiLayer = L.layerGroup();
    points.forEach(function(point, i) {
        var cell = voronoi.cellPolygon(i);
        if (cell) {
            var latlngs = cell.map(function(p) {
                var latLng = map.containerPointToLatLng([p[0], p[1]]);
                return [latLng.lat, latLng.lng];
            });
            L.polygon(latlngs, { color: 'blue', weight: 1 }).addTo(voronoiLayer);
        }
    });

    voronoiLayer.addTo(map);
    map.voronoiLayer = voronoiLayer;
}

// Re-create the Voronoi diagram when the map is zoomed or panned
map.on('zoomend', createVoronoiDiagram);
map.on('moveend', createVoronoiDiagram);

// Event listener for the radio buttons
document.querySelectorAll('input[name="city"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        selectedCity = this.value;
        loadCityData(selectedCity);  // Load data based on the selected city
    });
});

// Load the default city (London) on page load
loadCityData('london');
