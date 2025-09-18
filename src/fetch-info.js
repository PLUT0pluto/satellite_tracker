import {global} from "./global-var.js"
import { useState, useEffect } from 'react';
import { parse } from 'papaparse';
import { getCOSPAR } from 'tle.js';


//reads files with data and stores in global variables
const getInfo = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const getData = async () => {
            try {

                //fetch 3le_full.txt and SATCAT_full.csv in parallel
                const fetch1 = fetch("../satellite_data/3le_full.txt").then(response => response.text()).then(text => {
                    let lines_ar = [...text.match(/.+/gm)];
                    for (var i = 0; i < lines_ar.length; i += 3) {
                        if (lines_ar[i] == "0 TBA - TO BE ASSIGNED") break;
                        const temp_str = lines_ar[i] + "\n" + lines_ar[i + 1] + "\n" + lines_ar[i + 2];
                        global.int_tle.set(getCOSPAR(temp_str), temp_str);
                    }
                });

                const fetch2 = fetch("../satellite_data/SATCAT_full.csv").then(resp => resp.text()).then(text => {
                    parse(text, {
                        complete: results => {
                            for (let i = 0; i < results["data"].length; i += 1) global.satcat_csv.set(results["data"][i][0], results["data"][i]);
                            getObjectType(); //can now get object types
                           // makeSatTable(); //moved to main.jsx
                        }
                    });
                })


                //MAKE MAPS FOR FILTER SELECT ELEMENTS
                //get all object types from satcat.csv
                function getObjectType() {  //has tp wait for satcat.csv fetch
                    let objInd;
                    for (const [key, value] of global.satcat_csv) {
                        if (key == "INTLDES") objInd = value.indexOf("OBJECT_TYPE");
                        else if (!global.objTypeAr.includes(value[objInd])) global.objTypeAr.push(value[objInd]);
                    }
                }

                //SATCAT uses country codes so get full names for different csv
                const fetch3 = fetch("../satellite_data/satcat.csv").then(response => response.text()).then(
                    text => {
                        let temp_ar = text.split(/,|\n/);
                        for (let i = 0; i < temp_ar.length - 1; i += 3) {
                            global.csv_mp.set(temp_ar[i + 1].trim(), temp_ar[i].trim());
                        }
                    }
                );

                //same for launch sites as for country of origin
                const fetch4 = fetch("../satellite_data/launch_sites.csv").then(response => response.text()).then(
                    text => {
                        let temp_ar = text.split(/,"|"\r\n/);
                        for (let i = 0; i < temp_ar.length - 1; i += 2){
                            global.LaunchSite.set(temp_ar[i + 1].trim(), temp_ar[i].trim());
                        }
                    }
                );

                await Promise.all([fetch1, fetch2, fetch3, fetch4]);
                if (mounted) {
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    console.error('Failed to fetch data:', err);
                    setError(err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        getData();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [])

    return{ loading, error };
}

export { getInfo };