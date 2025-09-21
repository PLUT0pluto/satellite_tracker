# satellite\_tracker

Lightweight web-based satellite tracker that visualises SATCAT data on an interactive map and provides a searchable/filterable data table.
<img width="2842" height="1439" alt="image" src="https://github.com/user-attachments/assets/31fa9278-b305-4abe-a4c0-c6b619a3950e" />

---

## Content

* Front-end app (JSX/JS/TypeScript) with map and UI components under `src/`.
* Local SATCAT data included in `satellite_data/` for offline use.
* Tailwind CSS used for styling (config under `misc/`).

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

To get fresh data, go to **space-tracker.org** and download the latest `3le` and `satcat` files. Replace the repository files named `3le_full` and `SATCAT_full` in `satellite_data/` with the downloaded files. 

---

## Minimal repo layout

```
src/          # app entry (index.html, main.jsx, components/, map/)
style/        # css
misc/         # build helpers, tailwind config, assets
satellite_data/ # SATCAT & 3le files
package.json
```



