const path = require('path');
const fs = require('fs');
let setMainEntry = function (mode) {
    console.log(mode);
    const packageJsonPath = path.resolve('./', 'package.json');
    console.log(packageJsonPath);
    let json = fs.readFileSync(packageJsonPath);
    json = JSON.parse(json.toString());
    json.main = mode === 'nw' ? 'http://localhost:8080' : './dist/electron/main.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(json, null, '  '), 'utf-8');
};
setMainEntry('nw');