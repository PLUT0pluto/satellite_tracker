import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../../style/tailwind.css';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import actuallyMakeMarker from './map-markers.js';
import { global } from '../global-var.js';
import { globalMap } from './map-global-var.js'


//MAP SETUP
export const initMap = () => {

    //create map
    globalMap.map = new L.map("map", {
        center: [51.505, -0.09], //london
        zoom: 5
    });
    //basic tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(globalMap.map);

    globalMap.geoJsonLayer = L.geoJSON(null).addTo(globalMap.map); //for drawing satellite ground tracks
    globalMap.geoJsonLayer2 = L.geoJSON(null, {
        pane: 'overlayPane',
        style: {
            zIndex: 1000,
            weight: 55,
            opacity: 0,
            color: 'red'
        }
    }).addTo(globalMap.map); //for wider detect area of when mouse over geojsonlayer
    globalMap.markLayer = L.markerClusterGroup(); //marker cluster layer
    globalMap.geoJsonPopup = L.popup({closeButton: false}); //popup for showing time of when satellite was at point
    globalMap.map.addLayer(globalMap.markLayer);
}


//function to add new markers to map
export const newMarkers = (satList)=> {
    //clear existing markers
    globalMap.markLayer.clearLayers();
    global.all_markers.clear();

    //add new markers
    for(const [key, val] of satList){
        actuallyMakeMarker(key);
    }

    //update satellite counter
    const sCount = document.getElementById("satCount");
    sCount.innerText = "Satellites on map: " + globalMap.markLayer.getLayers().length;
}

