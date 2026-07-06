const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const brandIdx = c.indexOf('nav-brand');
console.log('Brand context:', c.substring(brandIdx, brandIdx + 60));

const logoutIdx = c.indexOf('sb-link logout');
console.log('Logout context:', c.substring(logoutIdx, logoutIdx + 80));

const fnIdx = c.indexOf('function adminLogout()');
console.log('adminLogout fn found:', fnIdx !== -1);
