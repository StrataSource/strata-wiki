const md = require("./render");
const templater = require("./templater");
const menu = require("./menu");
const path = require("path");
const express = require("express");

module.exports.run = () => {
  const app = express();
  const port = 3000;

  app.use("/assets", express.static("assets"));

  app.get("/ajax/menu.json", (req, res) => {
    res.json(menu.generateMenu());
  });

  app.get("/*", (req, res) => {
    var slug = req.params[0] || "index";
    res.send(templater.applyTemplate(md.renderPage(slug), slug));
  });

  app.listen(port, () => {
    console.log(`Dev server listening on port ${port}`);
  });
};
