import { newMarkers } from './map/map.ts'
import { global } from './global-var.js'
import { globalMap } from './map/map-global-var.js'
import $ from 'jquery';

//functions for filter state changes

//dynamicInput component uses this to get suggestions for input box
export const inputSugg = (inputVal, nameOrDes) => {
    if(inputVal.length < 3) {  //too many results if less than 3 chars
        return [];
    }

    //can also enable searching by other designations (dataTable already has that) so this is just basic
    const indList = [global.satcat_csv.get("INTLDES").indexOf("SATNAME")];
    let suglist = [];
    let impInd;
    if(nameOrDes == "SATNAME") impInd = 3;
    else impInd = 0;

    for(const [key, val] of global.satcat_csv) {
        for(const ind of indList){
            if(val[ind].includes(inputVal.toUpperCase()) && !suglist.includes(val[impInd])){
                suglist.push(val[impInd]);
                break;
            }
        }
    }
    return suglist;
}

//triggers when user presses search button
export const FilteredSats = (selectedFilters, setSelectedFilters) => {
    let curSats = new Map(global.satcat_csv); //current satellites that match selected filters
    let allFilts = 0; //count if all filters are empty so dont show any sats
    selectedFilters.forEach((value, key) => {
        if(value.length!==0){
            let tempSet = new Set();
            switch(key){ //map to correct names for country and launch site
                case "COUNTRY":
                    value.forEach((item) => tempSet.add(global.csv_mp.get(item)));
                    break;
                case "LAUNCH SITE":
                    value.forEach((item) => tempSet.add(global.LaunchSite.get(item)));
                    break;
                default:
                    tempSet = new Set(value);
                    break;
            }

            const key2 = global.infoNameMap[key];
            let ind = global.satcat_csv.get("INTLDES").indexOf(key2);
            for(const [sat, val] of curSats){
                if(!tempSet.has(val[ind])) curSats.delete(sat);
            }
            //update checkboxes in table to match found sats
            $('input[type="checkbox"]', '#satTable tbody').each(function() {
                const rowData = $(this).closest('tr').find('td').eq(ind+1).text();
                $(this).prop('checked', tempSet.has(rowData));
            });
        }
        else allFilts += 1;
    });
    //only update markers if some filter is selected
    if(allFilts !== selectedFilters.size) newMarkers(curSats);

    //reset name filter input box
    setSelectedFilters((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set("NAME", []);
        return newMap;
    });

    //have to redraw table to update checkboxes
    $('#satTable').DataTable().rows().invalidate().draw();
}

//called when user selects or deselects a filter option
export const updateFilterMap = (setSelectedFilters) => (fName, val, add) => {
    setSelectedFilters((prevMap) => {
        const newMap = new Map(prevMap);
        if(add == 1) {
            newMap.get(fName).push(val);
            return newMap;
        }
        else {
            const ind = newMap.get(fName).indexOf(val);
            newMap.get(fName).splice(ind, 1);
            return newMap;
        }
    });
};


//clears the map of all markers and resets the checkboxes
export const resetAll = () => {
    //just clear all the layers
    for(let satMark of global.markerHighlighted){
        globalMap.map.removeLayer(satMark);
        if(globalMap.geoJsonLayerMap.get(satMark)) {
            globalMap.geoJsonLayer.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[0]);
            globalMap.geoJsonLayer2.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[1]);
            globalMap.geoJsonRTree.delete(satMark);
            globalMap.geoJsonTime.delete(satMark);
            globalMap.geoJsonLayerMap.delete(satMark);
        }
        if(globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
        if(globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();
    }
    global.markerHighlighted = [];
    global.all_markers.clear();
    globalMap.markLayer.clearLayers();

    $('#satCount').text("Satellites on map: " + "0");
    $('#satTable').DataTable().rows().invalidate().draw(); //redraw table to uncheck all boxes
}