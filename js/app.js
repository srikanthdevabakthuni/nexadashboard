/* =============================================
   NEXAWORKS ADMIN DASHBOARD - FULL JS
   All HTML5 APIs + Complete Interactivity
   ============================================= */

// =============================================
// HTML5 API: LocalStorage
// =============================================
const Storage = {
  set(key, value) { try { localStorage.setItem('dash_' + key, JSON.stringify(value)); } catch(e) {} },
  get(key, def = null) { try { const v = localStorage.getItem('dash_' + key); return v ? JSON.parse(v) : def; } catch(e) { return def; } },
  remove(key) { try { localStorage.removeItem('dash_' + key); } catch(e) {} }
};

// =============================================
// HTML5 API: SessionStorage
// =============================================
const Session = {
  set(key, value) { try { sessionStorage.setItem('sess_' + key, JSON.stringify(value)); } catch(e) {} },
  get(key, def = null) { try { const v = sessionStorage.getItem('sess_' + key); return v ? JSON.parse(v) : def; } catch(e) { return def; } }
};

// =============================================
// SIDEBAR
// =============================================
const Sidebar = {
  el: null, overlay: null, mainContent: null,
  init() {
    this.el = document.getElementById('sidebar');
    this.overlay = document.getElementById('sidebarOverlay');
    this.mainContent = document.getElementById('mainContent');
    const savedState = Storage.get('sidebarCollapsed', false);
    if (savedState && window.innerWidth > 992) this.collapse(true);
    document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggle());
    this.overlay?.addEventListener('click', () => this.closeMobile());
    document.querySelectorAll('[data-submenu]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-submenu');
        const sub = document.getElementById(target);
        if (!sub) return;
        const isOpen = sub.style.display === 'block';
        document.querySelectorAll('.submenu').forEach(s => s.style.display = 'none');
        document.querySelectorAll('[data-submenu]').forEach(l => l.setAttribute('aria-expanded', 'false'));
        if (!isOpen) { sub.style.display = 'block'; el.setAttribute('aria-expanded', 'true'); }
      });
    });
  },
  toggle() {
    if (window.innerWidth <= 992) {
      this.el.classList.toggle('mobile-open');
      this.overlay.classList.toggle('show');
    } else {
      const isCollapsed = this.el.classList.toggle('collapsed');
      this.mainContent.classList.toggle('expanded', isCollapsed);
      Storage.set('sidebarCollapsed', isCollapsed);
    }
  },
  collapse(silent = false) { this.el?.classList.add('collapsed'); this.mainContent?.classList.add('expanded'); },
  closeMobile() { this.el?.classList.remove('mobile-open'); this.overlay?.classList.remove('show'); }
};

// =============================================
// NAVIGATION
// =============================================
const Nav = {
  init() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.getAttribute('data-page'));
        Sidebar.closeMobile();
      });
    });
    const savedPage = Session.get('activePage', 'dashboard');
    this.navigate(savedPage, true);
  },
  navigate(page, silent = false) {
    document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('[data-page]').forEach(l => l.classList.remove('active'));
    const section = document.getElementById('page-' + page);
    if (section) {
      section.classList.add('active');
      section.querySelectorAll('.animate-in').forEach((el, i) => {
        el.style.animationDelay = (i * 0.05) + 's';
        el.style.opacity = '0';
        setTimeout(() => el.style.opacity = '', 10);
      });
    }
    document.querySelectorAll(`[data-page="${page}"]`).forEach(l => l.classList.add('active'));
    const titles = {
      dashboard: ['Dashboard', 'Welcome back, Srikanth!'],
      employees: ['Employee Management', 'Manage your team'],
      clients: ['Client Management', 'Track client relationships'],
      projects: ['Project Tracking', 'Monitor project progress'],
      notifications: ['Notifications', 'Your activity feed'],
      settings: ['Settings', 'Customize your experience'],
    };
    const pageTitle = document.getElementById('pageTitle');
    const pageSub = document.getElementById('pageSubtitle');
    if (pageTitle && titles[page]) {
      pageTitle.textContent = titles[page][0];
      if (pageSub) pageSub.textContent = titles[page][1];
    }
    Session.set('activePage', page);
    if (page === 'dashboard' && !silent) Charts.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// =============================================
// DARK MODE - LocalStorage
// =============================================
const ThemeManager = {
  init() {
    const saved = Storage.get('darkMode', false);
    if (saved) this.apply(true, true);
    document.getElementById('darkModeToggle')?.addEventListener('change', (e) => this.apply(e.target.checked));
    document.getElementById('darkModeToggleSettings')?.addEventListener('change', (e) => this.apply(e.target.checked));
  },
  apply(isDark, silent = false) {
    document.body.classList.toggle('dark-mode', isDark);
    Storage.set('darkMode', isDark);
    const t1 = document.getElementById('darkModeToggle');
    const t2 = document.getElementById('darkModeToggleSettings');
    if (t1) t1.checked = isDark;
    if (t2) t2.checked = isDark;
    if (!silent) Charts.render();
  }
};

// =============================================
// DROPDOWNS
// =============================================
const Dropdowns = {
  init() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = trigger.getAttribute('data-dropdown');
        const menu = document.getElementById(id);
        if (!menu) return;
        const isOpen = menu.classList.contains('show');
        document.querySelectorAll('.dropdown-menu-custom, .notif-dropdown, .nd-dropdown, .ud-dropdown').forEach(m => m.classList.remove('show'));
        if (!isOpen) menu.classList.add('show');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu-custom, .notif-dropdown, .nd-dropdown, .ud-dropdown').forEach(m => m.classList.remove('show'));
    });
    // Notification tabs
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-ndtab]');
      if (!tab) return;
      tab.closest('.nd-tabs').querySelectorAll('.nd-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  }
};

// =============================================
// MODAL
// =============================================
const Modal = {
  open(id) { const m = document.getElementById(id); if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; } },
  close(id) { const m = document.getElementById(id); if (m) { m.classList.remove('show'); document.body.style.overflow = ''; } },
  init() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => this.open(btn.getAttribute('data-modal-open')));
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close(btn.getAttribute('data-modal-close')));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(overlay.id); });
    });
    // Keyboard: Escape closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.show').forEach(m => this.close(m.id));
    });
  }
};

// =============================================
// HTML5 API: CLIPBOARD API
// =============================================
const ClipboardManager = {
  async copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      btn.style.background = '#198754';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
      Notifications.show('success', 'Copied!', `"${text}" copied to clipboard.`);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); Notifications.show('success', 'Copied!', `"${text}" copied.`); } catch(e2) {}
      document.body.removeChild(ta);
    }
  },
  init() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        if (text) this.copy(text, btn);
      });
    });
  }
};

// =============================================
// HTML5 API: NOTIFICATION API
// =============================================
const Notifications = {
  container: null,
  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.setAttribute('role', 'status');
      this.container.setAttribute('aria-live', 'polite');
      this.container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:360px;';
      document.body.appendChild(this.container);
    }
    this.requestPermission();
  },
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },
  showBrowser(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%230d6efd"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="white">★</text></svg>' });
    }
  },
  show(type = 'info', title, message) {
    const icons = { success: 'fa-check-circle', danger: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const colors = { success: '#198754', danger: '#dc3545', warning: '#e67e22', info: '#0d6efd' };
    const toast = document.createElement('div');
    toast.style.cssText = `display:flex;align-items:flex-start;gap:12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.15);min-width:280px;max-width:360px;animation:slideInRight 0.3s ease;border-left:3px solid ${colors[type]};`;
    toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};font-size:18px;margin-top:1px;flex-shrink:0;" aria-hidden="true"></i><div style="flex:1;"><div style="font-weight:700;font-size:13.5px;color:var(--text-primary);">${title}</div><div style="font-size:12.5px;color:var(--text-secondary);margin-top:2px;">${message}</div></div><button onclick="this.parentElement.remove()" style="border:none;background:none;cursor:pointer;color:var(--text-muted);font-size:16px;padding:0;line-height:1;" aria-label="Close notification">×</button>`;
    if (!document.getElementById('toastSlideStyle')) {
      const s = document.createElement('style');
      s.id = 'toastSlideStyle';
      s.textContent = '@keyframes slideInRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}';
      document.head.appendChild(s);
    }
    this.container.appendChild(toast);
    setTimeout(() => { toast.style.transition = 'opacity 0.3s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
  }
};

// =============================================
// HTML5 API: GEOLOCATION API
// =============================================
const GeoLocation = {
  init() {
    document.getElementById('getLocationBtn')?.addEventListener('click', () => this.detect());
    const saved = Storage.get('userLocation');
    if (saved) this.display(saved);
    else this.detect();
  },
  detect() {
    if (!navigator.geolocation) { Notifications.show('warning', 'Geolocation', 'Not supported in this browser.'); return; }
    const btn = document.getElementById('getLocationBtn');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...'; btn.disabled = true; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const data = { lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4), acc: Math.round(pos.coords.accuracy) };
        this.reverseGeocode(data);
      },
      () => {
        const fallback = { lat: '17.2473', lng: '80.1514', city: 'Khammam', region: 'Telangana, India', acc: 0 };
        this.display(fallback);
        if (btn) { btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Retry'; btn.disabled = false; }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  },
  reverseGeocode(data) {
    const btn = document.getElementById('getLocationBtn');
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lng}&format=json`)
      .then(r => r.json()).then(res => {
        data.city = res.address?.city || res.address?.town || res.address?.village || 'Detected';
        data.region = [res.address?.state, res.address?.country].filter(Boolean).join(', ');
        this.display(data); Storage.set('userLocation', data);
      }).catch(() => { data.city = 'Location Detected'; this.display(data); });
    if (btn) { btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Refresh'; btn.disabled = false; }
  },
  display(data) {
    const cityEl = document.getElementById('locationCity');
    const coordsEl = document.getElementById('locationCoords');
    const timeEl = document.getElementById('locationTime');
    if (cityEl) cityEl.textContent = data.city + (data.region ? ', ' + data.region.split(',')[0] : '');
    if (coordsEl) coordsEl.textContent = `${data.lat}° N, ${data.lng}° E · ±${data.acc}m`;
    if (timeEl) timeEl.textContent = new Date().toLocaleString();
    Notifications.show('success', 'Location Detected', data.city || 'Location found');
  }
};

// =============================================
// CHARTS (Chart.js)
// =============================================
const Charts = {
  instances: {},
  render() { this.renderRevenue(); this.renderDept(); this.renderProject(); this.renderActivity(); },
  destroy(id) { if (this.instances[id]) { try { this.instances[id].destroy(); } catch(e){} delete this.instances[id]; } },
  isDark() { return document.body.classList.contains('dark-mode'); },
  gridColor() { return this.isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; },
  textColor() { return this.isDark() ? '#94a3b8' : '#6c7f94'; },
  renderRevenue() {
    const ctx = document.getElementById('revenueChart'); if (!ctx) return; this.destroy('revenue');
    this.instances['revenue'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Revenue', data: [42000,51000,38000,65000,59000,78000,82000,91000,74000,88000,96000,104000],
          borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#0d6efd', pointRadius: 4, pointHoverRadius: 6,
        },{
          label: 'Expenses', data: [28000,32000,27000,41000,38000,45000,52000,58000,47000,55000,61000,68000],
          borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.05)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#dc3545', pointRadius: 4, pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { color: this.textColor(), font: { family: 'Manrope', weight: '600' }, boxWidth: 12, padding: 16 } }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: this.gridColor() }, ticks: { color: this.textColor(), font: { family: 'Manrope' } } },
          y: { grid: { color: this.gridColor() }, ticks: { color: this.textColor(), font: { family: 'Manrope' }, callback: v => '₹' + (v/1000) + 'k' } }
        }
      }
    });
  },
  renderDept() {
    const ctx = document.getElementById('deptChart'); if (!ctx) return; this.destroy('dept');
    this.instances['dept'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Engineering', 'Design', 'Marketing', 'HR', 'Finance'],
        datasets: [{ data: [35, 20, 18, 12, 15], backgroundColor: ['#0d6efd','#198754','#ffc107','#dc3545','#7c3aed'], borderWidth: 0, hoverOffset: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: this.textColor(), font: { family: 'Manrope', weight: '600' }, padding: 16, boxWidth: 12 } } } }
    });
  },
  renderProject() {
    const ctx = document.getElementById('projectChart'); if (!ctx) return; this.destroy('project');
    this.instances['project'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Q1','Q2','Q3','Q4'],
        datasets: [
          { label: 'Completed', data: [12,15,11,18], backgroundColor: '#198754', borderRadius: 6, barThickness: 22 },
          { label: 'In Progress', data: [5,8,9,6], backgroundColor: '#0d6efd', borderRadius: 6, barThickness: 22 },
          { label: 'Pending', data: [3,2,4,2], backgroundColor: '#ffc107', borderRadius: 6, barThickness: 22 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: this.textColor(), font: { family: 'Manrope', weight: '600' }, boxWidth: 12, padding: 16 } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: this.textColor(), font: { family: 'Manrope' } } },
          y: { grid: { color: this.gridColor() }, ticks: { color: this.textColor(), font: { family: 'Manrope' } } }
        }
      }
    });
  },
  renderActivity() {
    const ctx = document.getElementById('activityChart'); if (!ctx) return; this.destroy('activity');
    this.instances['activity'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{ label: 'Tasks Completed', data: [8,12,6,15,10,4,7], backgroundColor: 'rgba(13,110,253,0.85)', borderRadius: 6, barThickness: 20 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: this.textColor(), font: { family: 'Manrope' } } },
          y: { grid: { color: this.gridColor() }, ticks: { color: this.textColor(), font: { family: 'Manrope' } } }
        }
      }
    });
  }
};

// =============================================
// EMPLOYEE TABLE - Full CRUD + Search + Sort + Pagination
// =============================================
const EmployeeTable = {
  data: [
    { id: 'EMP001', name: 'Arjun Sharma', email: 'arjun@nexaworks.com', role: 'Developer', dept: 'Engineering', status: 'Active', joined: '2022-01-15', salary: '₹85,000', initials: 'AS', color: '#0d6efd' },
    { id: 'EMP002', name: 'Priya Reddy', email: 'priya@nexaworks.com', role: 'Designer', dept: 'Design', status: 'Active', joined: '2021-08-22', salary: '₹72,000', initials: 'PR', color: '#7c3aed' },
    { id: 'EMP003', name: 'Kiran Kumar', email: 'kiran@nexaworks.com', role: 'Manager', dept: 'Engineering', status: 'Active', joined: '2020-03-10', salary: '₹1,20,000', initials: 'KK', color: '#198754' },
    { id: 'EMP004', name: 'Sneha Patel', email: 'sneha@nexaworks.com', role: 'HR', dept: 'HR', status: 'On Leave', joined: '2022-06-18', salary: '₹65,000', initials: 'SP', color: '#e67e22' },
    { id: 'EMP005', name: 'Rahul Verma', email: 'rahul@nexaworks.com', role: 'Developer', dept: 'Engineering', status: 'Active', joined: '2023-01-05', salary: '₹78,000', initials: 'RV', color: '#0d9488' },
    { id: 'EMP006', name: 'Divya Nair', email: 'divya@nexaworks.com', role: 'Designer', dept: 'Design', status: 'Active', joined: '2021-11-30', salary: '₹68,000', initials: 'DN', color: '#dc3545' },
    { id: 'EMP007', name: 'Aditya Singh', email: 'aditya@nexaworks.com', role: 'Finance', dept: 'Finance', status: 'Active', joined: '2022-09-14', salary: '₹95,000', initials: 'AS', color: '#0dcaf0' },
    { id: 'EMP008', name: 'Meera Iyer', email: 'meera@nexaworks.com', role: 'Marketing', dept: 'Marketing', status: 'Inactive', joined: '2020-07-22', salary: '₹62,000', initials: 'MI', color: '#6c757d' },
    { id: 'EMP009', name: 'Vikram Rao', email: 'vikram@nexaworks.com', role: 'Developer', dept: 'Engineering', status: 'Active', joined: '2023-03-20', salary: '₹82,000', initials: 'VR', color: '#fd7e14' },
    { id: 'EMP010', name: 'Anjali Kapoor', email: 'anjali@nexaworks.com', role: 'Manager', dept: 'Marketing', status: 'Active', joined: '2021-05-12', salary: '₹1,10,000', initials: 'AK', color: '#20c997' },
  ],
  filtered: [], sortCol: 'name', sortDir: 1, page: 1, perPage: 5, search: '', roleFilter: '',

  init() {
    this.filtered = [...this.data];
    this.render();
    document.getElementById('empSearch')?.addEventListener('input', (e) => { this.search = e.target.value.toLowerCase(); this.page = 1; this.filter(); });
    document.getElementById('empRoleFilter')?.addEventListener('change', (e) => { this.roleFilter = e.target.value; this.page = 1; this.filter(); });
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (this.sortCol === col) this.sortDir *= -1; else { this.sortCol = col; this.sortDir = 1; }
        this.filter();
      });
    });
    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => { this.resetForm(); Modal.open('employeeModal'); });
    document.getElementById('saveEmployeeBtn')?.addEventListener('click', () => this.save());
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('printTableBtn')?.addEventListener('click', () => window.print());
  },

  resetForm() {
    document.getElementById('empModalTitle').innerHTML = '<i class="fas fa-user-plus" style="color:var(--primary);margin-right:8px;"></i>Add New Employee';
    ['empFirstName','empLastName','empEmail','empSalary'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('saveEmployeeBtn').removeAttribute('data-edit-id');
  },

  save() {
    const fn = document.getElementById('empFirstName')?.value.trim();
    const ln = document.getElementById('empLastName')?.value.trim();
    const email = document.getElementById('empEmail')?.value.trim();
    const role = document.getElementById('empRole')?.value;
    const dept = document.getElementById('empDept')?.value;
    const salary = document.getElementById('empSalary')?.value;
    if (!fn || !ln || !email) { Notifications.show('warning', 'Validation', 'Please fill in all required fields.'); return; }
    const editId = document.getElementById('saveEmployeeBtn').getAttribute('data-edit-id');
    if (editId) {
      const idx = this.data.findIndex(e => e.id === editId);
      if (idx !== -1) {
        this.data[idx] = { ...this.data[idx], name: fn + ' ' + ln, email, role, dept, salary: salary ? '₹' + Number(salary).toLocaleString('en-IN') : this.data[idx].salary, initials: (fn[0] + ln[0]).toUpperCase() };
        Notifications.show('success', 'Employee Updated', `${fn} ${ln} has been updated.`);
      }
    } else {
      const newId = 'EMP' + String(this.data.length + 1).padStart(3, '0');
      const colors = ['#0d6efd','#7c3aed','#198754','#dc3545','#0d9488','#fd7e14'];
      this.data.unshift({ id: newId, name: fn + ' ' + ln, email, role, dept, status: 'Active', joined: new Date().toISOString().split('T')[0], salary: salary ? '₹' + Number(salary).toLocaleString('en-IN') : '₹0', initials: (fn[0] + ln[0]).toUpperCase(), color: colors[Math.floor(Math.random() * colors.length)] });
      Notifications.show('success', 'Employee Added', `${fn} ${ln} has been added successfully.`);
      Notifications.showBrowser('New Employee', `${fn} ${ln} joined the team!`);
    }
    this.filtered = [...this.data]; this.filter();
    Modal.close('employeeModal');
  },

  viewEmployee(id) {
    const emp = this.data.find(e => e.id === id); if (!emp) return;
    const modal = document.getElementById('viewEmployeeModal');
    if (!modal) return;
    modal.querySelector('.emp-detail-avatar').style.background = emp.color;
    modal.querySelector('.emp-detail-avatar').textContent = emp.initials;
    modal.querySelector('.emp-detail-name').textContent = emp.name;
    modal.querySelector('.emp-detail-role').textContent = emp.role + ' · ' + emp.dept;
    modal.querySelector('.emp-detail-id').textContent = emp.id;
    modal.querySelector('.emp-detail-email').textContent = emp.email;
    modal.querySelector('.emp-detail-status').textContent = emp.status;
    modal.querySelector('.emp-detail-joined').textContent = emp.joined;
    modal.querySelector('.emp-detail-salary').textContent = emp.salary;
    Modal.open('viewEmployeeModal');
  },

  editEmployee(id) {
    const emp = this.data.find(e => e.id === id); if (!emp) return;
    const [fn, ...lnParts] = emp.name.split(' ');
    document.getElementById('empFirstName').value = fn;
    document.getElementById('empLastName').value = lnParts.join(' ');
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empRole').value = emp.role;
    document.getElementById('empDept').value = emp.dept;
    document.getElementById('empModalTitle').innerHTML = '<i class="fas fa-user-edit" style="color:var(--primary);margin-right:8px;"></i>Edit Employee';
    document.getElementById('saveEmployeeBtn').setAttribute('data-edit-id', id);
    Modal.open('employeeModal');
  },

  confirmDelete(id) {
    const emp = this.data.find(e => e.id === id); if (!emp) return;
    const modal = document.getElementById('confirmModal');
    if (modal) {
      modal.querySelector('.confirm-modal-msg').textContent = `Are you sure you want to remove ${emp.name}? This cannot be undone.`;
      modal.querySelector('#confirmDeleteBtn').onclick = () => { this.deleteEmployee(id); Modal.close('confirmModal'); };
      Modal.open('confirmModal');
    }
  },

  deleteEmployee(id) {
    const emp = this.data.find(e => e.id === id);
    this.data = this.data.filter(e => e.id !== id);
    this.filtered = this.filtered.filter(e => e.id !== id);
    if (this.page > Math.ceil(this.filtered.length / this.perPage)) this.page = Math.max(1, this.page - 1);
    this.render();
    Notifications.show('danger', 'Employee Removed', `${emp?.name || 'Employee'} has been removed.`);
  },

  filter() {
    this.filtered = this.data.filter(e => {
      const q = this.search;
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
      const matchRole = !this.roleFilter || e.role === this.roleFilter || e.dept === this.roleFilter;
      return matchSearch && matchRole;
    });
    this.filtered.sort((a, b) => {
      const av = a[this.sortCol] || ''; const bv = b[this.sortCol] || '';
      return av.localeCompare(bv) * this.sortDir;
    });
    this.page = 1; this.render();
  },

  render() {
    const tbody = document.getElementById('empTableBody'); if (!tbody) return;
    const start = (this.page - 1) * this.perPage;
    const pageData = this.filtered.slice(start, start + this.perPage);
    if (pageData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-search" style="font-size:24px;margin-bottom:10px;display:block;"></i>No employees found</td></tr>';
    } else {
      tbody.innerHTML = pageData.map(e => `
        <tr>
          <td><div class="emp-info">
            <div class="emp-avatar-placeholder" style="background:${e.color}">${e.initials}</div>
            <div><div class="emp-name">${e.name}</div><div class="emp-email">${e.email}</div></div>
          </div></td>
          <td><span class="text-sm fw-600" style="color:var(--text-secondary)">${e.id}</span></td>
          <td><span class="badge-custom badge-primary">${e.role}</span></td>
          <td>${e.dept}</td>
          <td><span class="badge-custom ${e.status==='Active'?'badge-success':e.status==='On Leave'?'badge-warning':'badge-secondary'}">
            <span class="status-dot ${e.status==='Active'?'online':e.status==='On Leave'?'away':'offline'}"></span>${e.status}
          </span></td>
          <td>${e.salary}</td>
          <td><div class="action-btns">
            <button class="action-btn view" data-tooltip="View Profile" onclick="EmployeeTable.viewEmployee('${e.id}')" aria-label="View ${e.name}"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit" data-tooltip="Edit Employee" onclick="EmployeeTable.editEmployee('${e.id}')" aria-label="Edit ${e.name}"><i class="fas fa-pen"></i></button>
            <button class="action-btn" data-tooltip="Copy ID" data-copy="${e.id}" aria-label="Copy ID ${e.id}"><i class="fas fa-id-badge"></i></button>
            <button class="action-btn delete" data-tooltip="Remove" onclick="EmployeeTable.confirmDelete('${e.id}')" aria-label="Remove ${e.name}"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`).join('');
      // Rebind copy buttons in table rows
      tbody.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => ClipboardManager.copy(btn.getAttribute('data-copy'), btn));
      });
    }
    const info = document.getElementById('empPaginationInfo');
    if (info) info.textContent = `Showing ${this.filtered.length === 0 ? 0 : start + 1}–${Math.min(start + this.perPage, this.filtered.length)} of ${this.filtered.length}`;
    const pages = document.getElementById('empPaginationPages');
    if (pages) {
      const total = Math.max(1, Math.ceil(this.filtered.length / this.perPage));
      let html = `<button class="page-btn" onclick="EmployeeTable.goPage(${this.page-1})" ${this.page===1?'disabled':''} aria-label="Previous page">‹</button>`;
      for (let i = 1; i <= total; i++) html += `<button class="page-btn ${i===this.page?'active':''}" onclick="EmployeeTable.goPage(${i})" aria-label="Page ${i}">${i}</button>`;
      html += `<button class="page-btn" onclick="EmployeeTable.goPage(${this.page+1})" ${this.page===total?'disabled':''} aria-label="Next page">›</button>`;
      pages.innerHTML = html;
    }
  },

  goPage(p) {
    const max = Math.ceil(this.filtered.length / this.perPage);
    if (p < 1 || p > max) return;
    this.page = p; this.render();
  },

  exportCSV() {
    const headers = ['ID','Name','Email','Role','Department','Status','Joined','Salary'];
    const rows = this.filtered.map(e => [e.id, e.name, e.email, e.role, e.dept, e.status, e.joined, e.salary]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'employees.csv'; a.click();
    Notifications.show('success', 'Exported', 'Employee data downloaded as CSV.');
  }
};

// =============================================
// CLIENT MANAGEMENT
// =============================================
const ClientManager = {
  data: [
    { id: 'CLT001', name: 'TechNova Solutions', industry: 'Technology', contact: 'Suresh Babu', email: 'contact@technova.com', projects: 5, revenue: '₹12.4L', status: 'Active', initials: 'TN', color: '#0d6efd', meeting: 'Tomorrow 10 AM' },
    { id: 'CLT002', name: 'GlobalTech Corp', industry: 'Manufacturing', contact: 'Anand Rao', email: 'anand@globaltech.com', projects: 3, revenue: '₹8.7L', status: 'Active', initials: 'GT', color: '#198754', meeting: 'Mon 3 PM' },
    { id: 'CLT003', name: 'DataSync India', industry: 'Data Analytics', contact: 'Rekha Sharma', email: 'rekha@datasync.in', projects: 2, revenue: '₹5.2L', status: 'On Hold', initials: 'DS', color: '#7c3aed', meeting: 'Wed 11 AM' },
    { id: 'CLT004', name: 'Apex Retail Ltd', industry: 'Retail', contact: 'Mohan Das', email: 'mohan@apexretail.com', projects: 4, revenue: '₹9.1L', status: 'Active', initials: 'AR', color: '#fd7e14', meeting: 'Thu 2 PM' },
    { id: 'CLT005', name: 'FinSmart Banking', industry: 'Finance', contact: 'Lata Nair', email: 'lata@finsmart.com', projects: 6, revenue: '₹18.5L', status: 'Active', initials: 'FB', color: '#0d9488', meeting: 'Fri 4 PM' },
    { id: 'CLT006', name: 'MediCare Plus', industry: 'Healthcare', contact: 'Dr. Raj Kumar', email: 'raj@medicare.com', projects: 2, revenue: '₹6.3L', status: 'Inactive', initials: 'MC', color: '#dc3545', meeting: 'Next Mon' },
  ],
  init() {
    this.render();
    document.getElementById('clientSearch')?.addEventListener('input', (e) => this.renderSearch(e.target.value));
    document.getElementById('addClientBtn')?.addEventListener('click', () => Modal.open('addClientModal'));
    document.getElementById('saveClientBtn')?.addEventListener('click', () => this.saveClient());
  },
  render() {
    const grid = document.getElementById('clientGrid'); if (!grid) return;
    grid.innerHTML = this.data.map(c => `
      <div class="client-card animate-in">
        <div class="client-logo" style="background:${c.color}">${c.initials}</div>
        <div class="client-name">${c.name}</div>
        <div class="client-industry">${c.industry}</div>
        <div class="client-stats">
          <div style="text-align:center"><div class="client-stat-val">${c.projects}</div><div class="client-stat-label">Projects</div></div>
          <div style="text-align:center"><div class="client-stat-val">${c.revenue}</div><div class="client-stat-label">Revenue</div></div>
        </div>
        <span class="badge-custom ${c.status==='Active'?'badge-success':c.status==='On Hold'?'badge-warning':'badge-secondary'}" style="margin-bottom:10px;">
          <span class="status-dot ${c.status==='Active'?'online':c.status==='On Hold'?'away':'offline'}"></span>${c.status}
        </span>
        <div class="client-meeting"><i class="fas fa-calendar-alt"></i> ${c.meeting}</div>
        <div class="client-actions mt-2">
          <button class="btn-custom btn-outline btn-sm" onclick="ClientManager.viewClient('${c.id}')" aria-label="View ${c.name}"><i class="fas fa-eye"></i> View</button>
          <button class="btn-custom btn-primary btn-sm" data-copy="${c.email}" aria-label="Copy link for ${c.name}"><i class="fas fa-link"></i> Copy</button>
        </div>
      </div>`).join('');
    // Bind copy buttons
    grid.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => ClipboardManager.copy(btn.getAttribute('data-copy'), btn));
    });
  },
  renderSearch(q) {
    const filtered = q ? this.data.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase())) : this.data;
    const tempData = this.data; this.data = filtered; this.render(); this.data = tempData;
  },
  viewClient(id) {
    const c = this.data.find(cl => cl.id === id); if (!c) return;
    Notifications.show('info', c.name, `Contact: ${c.contact} · ${c.projects} projects · ${c.revenue}`);
  },
  saveClient() {
    const name = document.getElementById('clientName')?.value.trim();
    const industry = document.getElementById('clientIndustry')?.value.trim();
    const contact = document.getElementById('clientContact')?.value.trim();
    const email = document.getElementById('clientEmail')?.value.trim();
    if (!name || !email) { Notifications.show('warning', 'Validation', 'Please fill in all required fields.'); return; }
    const colors = ['#0d6efd','#7c3aed','#198754','#dc3545','#0d9488','#fd7e14'];
    this.data.push({ id: 'CLT' + String(this.data.length + 1).padStart(3,'0'), name, industry: industry || 'General', contact: contact || '-', email, projects: 0, revenue: '₹0', status: 'Active', initials: name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2), color: colors[Math.floor(Math.random()*colors.length)], meeting: 'TBD' });
    this.render(); Modal.close('addClientModal');
    Notifications.show('success', 'Client Added', `${name} has been added to your client list.`);
    ['clientName','clientIndustry','clientContact','clientEmail'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  }
};

// =============================================
// PROJECT TRACKING - Drag & Drop
// =============================================
const ProjectManager = {
  data: [
    { id: 'PRJ001', title: 'NexaCRM Module', desc: 'Customer relationship management system', status: 'In Progress', progress: 72, deadline: '2024-06-30', priority: 'High', team: ['AS','PR','KK'], color: '#0d6efd' },
    { id: 'PRJ002', title: 'Mobile App v2.0', desc: 'iOS & Android application redesign', status: 'In Progress', progress: 45, deadline: '2024-07-15', priority: 'High', team: ['RV','DN'], color: '#7c3aed' },
    { id: 'PRJ003', title: 'Analytics Dashboard', desc: 'Real-time business intelligence platform', status: 'Completed', progress: 100, deadline: '2024-05-01', priority: 'Medium', team: ['AS','AK'], color: '#198754' },
    { id: 'PRJ004', title: 'API Gateway', desc: 'Microservices integration gateway', status: 'Pending', progress: 15, deadline: '2024-08-01', priority: 'Medium', team: ['VR','KK'], color: '#fd7e14' },
    { id: 'PRJ005', title: 'HR Portal', desc: 'Employee self-service portal', status: 'In Progress', progress: 60, deadline: '2024-06-20', priority: 'Low', team: ['SP','MI'], color: '#0d9488' },
    { id: 'PRJ006', title: 'E-Commerce Platform', desc: 'B2B e-commerce solution', status: 'Pending', progress: 5, deadline: '2024-09-01', priority: 'High', team: ['AS','PR','RV'], color: '#dc3545' },
  ],
  teamColors: { AS: '#0d6efd', PR: '#7c3aed', KK: '#198754', SP: '#e67e22', RV: '#0d9488', DN: '#dc3545', AK: '#20c997', MI: '#6c757d', VR: '#fd7e14' },
  init() {
    this.render();
    document.getElementById('addProjectBtn')?.addEventListener('click', () => Modal.open('addProjectModal'));
    document.getElementById('saveProjectBtn')?.addEventListener('click', () => this.saveProject());
    document.getElementById('projectSearch')?.addEventListener('input', (e) => this.filterBySearch(e.target.value));
  },
  filterBySearch(q) {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => { card.style.display = q && !card.dataset.title.toLowerCase().includes(q.toLowerCase()) ? 'none' : ''; });
  },
  render() {
    const statuses = ['In Progress', 'Completed', 'Pending'];
    statuses.forEach(status => {
      const key = status.toLowerCase().replace(' ', '-');
      const col = document.getElementById('proj-col-' + key);
      if (!col) return;
      const filtered = this.data.filter(p => p.status === status);
      const count = col.previousElementSibling?.querySelector('.proj-count');
      if (count) count.textContent = filtered.length;
      col.innerHTML = filtered.map(p => `
        <div class="project-card draggable-card animate-in" id="${p.id}" data-title="${p.title}" draggable="true">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <span class="badge-custom ${p.priority==='High'?'badge-danger':p.priority==='Medium'?'badge-warning':'badge-secondary'}">${p.priority}</span>
            <button class="action-btn" onclick="ProjectManager.viewProject('${p.id}')" aria-label="View project"><i class="fas fa-ellipsis-v"></i></button>
          </div>
          <div style="width:10px;height:10px;border-radius:50%;background:${p.color};margin-bottom:8px;"></div>
          <div class="project-title">${p.title}</div>
          <div class="project-desc">${p.desc}</div>
          <div class="project-meta">
            <div class="project-assignees">${p.team.map(t => `<div class="project-assignee" style="background:${this.teamColors[t]||'#0d6efd'}" title="${t}">${t}</div>`).join('')}</div>
            <div class="project-deadline"><i class="fas fa-calendar"></i>${p.deadline}</div>
          </div>
          <div style="margin-bottom:6px;"><div class="progress-custom"><div class="progress-bar-custom" style="background:${p.color};width:${p.progress}%"></div></div></div>
          <div style="font-size:11.5px;color:var(--text-muted);text-align:right;font-weight:600;">${p.progress}% complete</div>
        </div>`).join('');
    });
    this.initDragDrop();
  },
  viewProject(id) {
    const p = this.data.find(pr => pr.id === id); if (!p) return;
    Notifications.show('info', p.title, `Progress: ${p.progress}% · Deadline: ${p.deadline} · Priority: ${p.priority}`);
  },
  saveProject() {
    const title = document.getElementById('projectTitle')?.value.trim();
    const desc = document.getElementById('projectDesc')?.value.trim();
    const deadline = document.getElementById('projectDeadline')?.value;
    const priority = document.getElementById('projectPriority')?.value || 'Medium';
    if (!title) { Notifications.show('warning', 'Validation', 'Project title is required.'); return; }
    const colors = ['#0d6efd','#7c3aed','#198754','#dc3545','#0d9488','#fd7e14'];
    this.data.unshift({ id: 'PRJ' + String(this.data.length + 1).padStart(3,'0'), title, desc: desc || '-', status: 'Pending', progress: 0, deadline: deadline || 'TBD', priority, team: ['MK'], color: colors[Math.floor(Math.random()*colors.length)] });
    this.render(); Modal.close('addProjectModal');
    Notifications.show('success', 'Project Created', `${title} has been added to your board.`);
    ['projectTitle','projectDesc','projectDeadline'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  },
  initDragDrop() {
    document.querySelectorAll('.draggable-card').forEach(card => {
      card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', card.id); card.style.opacity = '0.5'; });
      card.addEventListener('dragend', () => { card.style.opacity = ''; });
    });
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault(); zone.classList.remove('dragover');
        const id = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(id); if (!card) return;
        const newStatus = zone.getAttribute('data-status');
        const proj = this.data.find(p => p.id === id);
        if (proj && newStatus) { proj.status = newStatus; if(newStatus==='Completed') proj.progress = 100; this.render(); Notifications.show('success', 'Project Moved', `${proj.title} moved to ${newStatus}.`); }
      });
    });
  }
};

// =============================================
// NOTIFICATIONS PAGE
// =============================================
const NotificationsPage = {
  items: [
    { type: 'success', icon: 'fa-check-circle', bg: '#d1f2e8', color: '#198754', title: 'Project Completed', desc: 'Analytics Dashboard has been marked complete.', time: '5 minutes ago', unread: true },
    { type: 'warning', icon: 'fa-exclamation-triangle', bg: '#fff3cd', color: '#856404', title: 'Project Deadline Approaching', desc: 'NexaCRM Module is due in 2 days. Please review.', time: '1 hour ago', unread: true },
    { type: 'info', icon: 'fa-user-plus', bg: '#d4edff', color: '#0d6efd', title: 'New Employee Onboarded', desc: 'Rahul Verma joined the Engineering department.', time: '3 hours ago', unread: true },
    { type: 'danger', icon: 'fa-exclamation-circle', bg: '#fde8e8', color: '#dc3545', title: 'Invoice Overdue', desc: 'TechNova Solutions invoice ₹2.5L is overdue by 5 days.', time: '5 hours ago', unread: false },
    { type: 'info', icon: 'fa-comment', bg: '#e8f0fe', color: '#0d6efd', title: 'New Message', desc: 'Kiran Kumar sent you a message about the sprint review.', time: 'Yesterday', unread: false },
    { type: 'success', icon: 'fa-thumbs-up', bg: '#d1f2e8', color: '#198754', title: 'Client Feedback Received', desc: 'GlobalTech Corp gave a 5-star rating for delivery.', time: '2 days ago', unread: false },
    { type: 'warning', icon: 'fa-clock', bg: '#fff3cd', color: '#856404', title: 'Meeting Reminder', desc: 'Client review with GlobalTech at 3 PM today.', time: '2 days ago', unread: false },
  ],
  init() {
    this.render();
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
      this.items.forEach(i => i.unread = false); this.render();
      Notifications.show('success', 'All Read', 'All notifications marked as read.');
    });
    document.getElementById('clearAllNotifBtn')?.addEventListener('click', () => {
      this.items = []; this.render();
      Notifications.show('info', 'Cleared', 'All notifications cleared.');
    });
  },
  render() {
    const list = document.getElementById('notifPageList'); if (!list) return;
    if (this.items.length === 0) { list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-bell-slash" style="font-size:36px;margin-bottom:12px;display:block;"></i>No notifications</div>'; return; }
    list.innerHTML = this.items.map((item, idx) => `
      <div class="notif-panel-item ${item.unread ? 'notif-unread' : ''}" style="padding:14px 20px;cursor:pointer;" onclick="NotificationsPage.markRead(${idx})">
        <div class="notif-panel-icon" style="background:${item.bg};color:${item.color}"><i class="fas ${item.icon}"></i></div>
        <div style="flex:1;">
          <div class="notif-panel-title" style="display:flex;align-items:center;gap:8px;">${item.title}${item.unread ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--primary);display:inline-block;"></span>' : ''}</div>
          <div class="notif-panel-desc">${item.desc}</div>
          <div class="notif-panel-time"><i class="fas fa-clock"></i> ${item.time}</div>
        </div>
        <button class="action-btn delete" onclick="event.stopPropagation();NotificationsPage.remove(${idx})" aria-label="Remove notification"><i class="fas fa-times"></i></button>
      </div>`).join('');
    const unreadCount = this.items.filter(i => i.unread).length;
    const badge = document.getElementById('notifUnreadBadge');
    if (badge) badge.textContent = unreadCount || '';
  },
  markRead(idx) { this.items[idx].unread = false; this.render(); },
  remove(idx) { this.items.splice(idx, 1); this.render(); }
};

// =============================================
// SETTINGS PAGE - Full functionality
// =============================================
const Settings = {
  init() {
    // Profile save
    document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
      const name = document.getElementById('settingsName')?.value;
      const email = document.getElementById('settingsEmail')?.value;
      if (!name || !email) { Notifications.show('warning', 'Validation', 'Please fill in all fields.'); return; }
      Storage.set('profileName', name); Storage.set('profileEmail', email);
      document.querySelectorAll('.admin-name').forEach(el => el.textContent = name);
      Notifications.show('success', 'Profile Saved', 'Your profile has been updated successfully.');
      Notifications.showBrowser('Profile Updated', 'Your NexaWorks profile was saved.');
    });
    // Password update
    document.getElementById('updatePasswordBtn')?.addEventListener('click', () => {
      const curr = document.getElementById('currentPass')?.value;
      const newP = document.getElementById('newPass')?.value;
      const conf = document.getElementById('confirmPass')?.value;
      if (!curr || !newP || !conf) { Notifications.show('warning', 'Validation', 'Please fill all password fields.'); return; }
      if (newP !== conf) { Notifications.show('danger', 'Mismatch', 'New passwords do not match.'); return; }
      if (newP.length < 8) { Notifications.show('warning', 'Weak Password', 'Password must be at least 8 characters.'); return; }
      Notifications.show('success', 'Password Updated', 'Your password has been changed successfully.');
      ['currentPass','newPass','confirmPass'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    });
    // Change avatar
    document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
      Notifications.show('info', 'Avatar', 'Avatar upload coming soon! Prepare a square image.');
    });
    // Compact sidebar toggle in settings
    document.getElementById('compactSidebarToggle')?.addEventListener('change', () => Sidebar.toggle());
    // Load saved profile
    const savedName = Storage.get('profileName');
    const savedEmail = Storage.get('profileEmail');
    if (savedName) { const el = document.getElementById('settingsName'); if(el) el.value = savedName; }
    if (savedEmail) { const el = document.getElementById('settingsEmail'); if(el) el.value = savedEmail; }
  }
};

// =============================================
// GLOBAL SEARCH
// =============================================
const GlobalSearch = {
  init() {
    const input = document.querySelector('.topbar-search input');
    if (!input) return;
    const wrapper = document.querySelector('.topbar-search');
    let resultsEl = null;
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (resultsEl) { resultsEl.remove(); resultsEl = null; }
      if (!q || q.length < 2) return;
      const results = this.search(q);
      if (!results.length) return;
      resultsEl = document.createElement('div');
      resultsEl.className = 'search-results';
      resultsEl.innerHTML = results.map(r => `<div class="search-result-item" onclick="${r.action}"><div class="search-result-icon" style="background:${r.bg};color:${r.color}"><i class="fas ${r.icon}"></i></div><div><div class="search-result-text">${r.title}</div><div class="search-result-sub">${r.type}</div></div></div>`).join('');
      wrapper.style.position = 'relative'; wrapper.appendChild(resultsEl);
    });
    document.addEventListener('click', (e) => { if (resultsEl && !wrapper.contains(e.target)) { resultsEl.remove(); resultsEl = null; } });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && resultsEl) { resultsEl.remove(); resultsEl = null; input.value = ''; } });
  },
  search(q) {
    const results = [];
    const pages = [
      { name: 'Dashboard', page: 'dashboard', icon: 'fa-th-large', color: '#0d6efd', bg: '#e8f0fe' },
      { name: 'Employees', page: 'employees', icon: 'fa-users', color: '#198754', bg: '#d1f2e8' },
      { name: 'Clients', page: 'clients', icon: 'fa-briefcase', color: '#7c3aed', bg: '#ede9ff' },
      { name: 'Projects', page: 'projects', icon: 'fa-project-diagram', color: '#fd7e14', bg: '#fff3e0' },
      { name: 'Settings', page: 'settings', icon: 'fa-cog', color: '#6c757d', bg: '#f0f3f8' },
    ];
    pages.filter(p => p.name.toLowerCase().includes(q)).forEach(p => results.push({ title: p.name, type: 'Page', icon: p.icon, color: p.color, bg: p.bg, action: `Nav.navigate('${p.page}');document.querySelector('.topbar-search input').value='';` }));
    EmployeeTable.data.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)).slice(0,3).forEach(e => results.push({ title: e.name, type: `Employee · ${e.role}`, icon: 'fa-user', color: e.color, bg: e.color + '22', action: `Nav.navigate('employees');` }));
    ClientManager.data.filter(c => c.name.toLowerCase().includes(q)).slice(0,2).forEach(c => results.push({ title: c.name, type: `Client · ${c.industry}`, icon: 'fa-briefcase', color: c.color, bg: c.color + '22', action: `Nav.navigate('clients');` }));
    return results.slice(0, 8);
  }
};

// =============================================
// CLOCK & DATE
// =============================================
function updateClock() {
  const el = document.getElementById('liveClock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// =============================================
// DEADLINE REMINDERS - Notification API
// =============================================
function scheduleDeadlineReminders() {
  setTimeout(() => {
    Notifications.show('warning', 'Project Deadline', 'NexaCRM Module — deadline in 2 days!');
    Notifications.showBrowser('Project Deadline', 'NexaCRM module deadline approaching!');
  }, 5000);
  setTimeout(() => {
    Notifications.show('info', 'New Message', 'Kiran Kumar sent you a message.');
  }, 12000);
}

// =============================================
// FULLSCREEN API (Bonus)
// =============================================
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    Notifications.show('info', 'Fullscreen', 'Press Escape or click again to exit.');
  } else {
    document.exitFullscreen();
    Notifications.show('info', 'Fullscreen', 'Exited fullscreen mode.');
  }
});

// =============================================
// THEME COLOR PICKER - LocalStorage
// =============================================
function initThemeColors() {
  const colors = { blue: '#0d6efd', green: '#198754', purple: '#7c3aed', red: '#dc3545', orange: '#fd7e14', teal: '#0d9488' };
  const saved = Storage.get('themeColor', 'blue');
  applyThemeColor(colors[saved] || colors.blue, false);
  document.querySelectorAll('[data-theme-color]').forEach(btn => {
    const key = btn.getAttribute('data-theme-color');
    if (key === saved) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-theme-color]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Storage.set('themeColor', key);
      applyThemeColor(colors[key]);
      Notifications.show('success', 'Theme Updated', 'Accent color changed successfully!');
    });
  });
}

function applyThemeColor(color, notify = true) {
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--primary-dark', shadeColor(color, -20));
  document.documentElement.style.setProperty('--primary-light', hexToRgba(color, 0.12));
}

function shadeColor(color, pct) {
  const num = parseInt(color.replace('#',''), 16);
  const amt = Math.round(2.55 * pct);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#',''), 16);
  return `rgba(${num>>16},${(num>>8)&0xff},${num&0xff},${alpha})`;
}

// =============================================
// LOGOUT
// =============================================
function initLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    Session.set('activePage', 'dashboard');
    Notifications.show('info', 'Logged Out', 'You have been logged out. Redirecting...');
    setTimeout(() => { window.location.reload(); }, 1500);
  });
}

// =============================================
// HELP & SUPPORT
// =============================================
function initHelp() {
  document.getElementById('helpBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    Notifications.show('info', 'Help & Support', 'Documentation and support portal opening soon.');
  });
}

// =============================================
// SUBMENU NAVIGATION ITEMS (Reports, Calendar)
// =============================================
function initSubmenuItems() {
  document.querySelectorAll('.submenu .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      Notifications.show('info', link.textContent.trim(), 'This section is coming soon!');
    });
  });
}

// =============================================
// SPEECH RECOGNITION (Bonus)
// =============================================
function initSpeechRecognition() {
  const btn = document.getElementById('speechBtn');
  if (!btn) return;
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    btn.style.display = 'none'; return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false; recognition.lang = 'en-IN';
  let listening = false;
  btn.addEventListener('click', () => {
    if (!listening) { recognition.start(); listening = true; btn.style.color = '#dc3545'; btn.innerHTML = '<i class="fas fa-microphone-slash"></i>'; Notifications.show('info', 'Listening...', 'Speak a page name: Dashboard, Employees, etc.'); }
    else { recognition.stop(); }
  });
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();
    const pages = { 'dashboard':true, 'employees':true, 'clients':true, 'projects':true, 'notifications':true, 'settings':true };
    const found = Object.keys(pages).find(p => text.includes(p));
    if (found) { Nav.navigate(found); Notifications.show('success', 'Voice Command', `Navigated to ${found}.`); }
    else Notifications.show('warning', 'Not Understood', `Said: "${text}". Try a page name.`);
  };
  recognition.onend = () => { listening = false; btn.style.color = ''; btn.innerHTML = '<i class="fas fa-microphone"></i>'; };
}

// =============================================
// CAMERA ACCESS (Bonus)
// =============================================
function initCamera() {
  document.getElementById('cameraBtn')?.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      Notifications.show('success', 'Camera Access', 'Camera permission granted successfully!');
    } catch(e) {
      Notifications.show('danger', 'Camera Access', 'Camera access denied or not available.');
    }
  });
}

// =============================================
// WEB WORKER (Bonus) - Background data simulation
// =============================================
function initWebWorker() {
  if (!window.Worker) return;
  const blob = new Blob([`
    let count = 0;
    setInterval(() => { count++; self.postMessage({ type: 'tick', count }); }, 30000);
  `], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  worker.onmessage = (e) => {
    if (e.data.type === 'tick') console.log('[Worker] Background tick:', e.data.count);
  };
}

// =============================================
// PRINT / EXPORT
// =============================================
function initExportPDF() {
  document.getElementById('exportPDFBtn')?.addEventListener('click', () => {
    Notifications.show('info', 'Export PDF', 'Use Ctrl+P (or Cmd+P) to print/save as PDF.');
    setTimeout(() => window.print(), 800);
  });
}

// =============================================
// INIT ALL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  Sidebar.init();
  Nav.init();
  ThemeManager.init();
  Dropdowns.init();
  Modal.init();
  ClipboardManager.init();
  Notifications.init();
  GeoLocation.init();
  EmployeeTable.init();
  ClientManager.init();
  ProjectManager.init();
  NotificationsPage.init();
  Settings.init();
  GlobalSearch.init();
  initThemeColors();
  initLogout();
  initHelp();
  initSubmenuItems();
  initSpeechRecognition();
  initCamera();
  initWebWorker();
  initExportPDF();
  scheduleDeadlineReminders();
  setTimeout(() => Charts.render(), 300);
});