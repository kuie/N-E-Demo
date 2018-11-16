const path = require('path');
const fs = require('fs');
const packagePath = path.resolve('./', 'package.json'),
    basePackagePath = path.resolve('./', 'config', 'package_base.json'),
    baseJson = require(basePackagePath),
    nwJson = require(path.resolve('./', 'config', `package_nw.json`)),
    electronJson = require(path.resolve('./', 'config', `package_electron.json`)),
    json = baseJson;
json.dependencies = Object.assign(baseJson.dependencies, nwJson.dependencies, electronJson.dependencies);
json.devDependencies = Object.assign(baseJson.devDependencies, nwJson.devDependencies, electronJson.devDependencies);
fs.writeFileSync(packagePath, JSON.stringify(json, null, '  '), 'utf-8');