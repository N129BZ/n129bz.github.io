import { data } from './saveburnet.js';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new ol.Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

const pinStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 1], // Anchor point (bottom center)
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'img/pin.png', 
        scale: 0.5                  
    })
});

const viewextent = [-180, -85, 180, 85];
const viewposition = ol.proj.fromLonLat([-10943627.55904307, 3595051.022827225]);
const extent = ol.proj.transformExtent(viewextent, 'EPSG:4326', 'EPSG:3857')

const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
    title: "Affected Addresses",
    source: vectorSource,
    visible: true,
    extent: extent, 
    zIndex: 14
});

// Initialize the Map
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({ source: new ol.source.OSM()}),
        vectorLayer
    ],
    view: new ol.View({ center: [-10943627.55904307, 3595051.022827225], zoom: 12 })
});

map.addOverlay(overlay);

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
    
    if (feature) {
        const name = feature.get('name'); 
        const coordinates = feature.getGeometry().getCoordinates();
        content.innerHTML = `<code>${name}</code>`;
        overlay.setPosition(coordinates);
    } 
    else {
        overlay.setPosition(undefined);
    }
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

/**
 * Add markers to map
 */
function addMarkers() {
    for (const item of data) {
        try {
            const lon = parseFloat(item.lon);
            const lat = parseFloat(item.lat);

            // Create address feature
            const addressFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
                name: item.address,
            });

            addressFeature.setStyle(pinStyle);
            vectorSource.addFeature(addressFeature); 
        } 
        catch (error) {
            console.error("Geocoding failed for:", item.address, error);
        }
    }
}

addMarkers();