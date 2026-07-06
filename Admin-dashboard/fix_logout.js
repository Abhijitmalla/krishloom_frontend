const fs = require('fs');

const HOME_URL = 'http://127.0.0.1:5500/krishloom3/krishloom3/index.html';

const files = [
  'd:/krishloom-vastram/frontend/Admin-dashboard/index.html',
  'd:/krishloom-vastram/frontend/Admin-dashboard/affiliates.html',
  'd:/krishloom-vastram/frontend/Admin-dashboard/change-password.html',
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update brand/logo link
  content = content.replace(
    '<a class="nav-brand" href="index.html">',
    `<a class="nav-brand" href="${HOME_URL}">`
  );

  // 2. Update logout link — replace onclick="return false" with our logout handler
  content = content.replace(
    '<a class="sb-link logout" href="#" onclick="return false">',
    '<a class="sb-link logout" href="#" onclick="adminLogout(); return false;">'
  );

  // 3. Inject the adminLogout function into the existing <script> block
  const logoutFn = `
    function adminLogout() {
      sessionStorage.clear();
      localStorage.removeItem('admin');
      window.location.href = '${HOME_URL}';
    }
`;

  // Insert just before the closing </script> of the first script block
  // We look for the first </script> after "function toggle"
  const triggerIndex = content.indexOf('function toggle(id, link)');
  if (triggerIndex !== -1) {
    const scriptCloseIndex = content.indexOf('</script>', triggerIndex);
    if (scriptCloseIndex !== -1) {
      content = content.substring(0, scriptCloseIndex) + logoutFn + '  </script>' + content.substring(scriptCloseIndex + '</script>'.length);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath.split('/').pop());
});
