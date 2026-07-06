const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const start_idx = c.indexOf('<div class="main">');
const script_idx = c.indexOf('<script>', start_idx);
console.log('Distance between main and script:', script_idx - start_idx);
const content = c.substring(start_idx, script_idx);
console.log('Number of divs inside:', (content.match(/<div/g) || []).length);
console.log('Number of closing divs inside:', (content.match(/<\/div/g) || []).length);
