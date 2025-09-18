//VARIABLES ONLY USED IN map FOLDER FILES
export const globalMap = {
    map: null, //main map object
    geoJsonLayer: null, //layer for ground track
    geoJsonLayer2: null, //wider detect when mouse hivering over geojsonlayer
    markLayer: null, //layer with markers
    geoJsonInterval: null, //interval for updating where mouse is on ground track  (not used)
    geoJsonPopup: null, //popup for ground track

    geoJsonLayerMap: new Map(), //map of satellite marker to its two ground track layers
    geoJsonTime: new Map(), //map of satellite marker to its last updated time (for ground track)
    geoJsonRTree: new Map(), //map of satellite marker to its RTree (for ground track)
    geoJsonCircle: false //circle icon on ground track
};