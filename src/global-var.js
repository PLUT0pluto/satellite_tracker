export const global = {

    infoNameList: [
        "--none--", "NAME", "INT. DESIGNATION", "OBJECT TYPE",
        "COUNTRY", "LAUNCH YEAR", "LAUNCH SITE", "NORAD ID"
    ], //list of filter names for select elements
    infoNameMap: {
        "NAME": "SATNAME",
        "INT. DESIGNATION": "INTLDES",
        "OBJECT TYPE": "OBJECT_TYPE",
        "COUNTRY": "COUNTRY",
        "LAUNCH YEAR": "LAUNCH_YEAR",
        "LAUNCH SITE": "SITE",
        "NORAD ID": "NORAD_CAT_ID"
    }, //map filter names to satcat.csv names
    int_tle: new Map(), //map of COSPAR ID to its TLE lines
    satcat_csv: new Map(), //map of COSPAR ID to its satcat.csv info array
    objTypeAr: [], //array of all object types for filter select element
    csv_mp: new Map(), //map of country codes to full names
    LaunchSite: new Map(), //map of launch site codes to full names



    //map related
    all_markers: new Map(), //map of all markers on map (key is NORAD ID)
    markerHighlighted: [], //array of currently highlighted markers
};