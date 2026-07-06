const fs = require('fs');

['index.html', 'users.html', 'affiliates.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const start_idx = c.indexOf('<div class="main">');
  const script_idx = c.indexOf('<script>', start_idx);
  const content = c.substring(start_idx, script_idx);
  console.log(f, '- divs:', (content.match(/<div/g) || []).length, 'closing divs:', (content.match(/<\/div/g) || []).length);
});
