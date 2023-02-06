const express = require("express");
const md = require("./render");
const pages = require("./pages");
const template = require("./template");
const exp = require("./export");

module.exports.run = () => {
    const app = express();
    const port = 3000;

    app.get("/dev/reload", (req, res) => {
        exp.all();
        res.send("Done");
    });

    app.use("/assets", express.static("assets"));

    app.use("/", express.static("public"));

    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`);
        console.log(
            `⚠ The dev server does not update the generated files automatically for performance reasons!`
        );
    });
};
