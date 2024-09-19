// Initialize the map, centered on London, UK
var map = L.map('map').setView([51.5074, -0.1278], 13);  // Latitude and Longitude of Central London

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize an empty array to store McDonald's locations
var mcdonaldsLocations = [];

// Fetch the GeoJSON file and add it to the map
fetch('mcdonalds-london.geojson')
  .then(response => response.json())  // Parse the GeoJSON file
  .then(data => {
    // Extract coordinates from GeoJSON and store them in mcdonaldsLocations array
    data.features.forEach(function(feature) {
        var lat = feature.geometry.coordinates[1];
        var lng = feature.geometry.coordinates[0];

        // Push lat/lng to mcdonaldsLocations array
        mcdonaldsLocations.push([lng, lat]);  // Format [lng, lat] for D3-Delaunay

        // Add markers for each McDonald's location
        L.marker([lat, lng]).addTo(map);
    });

    // Create the Voronoi diagram once all locations are loaded
    createVoronoiDiagram();
  })
  .catch(error => console.error('Error loading the GeoJSON file:', error));

// Function to create Voronoi diagram dynamically based on current map view
function createVoronoiDiagram() {
    // Clear any existing Voronoi layers
    if (map.voronoiLayer) {
        map.removeLayer(map.voronoiLayer);
    }

    // Get the current map size
    var size = map.getSize();

    // Recalculate pixel positions for each McDonald's location based on the current map view
    var points = mcdonaldsLocations.map(function(loc) {
        var point = map.latLngToContainerPoint([loc[1], loc[0]]);  // Convert [lat, lng] to container space
        return [point.x, point.y];  // Return pixel coordinates relative to the current map container
    });

    // Create Delaunay triangulation and Voronoi diagram from the recalculated points
    var delaunay = d3.Delaunay.from(points);
    var voronoi = delaunay.voronoi([0, 0, size.x, size.y]);  // Use map container size to define bounds

    // Create a new layer group to hold the Voronoi cells
    var voronoiLayer = L.layerGroup();

    // Loop through all the Voronoi polygons
    points.forEach(function(point, i) {
        var cell = voronoi.cellPolygon(i);
        if (cell) {
            // Convert container pixel coordinates back to lat/lng using map.containerPointToLatLng
            var latlngs = cell.map(function(p) {
                var latLng = map.containerPointToLatLng([p[0], p[1]]);  // Convert [x, y] to [lat, lng]
                return [latLng.lat, latLng.lng];
            });

            // Add the Voronoi polygon to the layer group
            L.polygon(latlngs, { color: 'blue', weight: 1 }).addTo(voronoiLayer);
        }
    });

    // Add the full Voronoi diagram layer to the map
    voronoiLayer.addTo(map);
    map.voronoiLayer = voronoiLayer;
}

// Re-create the Voronoi diagram when the map is zoomed or panned
map.on('zoomend', createVoronoiDiagram);
map.on('moveend', function() {
    createVoronoiDiagram();  // Ensure the Voronoi diagram is recalculated after panning
});
