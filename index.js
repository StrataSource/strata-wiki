const exp = require("./modules/export");

exp.all();
if (process.argv[1] === "dev" || process.argv[2] === "dev") {
    console.error(
        "The dev server is no longer supported. Please use wrangler to test."
    );
    process.exit(1);
}
