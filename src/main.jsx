import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import '../misc/tailwind_file.css';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import {DynamicFilter} from './components/filter.tsx';
import {DynamicSelect} from './components/select.tsx';
import {DynamicInput} from './components/input.tsx';
import {getInfo} from "./fetch-info.js";
import {makeSatTable} from "./components/data-table.js";
import {global} from "./global-var.js";
import { initMap } from "./map/map.js";
import { FilteredSats, resetAll, updateFilterMap, inputSugg } from "./filter-utils.js";

//MAP SETUP
initMap();


//DOM SETUP 
function MainPage() {

    //state to hold selected filters
    const[selectedFilters, setSelectedFilters] = useState(() =>{
        let tempList = global.infoNameList.filter((item) => item !== "--none--");
        let tempMap = new Map();
        tempList.forEach((item) => {tempMap.set(item, [])})
        return tempMap;
    });

    //call the hook to get data, loading status, and any errors
    const { loading, error } = getInfo();

    useEffect(() => {
        if (!loading) {
            makeSatTable() //create dataTable after data is loaded
        }
    }, [loading]); //run when loading changes


    //render loading or error states
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }



    //function to change selected filters when user interacts with filter components
    const changeFilter = updateFilterMap(setSelectedFilters);

    //sidebar layout
    return (
        <div id = "sideBar">
                <div id = "buttonCont">
                    <button id = "searchButton"
                            className ="buttonClass borderCont"
                            onClick = {() => FilteredSats(selectedFilters, setSelectedFilters)}>
                        SEARCH</button>
                    <button id = "resetAllButton" className ="buttonClass borderCont"  onClick = {resetAll}>CLEAR MARKERS</button>
                </div>
                <div id = "filtersCont" className = "">
                    <DynamicFilter fName = "NAME" fDetails = {() => 
                        <DynamicInput fName = "NAME" 
                        placeholder = "ISS (Zarya)"
                        onInputChange = {(value) => inputSugg(value, "SATNAME")}
                        onSugClick = {changeFilter}/>
                    }/>
                    <DynamicFilter fName = "COUNTRY" fDetails = {() => 
                        <DynamicSelect label = "COUNTRY" 
                        items = {Array.from(global.csv_mp.keys())}
                        startValue = "--none--" 
                        onValueChange = {changeFilter}/>
                    }/>
                    <DynamicFilter fName = "LAUNCH SITE" fDetails = {() => 
                        <DynamicSelect label = "LAUNCH SITE" 
                        items = {Array.from(global.LaunchSite.keys())}
                        startValue = "--none--" 
                        onValueChange = {changeFilter}/>
                    }/>
                    <DynamicFilter fName = "OBJECT TYPE" fDetails = {() => 
                        <DynamicSelect label = "OBJECT TYPE" 
                        items = {global.objTypeAr}
                        startValue = "--none--"
                        onValueChange = {changeFilter}/>
                    }/>
                    <DynamicFilter fName = "LAUNCH YEAR" fDetails = {() => 
                        <DynamicSelect label = "LAUNCH YEAR" 
                        items = {Array.from({ length: new Date().getFullYear() - 1958 + 1 }, (_, i) => 1958 + i)} 
                        startValue = "--none--" 
                        onValueChange = {changeFilter}/>
                    }/>
                    </div>
                
        </div>
    );
}

const container = document.getElementById('rightCont');
const root = ReactDOM.createRoot(container);
root.render(<MainPage />);





