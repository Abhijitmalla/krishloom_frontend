const fs = require('fs');
const path = require('path');

const index_path = path.join('d:', 'krishloom-vastram', 'frontend', 'Admin-dashboard', 'index.html');
const affiliates_path = path.join('d:', 'krishloom-vastram', 'frontend', 'Admin-dashboard', 'affiliates.html');

let content = fs.readFileSync(index_path, 'utf8');

// The line endings in Windows might be \r\n, so we normalize for search
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Make the Affiliates link active
// The link is actually: <a class="sb-sub-link" onclick="setSubActive(this)" href="affiliates.html"> or href="#"
// Let's use regex to replace it
content = content.replace(/<a class="sb-sub-link([^>]*)href="([^"]*)"([^>]*)>\s*<i class="ti ti-list"><\/i><span class="lbl">All Affiliate<\/span>\s*<\/a>/i, '<a class="sb-sub-link active" onclick="setSubActive(this)" href="affiliates.html">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>');

// 2. Remove active from Dashboard link
content = content.replace(/<a class="sb-link active" onclick="setActive\(this\)" href="index\.html">/, '<a class="sb-link" onclick="setActive(this)" href="index.html">');

// 3. Replace main content area
const start_marker = '<div class="main">';
const end_marker = '<script>';
if (content.includes(start_marker) && content.includes(end_marker)) {
    const start_idx = content.indexOf(start_marker);
    const end_idx = content.indexOf(end_marker, start_idx);
    
    const new_main = `<div class="main">
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>All Affiliates</h2>
      </div>

      <div class="table-container" style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border);">
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">SL No.</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Login</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Username</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Password</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Name</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Phone</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Shopping Wallet</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Profile</th>
              <th style="padding: 12px; color: var(--muted); font-size: 13px;">Action</th>
            </tr>
          </thead>
          <tbody id="affiliateTableBody">
            <!-- Data will be populated here -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  `;
    
    content = content.substring(0, start_idx) + new_main + content.substring(end_idx);
    
    // 4. Add the script
    const script_insertion_point = `<script>
    async function loadAffiliates() {
      try {
        const response = await fetch('http://localhost/krishloom-vastram/backend/routes/api.php?route=getAllAffiliates');
        const data = await response.json();
        const tbody = document.getElementById('affiliateTableBody');
        tbody.innerHTML = '';
        
        if (data.status && data.data) {
          data.data.forEach((affiliate, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border)';
            tr.innerHTML = \`
              <td style="padding: 12px; font-size: 14px;">\${index + 1}</td>
              <td style="padding: 12px; font-size: 14px;">\${affiliate.membership_id || affiliate.email || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">\${affiliate.membership_id || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">********</td>
              <td style="padding: 12px; font-size: 14px;">\${affiliate.name || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">\${affiliate.mobile_no || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">₹0</td>
              <td style="padding: 12px; font-size: 14px;">-</td>
              <td style="padding: 12px; font-size: 14px;">
                <button onclick="loginAsAffiliate('\${affiliate.membership_id || affiliate.mobile_no}')" style="background: var(--c); color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">Login</button>
              </td>
            \`;
            tbody.appendChild(tr);
          });
        }
      } catch (e) {
        console.error('Error fetching affiliates:', e);
      }
    }
    
    async function loginAsAffiliate(membershipId) {
      try {
        const res = await fetch('http://localhost/krishloom-vastram/backend/routes/api.php?route=adminLoginAsAffiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ affiliate_id: membershipId })
        });
        const data = await res.json();
        if (data.status) {
          localStorage.setItem('affiliate_user', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '../Affiliate dashboard/template/index.html';
        } else {
          showGlobalSnackbar(data.message || 'Login failed', 'error');
        }
      } catch (err) {
        showGlobalSnackbar('Error logging in as affiliate', 'error');
      }
    }
    
    document.addEventListener('DOMContentLoaded', loadAffiliates);
    
    `;
    
    content = content.replace('<script>', script_insertion_point);
    
    fs.writeFileSync(affiliates_path, content, 'utf8');
    console.log('Created affiliates.html successfully');
} else {
    console.log('Could not find markers in index.html');
}
