const dev = require("./modules/dev");
const exp = require("./modules/export");

exp.exportAllPages();
if (process.argv[1] == "dev" || process.argv[2] == "dev") {
  dev.run();
}
