# CloudBase Web App isolation finding

## Finding

`manageApps(deployApp, serviceName="trae-h5-demo", appPath="/")` returned an independent `webapps.tcloudbase.com` domain and build SUCCESS, but uploaded the H5 entry to the environment's shared Static Hosting root. Both the Web App domain and the existing Admin domain then returned the H5 body SHA `9c3eeded…` and H5 entry assets. This violated the non-overwrite gate.

## Safe response

Old Admin assets remained HTTP 200. The captured original Admin `index.html` was uploaded back to the root as the narrowest compensating change. Admin root and `/places` then returned:

- HTTP 200;
- ETag `"7d165666343cd07c52d03f25c6a7caff"`;
- body SHA-256 `098244bcd9220b4b223b8d043468f254847c8304aa35c57d47fb58fc68eb3a5e`;
- entry resources `/assets/index-Bd1K6-49.js` and `/assets/index-CVzScoi3.css`.

These match the pre-deployment record exactly. Last-Modified changed because the original bytes were restored by upload. H5 asset files remain in shared Hosting; they were not deleted because path collisions and `deleteApp` side effects were not safely provable. The app record also remains. Further cleanup requires platform-supported isolation or explicit maintenance authority.
