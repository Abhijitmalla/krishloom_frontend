const fs = require('fs');
const HOME_URL = 'http://127.0.0.1:5500/krishloom3/krishloom3/index.html';

let content = fs.readFileSync('slider.html', 'utf8');

// 1. Fix brand link
content = content.replace(
  '<a class="nav-brand" href="index.html">',
  `<a class="nav-brand" href="${HOME_URL}">`
);

// 2. Fix logout link
content = content.replace(
  '<a class="sb-link logout" href="#" onclick="return false">',
  '<a class="sb-link logout" href="#" onclick="adminLogout(); return false;">'
);

// 3. Fix Slider sub-link — make active and point to slider.html
content = content.replace(
  /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-plus"><\/i><span class="lbl">Slider<\/span>\s*<\/a>/gi,
  '<a class="sb-sub-link active" onclick="setSubActive(this)" href="slider.html">\n               <i class="ti ti-plus"></i><span class="lbl">Slider</span>\n             </a>'
);

// 4. Fix All Affiliate link
content = content.replace(
  /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-list"><\/i><span class="lbl">All Affiliate<\/span>\s*<\/a>/gi,
  '<a class="sb-sub-link" onclick="setSubActive(this)" href="affiliates.html">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>'
);

// 5. Fix Change Password link
content = content.replace(
  /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-key"><\/i><span class="lbl">Change Password<\/span>\s*<\/a>/gi,
  '<a class="sb-sub-link" onclick="setSubActive(this)" href="change-password.html">\n               <i class="ti ti-key"></i><span class="lbl">Change Password</span>\n             </a>'
);

// 6. Inject adminLogout function before closing </script> of the sidebar script block
const logoutFn = `
    function adminLogout() {
      sessionStorage.clear();
      localStorage.removeItem('admin');
      window.location.href = '${HOME_URL}';
    }
`;

// Find where the sidebar JS functions end and inject there
const triggerMarker = 'function checkMob()';
const triggerIdx = content.indexOf(triggerMarker);
if (triggerIdx !== -1) {
  const scriptCloseIdx = content.indexOf('</script>', triggerIdx);
  if (scriptCloseIdx !== -1 && !content.includes('function adminLogout()')) {
    content = content.substring(0, scriptCloseIdx) + logoutFn + '  </script>' + content.substring(scriptCloseIdx + '</script>'.length);
  }
}

fs.writeFileSync('slider.html', content, 'utf8');
console.log('slider.html updated successfully');
