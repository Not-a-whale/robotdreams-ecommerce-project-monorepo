'use strict';

const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, 'apps', 'frontend');
const serverPath = path.join(appRoot, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('[frontend] Expected Next standalone at:', serverPath);
  process.exit(1);
}

process.chdir(appRoot);
require(serverPath);
