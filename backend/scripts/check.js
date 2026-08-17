// Lightweight sanity check for CI: requires every route/controller/model/
// middleware file so syntax errors and broken imports fail the build,
// without needing a test framework or a live database connection.
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const dirs = ["routes", "controllers", "models", "middleware"];
let count = 0;

for (const dir of dirs) {
  const fullDir = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const file of fs.readdirSync(fullDir)) {
    if (!file.endsWith(".js")) continue;
    require(path.join(fullDir, file));
    count++;
  }
}

// server.js connects to MongoDB and opens a port as a side effect of being
// required, so it's syntax-checked only, not executed.
execFileSync(process.execPath, ["--check", path.join(__dirname, "..", "server.js")]);

console.log(`OK — ${count} route/controller/model/middleware files loaded, server.js syntax-checked`);
process.exit(0);
