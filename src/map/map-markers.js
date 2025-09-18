import { getLatLngObj } from "tle.js";
import { getGroundTracks } from "tle.js";
import { getLastAntemeridianCrossingTimeMS } from "tle.js";
import L, { geoJson } from 'leaflet';
import RBush from 'rbush';
import knn from 'rbush-knn';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../../misc/tailwind_file.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import { global } from "../global-var.js";
import { globalMap } from './map-global-var.js'


var mouseOnPopup = false; //to prevent popup close when hovering over it
var popupBug = 0; //for some reason popupclose triggers along side popup open when trying to open it
var mouseInLayer = false; //to track if mouse is in geojson layer


//MAKE A NEW MARKER
export default function actuallyMakeMarker(key) {
    if (global.int_tle.get(key) != undefined) {
        const lenlan = getLatLngObj(global.int_tle.get(key), Date.now()); //get coordinates of satellite
        if (!isNaN(lenlan["lng"]) && !isNaN(lenlan["lat"])) { //getLatLngObj returns NaN if tle is bad
            const uid = L.marker([lenlan["lat"], lenlan["lng"]]); //create marker
            globalMap.markLayer.addLayer(uid);
            global.all_markers.set(key, uid);
            global.all_markers.set(uid, key);

            //POPUP HANDLERS
            uid.bindPopup(key, {autoClose: false, closeOnClick: false});
            uid.on("popupopen", function (e) {
                if (popupBug == 0) {
                    globalMap.markLayer.removeLayer(this);
                    globalMap.map.addLayer(this);
                    global.markerHighlighted.push(this);
                    this._icon.classList.add("markHighlight");

                    //creating ground tracks
                    const curTime = Date.now();
                    const stepTime = 1000;
                    getGroundTracks({
                        tle: global.int_tle.get(key),
                        startTimeMS: curTime,
                        stepMS: stepTime,
                        isLngLatFormat: true,
                    }).then(function (threeOrbitsArr) {
                        if (threeOrbitsArr.length < 2) return; //orbits couldnt get calculated
                        let oInd = 1; //index current orbit

                        //make time points
                        let curStepTime = getLastAntemeridianCrossingTimeMS(global.int_tle.get(key), curTime);
                        let nTree = new RBush();
                        let nTime = new Map();
                        threeOrbitsArr[oInd].forEach((item) => {
                            nTime.set(`${item[0]},${item[1]}`, new Date(curStepTime).toString());
                            nTree.insert({
                                minX: item[0],
                                minY: item[1],
                                maxX: item[0],
                                maxY: item[1]
                            });
                            curStepTime += stepTime;
                        });
                        globalMap.geoJsonRTree.set(uid, nTree);
                        globalMap.geoJsonTime.set(uid, nTime);

                        //add geojson to map
                        let geoJsonData = {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': threeOrbitsArr[oInd]
                            }
                        };

                        const lay1 = L.geoJSON(geoJsonData);
                        const lay2 = L.geoJSON(geoJsonData, { //layer for mouse detection
                            style: {
                                opacity: 0,
                                color: 'red',
                                weight: 55
                            }
                        });
                        globalMap.geoJsonLayer.addLayer(lay1);
                        globalMap.geoJsonLayer2.addLayer(lay2);
                        globalMap.geoJsonLayerMap.set(uid, [lay1, lay2]);

                        //add debounce utility
                        let popupTimeout;

                        globalMap.geoJsonLayer2.on("mouseover", function (e) {
                            mouseInLayer = true;

                            //clear any existing timeouts
                            clearTimeout(popupTimeout);
                            if (globalMap.geoJsonInterval) clearInterval(globalMap.geoJsonInterval);
                            if (globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();

                            try {
                                const point = closestPoint(e.latlng.lng, e.latlng.lat);
                                const clPoint = point[0];
                                const clSat = point[1];
                                if (!clPoint) return;

                                const xx = clPoint.maxX;
                                const yy = clPoint.maxY;

                                //single update instead of interval
                                globalMap.geoJsonPopup
                                    .setLatLng([yy, xx])
                                    .setContent("Time: " + globalMap.geoJsonTime.get(clSat).get(`${xx},${yy}`))
                                    .openOn(globalMap.map);
                                globalMap.geoJsonCircle = L.circleMarker([yy, xx], {
                                    radius: 5,
                                    color: '#ff4444'
                                }).addTo(globalMap.map);

                                jsonPopUpEvents();
                            } catch (err) {
                                console.error('Error updating popup:', err);
                            }
                            globalMap.geoJsonLayer2.bringToFront(); //if not at top detection wont work in intersections
                        });

                        globalMap.geoJsonLayer2.on("mousemove", function (e) {
                            if (!mouseInLayer) return;

                            //remove debounce for direct updates
                            const point = closestPoint(e.latlng.lng, e.latlng.lat);
                            const clPoint = point[0];
                            const clSat = point[1];  //actually id of marker
                            if (!clPoint) return;

                            const xx = clPoint.maxX;
                            const yy = clPoint.maxY;

                            // Update immediately
                            globalMap.geoJsonPopup
                                .setLatLng([yy, xx])
                                .setContent("Time: " + globalMap.geoJsonTime.get(clSat).get(`${xx},${yy}`));
                            globalMap.geoJsonCircle.setLatLng([yy, xx]);
                            jsonPopUpEvents();
                        });

                        globalMap.geoJsonLayer2.on("mouseout", function (e) {
                            mouseInLayer = false;
                            if (mouseOnPopup) return;
                            clearTimeout(popupTimeout);

                            //small delay before removing elements
                            setTimeout(() => {
                                if (!mouseInLayer && !mouseOnPopup) {
                                    if (globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();
                                    if (globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
                                }
                            }, 100);
                        });
                    });


                    //BUG STUFF
                    popupBug = 1;
                    setTimeout(() => {
                        if (!uid.getPopup().isOpen()) uid.openPopup();
                        popupBug = 0;
                    }, 10);
                }
            });

            uid.on("popupclose", function (e) {
                if (this._icon && popupBug == 0) {
                    //just clear everything for this marker
                    this._icon.classList.remove("markHighlight");
                    globalMap.map.removeLayer(this);
                    if (globalMap.geoJsonLayerMap.get(this)) {
                        globalMap.geoJsonLayer.removeLayer(globalMap.geoJsonLayerMap.get(this)[0]);
                        globalMap.geoJsonLayer2.removeLayer(globalMap.geoJsonLayerMap.get(this)[1]);
                        globalMap.geoJsonRTree.delete(this);
                        globalMap.geoJsonTime.delete(this);
                        globalMap.geoJsonLayerMap.delete(this);
                    }
                    if (globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
                    if (globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();

                    globalMap.markLayer.addLayer(this);
                    const inde = global.markerHighlighted.indexOf(this);
                    if (inde !== -1) global.markerHighlighted.splice(inde, 1);
                }
            });
        }
    } else {
        // Add class "redColor" to row that contains the key
        const row = $('#satTable').find('td').filter(function () {
            return $(this).text() === key;
        }).closest('tr');
        row.addClass('redColor');
        global.all_markers.set(key, "idk2");
        global.all_markers.set(key + "idk", "idk2");
    }
}

function jsonPopUpEvents(){ //add new event listeners to popup
    let popUpEl = globalMap.geoJsonPopup.getElement();
    popUpEl.removeEventListener("mouseover", jsonPopUpOver);
    popUpEl.removeEventListener("mouseout", jsonPopUpOut);
    popUpEl.addEventListener("mouseover", jsonPopUpOver);
    popUpEl.addEventListener("mouseout", (e) => {
        //check if mouse moved to a child element
        if (!e.relatedTarget || !popUpEl.contains(e.relatedTarget)) {
            jsonPopUpOut();
        }
    });
}
function jsonPopUpOver(){ //mouse over popup
    mouseOnPopup = true;
}
function jsonPopUpOut(){ //mouse out of popup
    mouseOnPopup = false;
    if(!mouseInLayer) {
        if(globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();
        if(globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
    }
}


//find closest point in all rtrees to mouse
function closestPoint(lng, lat){
    let curClosest = 100000000000000;
    let curClosestPoint;
    let curSat;
    for(const [key, tree] of globalMap.geoJsonRTree){
        const clPoint = knn(tree, lng, lat, 1)[0];
        const dist = Math.sqrt((clPoint.maxX - lng)**2 + (clPoint.maxY - lat)**2)
        if(dist < curClosest){
            curClosest = dist;
            curClosestPoint = clPoint;
            curSat = key;
        }
    }
    return [curClosestPoint, curSat];
}