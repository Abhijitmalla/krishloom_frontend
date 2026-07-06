const fs = require('fs');

const files = [
  'd:/krishloom-vastram/frontend/Admin-dashboard/index.html',
  'd:/krishloom-vastram/frontend/Admin-dashboard/affiliates.html',
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  // Update Change Password link href
  content = content.replace(
    /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-key"><\/i><span class="lbl">Change Password<\/span>\s*<\/a>/gi,
    '<a class="sb-sub-link" onclick="setSubActive(this)" href="change-password.html">\n               <i class="ti ti-key"></i><span class="lbl">Change Password</span>\n             </a>'
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
});
