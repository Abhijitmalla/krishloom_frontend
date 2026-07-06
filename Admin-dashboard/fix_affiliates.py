import os

index_path = r'd:\krishloom-vastram\frontend\Admin-dashboard\index.html'
affiliates_path = r'd:\krishloom-vastram\frontend\Admin-dashboard\affiliates.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the Affiliates link active
old_link = '<a class="sb-sub-link" onclick="setSubActive(this)" href="#">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>'
new_link = '<a class="sb-sub-link active" onclick="setSubActive(this)" href="affiliates.html">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>'
if old_link in content:
    content = content.replace(old_link, new_link)

# Remove active from Dashboard link
old_dash = '<a class="sb-link active" onclick="setActive(this)" href="index.html">'
new_dash = '<a class="sb-link" onclick="setActive(this)" href="index.html">'
if old_dash in content:
    content = content.replace(old_dash, new_dash)

# Replace the main content area
start_marker = '  <!-- ══════════════════════════════\n     MAIN CONTENT (sample)\n══════════════════════════════ -->'
end_marker = '  <script>'
if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)
    
    new_main = '''  <!-- ══════════════════════════════
     MAIN CONTENT
══════════════════════════════ -->
  <div class="main">
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

  <script>
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
            tr.innerHTML = `
              <td style="padding: 12px; font-size: 14px;">${index + 1}</td>
              <td style="padding: 12px; font-size: 14px;">${affiliate.membership_id || affiliate.email || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">${affiliate.membership_id || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">********</td>
              <td style="padding: 12px; font-size: 14px;">${affiliate.name || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">${affiliate.mobile_no || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">₹0</td>
              <td style="padding: 12px; font-size: 14px;">-</td>
              <td style="padding: 12px; font-size: 14px;">
                <button onclick="loginAsAffiliate('${affiliate.membership_id || affiliate.mobile_no}')" style="background: var(--c); color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">Login</button>
              </td>
            `;
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
'''
    
    content = content[:start_idx] + new_main + '\n  <script>' + content[end_idx + len('  <script>'):]
    
    with open(affiliates_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Created affiliates.html successfully')
else:
    print('Could not find markers in index.html')
