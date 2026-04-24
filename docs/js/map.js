import { data } from './saveburnet.js';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Detect if the device is mobile based on screen width
const isMobile = window.innerWidth <= 768; 
const markerScale = isMobile ? 2.0 : 0.5; // Larger icons for mobile fingers

document.addEventListener('click', function (event) {
    // Check if the clicked element is the email link
    if (event.target.matches('.email-word')) {
        const divText = document.getElementById("lon-lat-box").textContent;
        const email = "n129bz@outlook.com";
        const subject = "Request Save Burnet Map Address Removal";
        const body = `Please remove the following address from the Save Burnet map:\n\n` + divText;
        window.location.href = `mailto: ${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.body.classList.remove('waiting');
    }
});


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
const scaleLine = new ol.control.ScaleLine({
    units: 'imperial',
    bar: true,
    steps: 4,
    minWidth: 140
});
const maptilelayer = new ol.source.OSM({
    attributions: [
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          'Map by Brian A. Manlove <a href="https://github.com/n129bz">https://github.com/n129bz</a>' // Add your line here
        ].join('<br>'), 
});
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({ 
            source: maptilelayer,
            
        }),
        vectorLayer
    ],
    title: "Save Burnet County Affected Addresses",
    view: new ol.View({ center: [-10943627.55904307, 3595051.022827225], zoom: 12 }),
    controls: ol.control.defaults().extend([scaleLine]),
    overlays: [titleOverlay, overlay]
});

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
                                    `in Burnet County public records, and\n` +
                                    `not the physical property location.\n\n` +
                                    `To request a marker be removed from this\n` +  
                                    `map click the email link below:\n\n<div class="email-word" id="email-word">n129bz@outlook.com</div>\n` +
                                `</div>\n\n` +
                                `<div class="lon-lat-box" id="lon-lat-box">${name}\nLon/Lat: ${coords}</div>\n` +
                            `</code></pre>\n`;
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