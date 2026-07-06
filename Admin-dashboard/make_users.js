const fs = require('fs');

// 1. Create users.html from index.html
let usersContent = fs.readFileSync('index.html', 'utf8');

// Update title
usersContent = usersContent.replace('<title>KrishLoom – Admin Dashboard</title>', '<title>KrishLoom – All Users</title>');

// Deactivate Dashboard link
usersContent = usersContent.replace(
  '<a class="sb-link active" onclick="setActive(this)" href="index.html">',
  '<a class="sb-link" onclick="setActive(this)" href="index.html">'
);

// Activate All Users link and point to users.html
usersContent = usersContent.replace(
  /<a class="sb-link" onclick="setActive\(this\)" href="[^"]*">\s*<i class="ti ti-users-group icon"><\/i>\s*<span class="lbl">All Users<\/span>\s*<\/a>/gi,
  '<a class="sb-link active" onclick="setActive(this)" href="users.html">\n          <i class="ti ti-users-group icon"></i>\n          <span class="lbl">All Users</span>\n        </a>'
);

// Replace main content
const start_marker = '<div class="main">';
const end_idx_before = usersContent.indexOf(start_marker);
const script_idx = usersContent.indexOf('<script>', end_idx_before);

const new_main = `<div class="main">
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>All Users</h2>
      </div>

      <div class="table-container" style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border);">
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">SL No.</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Login</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Username</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Sponsor Id</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Password</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Name</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Phone</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Shipping Address</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Status</th>
            </tr>
          </thead>
          <tbody id="userTableBody">
            <!-- Data will be populated here -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  `;

usersContent = usersContent.substring(0, end_idx_before) + new_main + usersContent.substring(script_idx);

// Inject load script
const script_marker = '<script>';
const loadScript = `<script>
    async function loadUsers() {
      try {
        const response = await fetch('http://localhost/krishloom-vastram/backend/routes/api.php?route=getAllUsers');
        const data = await response.json();
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        
        if (data.status && data.data) {
          data.data.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border)';
            tr.innerHTML = \`
              <td style="padding: 12px; font-size: 14px;">\${index + 1}</td>
              <td style="padding: 12px; font-size: 14px;">\${user.email || user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">\${user.email || user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">N/A</td>
              <td style="padding: 12px; font-size: 14px;">********</td>
              <td style="padding: 12px; font-size: 14px;">\${user.name || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">\${user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">\${user.address || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;"><span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span></td>
            \`;
            tbody.appendChild(tr);
          });
        } else {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">No users found</td></tr>';
        }
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    }
    
    document.addEventListener('DOMContentLoaded', loadUsers);
    
`;

usersContent = usersContent.replace(script_marker, loadScript);

fs.writeFileSync('users.html', usersContent, 'utf8');
console.log('users.html created');

// 2. Update All Users links in all other HTML files
const files = [
  'index.html',
  'affiliates.html',
  'change-password.html',
  'slider.html'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /<a class="sb-link" onclick="setActive\(this\)" href="[^"]*">\s*<i class="ti ti-users-group icon"><\/i>\s*<span class="lbl">All Users<\/span>\s*<\/a>/gi,
    '<a class="sb-link" onclick="setActive(this)" href="users.html">\n          <i class="ti ti-users-group icon"></i>\n          <span class="lbl">All Users</span>\n        </a>'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated All Users link in:', filePath);
});
