const fs = require('fs');

function fixIndexLink(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-list"><\/i><span class="lbl">All Affiliate<\/span>\s*<\/a>/i;
    content = content.replace(regex, '<a class="sb-sub-link" onclick="setSubActive(this)" href="affiliates.html">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>');
    fs.writeFileSync(filePath, content, 'utf8');
}

fixIndexLink('index.html');
console.log('Done');
