# satellite\_tracker

Satellite Tracker is an interactive single-page web application for visualizing and exploring data for thousands of satellites orbiting Earth. It provides an interactive map and a detailed, filterable data table to browse a comprehensive satellite catalog.
<img width="2842" height="1439" alt="image" src="https://github.com/user-attachments/assets/31fa9278-b305-4abe-a4c0-c6b619a3950e" />

---

## Content
This project is a satellite tracking web-app built with JS and React. It visualizes satellite positions on an interactive world map using Leaflet.js and marker clustering to efficiently handle large numbers of satellite markers.

Alongside the map, the application features a table, implemented with DataTables.net, which lists detailed information about each satellite. This table is fully searchable, sortable, and can be filtered using a variety of parameters. The front-end is structured as a Single-Page Application (SPA), with React taking care of state updates and rerendering.

The repository includes files containing archived satellite data, which are used to calculate current positions. However, the older this data becomes, the greater the discrepancy between the calculated positions and the actual satellite locations. For testing purposes, the provided files should be sufficient. If you need more accurate results, a section below explains how to obtain updated satellite data.

---

## Install & build

```bash
git clone https://github.com/PLUT0pluto/satellite_tracker.git
cd satellite_tracker
npm install
npm run build:css
npm run build
# then open the app:
# open src/index.html in your browser (or serve the folder with a static server)
```

> Note: the repo uses local static HTML; open `src/index.html` after the build step to run the app.

---

## Updating satellite data

To get fresh data, go to **space-tracker.org** and download the latest `3le` and `satcat` files. Replace the repository files named `3le_full` and `SATCAT_full` in `satellite_data/` with the downloaded files. You must rename the new files to the old names.

---

## Repo layout

```
src/          # app entry (index.html, main.jsx, components/, map/)
style/        # css
misc/         # build helpers, tailwind config, assets
satellite_data/ # SATCAT & 3le files
package.json
```




