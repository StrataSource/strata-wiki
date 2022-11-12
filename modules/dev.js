const md = require("./render");
const templater = require("./templater");
const path = require("path");
const express = require("express");

module.exports.run = () => {
  const app = express();
  const port = 3000;

  app.use("/assets", express.static("assets"));

  app.get("/*", (req, res) => {
    res.send(templater.applyTemplate(md.renderPage(req.params[0] || "index")));
  });

  app.listen(port, () => {
    console.log(`Dev server listening on port ${port}`);
  });
};
