
// API variable
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


let earthquakes = new L.LayerGroup();


// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })


let  topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }); 

// Define basemaps object to hold layers
let baseMaps = {
    "Street Map":street,
    "Topographic Map": topo,
    
};

// Create overlay object
let overlayMaps = {
    "Earthquakes": earthquakes,
    
  }
  

  // Create a map, give it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 6,
    layers: [street,topo ]
  });


// Retrieve earthquakesURL

d3.json(url).then(function(earthquakeData){

    // Determine size of marker based on mgnitude of earthquakes
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 5;
    }

    // Determine color of marker
    function chooseColor(depth) {
                
        if (depth > 90)
            return "#ea2c2c";
        else if (depth > 70)
            return "#ea822c";
        else if (depth > 50)
            return "#ee9c00";
        else if (depth > 30)
            return "#eecc00";
        else if (depth > 10)
            return  "#d4ee00";
        else
            return "#98ee00";   
    }
    function popupText(feature) {
        let place = feature.properties.place;
        let mag = feature.properties.mag;
        let time = Date(feature.properties.time).toLocaleString();
        return `<p>This earthquake occurred on ${time}, ${place}, with magnitude of ${mag}.</p>`;
      };
      
    // Determine style of marker
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 1.6
        };
    }

    L.geoJson(earthquakeData,{
        pointToLayer:function(feature,latlang){
            return L.circleMarker(latlang)
            .bindPopup(popupText(feature));
        },
        style:styleInfo,
    
    }).addTo(earthquakes);

    // Set the legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"), 
        depthLevels = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3>Depth</h3>"

        for (var i = 0; i < depthLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(depthLevels[i] + 1) + '"></i> ' +
                depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add th legend to map
    legend.addTo(myMap);
});

earthquakes.addTo(myMap)  


L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

