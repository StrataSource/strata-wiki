const fs = require("fs");

module.exports.applyTemplate = (content, slug) => {
  var template = fs.readFileSync("templates/wiki.html", "utf-8");

  return template
    .replaceAll("%CONTENT%", content)
    .replaceAll(
      "%EDITLINK%",
      `https://github.com/ChaosInitiative/chaos-wiki/edit/main/pages/${slug}.md`
    );
};
