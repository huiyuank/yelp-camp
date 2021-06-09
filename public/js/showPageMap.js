mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID in show page
  style: "mapbox://styles/mapbox/outdoors-v11", // style URL
  center: campground.geometry.coordinates, // starting position [lon, lat], eg [-74.5, 40]
  zoom: 10, // starting zoom
});

const popupMarker = new mapboxgl.Popup({ offset: 25 })
  .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`)
  .setMaxWidth("300px");

// Create a Marker at campground location and add it to the map.
const locateMarker = new mapboxgl.Marker({ color: "grey" })
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popupMarker)
  .addTo(map);

const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');
 
function switchLayer(layer) {
  const layerId = layer.target.id;
  map.setStyle('mapbox://styles/mapbox/' + layerId);
}
 
for (let i = 0; i < inputs.length; i++) {
  inputs[i].onclick = switchLayer;
}

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
