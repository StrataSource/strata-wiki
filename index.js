const dev = require("./modulesNew/dev");
const exp = require("./modulesNew/export");

exp.all();
if (process.argv[1] == "dev" || process.argv[2] == "dev") {
    dev.run();
}
setTimeout(() => {}, 999999);
