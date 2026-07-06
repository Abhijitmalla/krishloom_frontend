const fs = require('fs');

const files = [
  'd:/krishloom-vastram/frontend/Admin-dashboard/index.html',
  'd:/krishloom-vastram/frontend/Admin-dashboard/affiliates.html',
  'd:/krishloom-vastram/frontend/Admin-dashboard/change-password.html',
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = filePath.split('/').pop();

  // Fix the Slider sub-link href="#" -> slider.html
  // The pattern: sub-link with ti-plus icon and "Slider" label
  content = content.replace(
    /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-plus"><\/i><span class="lbl">Slider<\/span>\s*<\/a>/gi,
    `<a class="sb-sub-link${fileName === 'slider.html' ? ' active' : ''}" onclick="setSubActive(this)" href="slider.html">\n               <i class="ti ti-plus"></i><span class="lbl">Slider</span>\n             </a>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', fileName);
});
