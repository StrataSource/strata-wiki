const fs = require("fs");
var template = fs.readFileSync("templates/wiki.html", "utf-8");

module.exports.applyTemplate = (content) => {
  return template.replaceAll("%CONTENT%", content);
};
