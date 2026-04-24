import { data } from './saveburnet.js';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Detect if the device is mobile based on screen width
const isMobile = window.innerWidth <= 768; 
const markerScale = isMobile ? 1.5 : 0.5; // Larger icons for mobile fingers

const overlay = new ol.Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

const titleOverlay = new ol.Overlay({
    element: document.getElementById('title'),
    positioning: 'top-center',
    visible: true
    // Set a coordinate or leave undefined to position via CSS
});


const pinStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 1], // Anchor point (bottom center)
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'img/pin.png', 
        scale: markerScale                  
    })
});

const viewextent = [-180, -85, 180, 85];
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
    title: "Save Burnet County Affected Addresses",
    view: new ol.View({ center: [-10943627.55904307, 3595051.022827225], zoom: 12 })
});

map.addOverlay(overlay);
map.addOverlay(titleOverlay);

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
    
    if (feature) {
        const name = feature.get('address'); 
        const coords = feature.get('coords');
        const coordinates = feature.getGeometry().getCoordinates();
        content.innerHTML = `<pre><code>` +
                            `<div class='popup-box'>` +
                                `<div class='popup-title'>` +
                                    `Save Burnet Affected Address\n` +
                                `</div>\n` +
                                    `NOTE: Location may be that of the\n` +
                                    `registered property owner as listed\n`+
                                    `in Burnet County public records.\n\n` +
                                    `To request a marker be removed, send\n` + 
                                    `an email to <a href="n129bz:name@outlook.com">n129bz@outlook.com</a> with\n` +
                                    `the address as shown in this record.\n` +
                                `</div>\n\n` +
                                `<div class="lonlatbox">${name}\nLon/Lat: ${coords}` +
                            `</div>\n` +
                            `</code></pre>`;
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
            const lon = parseFloat(item.lon).toFixed(5);
            const lat = parseFloat(item.lat).toFixed(5);

            // Create address feature
            const addressFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
                address: item.address,
                coords: `[${lon},${lat}]`
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