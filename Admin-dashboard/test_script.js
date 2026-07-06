
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
            tr.innerHTML = `
              <td style="padding: 12px; font-size: 14px;">${index + 1}</td>
              <td style="padding: 12px; font-size: 14px;">${user.email || user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">${user.email || user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">N/A</td>
              <td style="padding: 12px; font-size: 14px;">********</td>
              <td style="padding: 12px; font-size: 14px;">${user.name || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">${user.phone || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;">${user.address || 'N/A'}</td>
              <td style="padding: 12px; font-size: 14px;"><span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span></td>
            `;
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
    

    function toggle(id, link) {
      const item = document.getElementById(id);
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.sb-item.open').forEach(el => { if (el.id !== id) el.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
      return false;
    }
    function setActive(el) {
      document.querySelectorAll('.sb-link.active').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
      if (window.innerWidth <= 900) { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); }
      return true;
    }
    function setSubActive(el) {
      document.querySelectorAll('.sb-sub-link.active').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
      if (window.innerWidth <= 900) { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); }
      return true;
    }
    const ham = document.getElementById('hamburger');
    const ov = document.getElementById('overlay');
    const sb = document.getElementById('sidebar');
    ham.addEventListener('click', () => { const o = sb.classList.toggle('open'); ov.classList.toggle('active', o); });
    ov.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    function checkMob() { ham.style.display = window.innerWidth <= 900 ? 'grid' : 'none'; }
    window.addEventListener('resize', checkMob); checkMob();

    /* ── Snackbar Logic ── */
    function showGlobalSnackbar(message, type = 'success') {
      const snackbar = document.getElementById('globalSnackbar');
      if (!snackbar) return;
      snackbar.textContent = message;
      snackbar.className = 'show ' + type;
      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '').trim();
      }, 4000);
    }

    const snackData = sessionStorage.getItem('snackbar');
    if (snackData) {
      try {
        const { message, type } = JSON.parse(snackData);
        showGlobalSnackbar(message, type);
        sessionStorage.removeItem('snackbar');
      } catch (e) { }
    }
  
    function adminLogout() {
      sessionStorage.clear();
      localStorage.removeItem('admin');
      window.location.href = 'http://127.0.0.1:5500/krishloom3/krishloom3/index.html';
    }
  