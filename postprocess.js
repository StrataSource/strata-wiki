import fs from "fs";

console.log("Copying lint report...");
fs.copyFileSync("static/report.json", "build/report.json");
