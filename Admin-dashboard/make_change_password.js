const fs = require('fs');

const index_path = 'd:/krishloom-vastram/frontend/Admin-dashboard/index.html';
const out_path = 'd:/krishloom-vastram/frontend/Admin-dashboard/change-password.html';

let content = fs.readFileSync(index_path, 'utf8');

// 1. Update <title>
content = content.replace('<title>KrishLoom – Admin Dashboard</title>', '<title>KrishLoom – Change Password</title>');

// 2. Remove active from Dashboard link
content = content.replace(
  '<a class="sb-link active" onclick="setActive(this)" href="index.html">',
  '<a class="sb-link" onclick="setActive(this)" href="index.html">'
);

// 3. Make Affiliates link point to affiliates.html (already done in index perhaps, use regex)
content = content.replace(
  /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-list"><\/i><span class="lbl">All Affiliate<\/span>\s*<\/a>/i,
  '<a class="sb-sub-link" onclick="setSubActive(this)" href="affiliates.html">\n              <i class="ti ti-list"></i><span class="lbl">All Affiliate</span>\n            </a>'
);

// 4. Make "Change Password" link active and point to change-password.html
content = content.replace(
  '<a class="sb-sub-link" onclick="setSubActive(this)" href="#">\n               <i class="ti ti-key"></i><span class="lbl">Change Password</span>\n             </a>',
  '<a class="sb-sub-link active" onclick="setSubActive(this)" href="change-password.html">\n               <i class="ti ti-key"></i><span class="lbl">Change Password</span>\n             </a>'
);

// Alternative replace for the Change Password link (different whitespace)
content = content.replace(
  /<a class="sb-sub-link" onclick="setSubActive\(this\)" href="[^"]*">\s*<i class="ti ti-key"><\/i><span class="lbl">Change Password<\/span>\s*<\/a>/i,
  '<a class="sb-sub-link active" onclick="setSubActive(this)" href="change-password.html">\n               <i class="ti ti-key"></i><span class="lbl">Change Password</span>\n             </a>'
);

// 5. Replace the main content
const start_marker = '<div class="main">';
const end_idx_before = content.indexOf(start_marker);
const end_script = '<script>';
const script_idx = content.indexOf(end_script, end_idx_before);

const new_main = `<div class="main">
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; color: var(--text);">Change Password</h2>
      </div>

      <div style="max-width: 480px;">
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 32px;">
          
          <!-- Current Password -->
          <div style="margin-bottom: 20px;">
            <label for="currentPassword" style="display: block; font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px;">Current Password</label>
            <div style="position: relative;">
              <input type="password" id="currentPassword" placeholder="Enter current password"
                style="width: 100%; padding: 12px 44px 12px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-family: inherit; color: var(--text); outline: none; transition: border-color .2s;"
                onfocus="this.style.borderColor='var(--c)'" onblur="this.style.borderColor='var(--border)'" />
              <i class="ti ti-eye" id="toggleCurrent" onclick="toggleVisibility('currentPassword','toggleCurrent')"
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--muted);font-size:18px;"></i>
            </div>
          </div>

          <!-- New Password -->
          <div style="margin-bottom: 20px;">
            <label for="newPassword" style="display: block; font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px;">New Password</label>
            <div style="position: relative;">
              <input type="password" id="newPassword" placeholder="Enter new password"
                style="width: 100%; padding: 12px 44px 12px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-family: inherit; color: var(--text); outline: none; transition: border-color .2s;"
                onfocus="this.style.borderColor='var(--c)'" onblur="this.style.borderColor='var(--border)'" />
              <i class="ti ti-eye" id="toggleNew" onclick="toggleVisibility('newPassword','toggleNew')"
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--muted);font-size:18px;"></i>
            </div>
          </div>

          <!-- Confirm Password -->
          <div style="margin-bottom: 28px;">
            <label for="confirmPassword" style="display: block; font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px;">Confirm New Password</label>
            <div style="position: relative;">
              <input type="password" id="confirmPassword" placeholder="Re-enter new password"
                style="width: 100%; padding: 12px 44px 12px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-family: inherit; color: var(--text); outline: none; transition: border-color .2s;"
                onfocus="this.style.borderColor='var(--c)'" onblur="this.style.borderColor='var(--border)'" />
              <i class="ti ti-eye" id="toggleConfirm" onclick="toggleVisibility('confirmPassword','toggleConfirm')"
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--muted);font-size:18px;"></i>
            </div>
            <p id="matchMsg" style="font-size:12px;margin-top:6px;display:none;"></p>
          </div>

          <!-- Submit Button -->
          <button id="changePassBtn" onclick="changePassword()"
            style="width: 100%; padding: 13px; background: linear-gradient(135deg, var(--c), var(--c2)); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity .2s; letter-spacing: .3px;">
            <i class="ti ti-lock-check" style="margin-right:6px;"></i> Update Password
          </button>

        </div>
      </div>
    </div>
  </div>

  `;

content = content.substring(0, end_idx_before) + new_main + content.substring(script_idx);

// 6. Inject the changePassword script before the existing scripts
const script_marker = '<script>';
const script_inject = `<script>
    function toggleVisibility(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('ti-eye', 'ti-eye-off');
      } else {
        input.type = 'password';
        icon.classList.replace('ti-eye-off', 'ti-eye');
      }
    }

    document.getElementById('confirmPassword').addEventListener('input', function() {
      const newPass = document.getElementById('newPassword').value;
      const msg = document.getElementById('matchMsg');
      if (this.value && this.value !== newPass) {
        msg.style.display = 'block';
        msg.style.color = '#c0392b';
        msg.textContent = 'Passwords do not match';
      } else if (this.value && this.value === newPass) {
        msg.style.display = 'block';
        msg.style.color = '#1e8449';
        msg.textContent = 'Passwords match';
      } else {
        msg.style.display = 'none';
      }
    });

    async function changePassword() {
      const currentPassword = document.getElementById('currentPassword').value.trim();
      const newPassword = document.getElementById('newPassword').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();

      if (!currentPassword || !newPassword || !confirmPassword) {
        showGlobalSnackbar('All fields are required', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showGlobalSnackbar('New passwords do not match', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showGlobalSnackbar('New password must be at least 6 characters', 'error');
        return;
      }

      const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
      const admin_id = adminData.id || 1;

      const btn = document.getElementById('changePassBtn');
      btn.disabled = true;
      btn.textContent = 'Updating...';

      try {
        const res = await fetch('http://localhost/krishloom-vastram/backend/routes/api.php?route=adminChangePassword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_id, current_password: currentPassword, new_password: newPassword })
        });
        const data = await res.json();
        if (data.status) {
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
          document.getElementById('matchMsg').style.display = 'none';
          showGlobalSnackbar('Password updated successfully!', 'success');
        } else {
          showGlobalSnackbar(data.message || 'Failed to update password', 'error');
        }
      } catch (err) {
        showGlobalSnackbar('Error connecting to server', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ti ti-lock-check" style="margin-right:6px;"></i> Update Password';
      }
    }
`;

content = content.replace(script_marker, script_inject);

fs.writeFileSync(out_path, content, 'utf8');
console.log('change-password.html created successfully');
