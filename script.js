  /* ─── SPA ROUTER ─── */
  function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    window.scrollTo(0, 0);
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function goToWorkspace() {
    const session = getSession();
    if (session) {
      initWorkspace(session);
      showView('workspace');
    } else {
      showView('login');
    }
  }

  /* ─── AUTH HELPERS ─── */
  function getSession() {
    try { return JSON.parse(localStorage.getItem('pb_session') || 'null'); } catch { return null; }
  }
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('pb_users') || '[]'); } catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem('pb_users', JSON.stringify(u)); }

  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return h.toString(36);
  }

  /* ─── AUTH TAB SWITCH ─── */
  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('auth-login').style.display    = isLogin ? 'block' : 'none';
    document.getElementById('auth-register').style.display = isLogin ? 'none'  : 'block';
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);
    clearAlerts();
  }

  function clearAlerts() {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('visible'));
  }
  function showAlert(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg; el.classList.add('visible');
  }

  /* ─── PASSWORD TOGGLE ─── */
  function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
      ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  /* ─── PASSWORD STRENGTH ─── */
  function updateStrength(pw) {
    const bar = document.getElementById('strength-bar');
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    bar.style.display = 'block'; label.style.display = 'block';
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      {pct:'20%',color:'#c0392b',text:'Weak'},{pct:'40%',color:'#e67e22',text:'Fair'},
      {pct:'60%',color:'#f1c40f',text:'Good'},{pct:'80%',color:'#2ecc71',text:'Strong'},
      {pct:'100%',color:'#27ae60',text:'Very Strong'}
    ];
    const lvl = pw.length ? (levels[Math.min(score-1,4)] || levels[0]) : {pct:'0%',color:'',text:''};
    fill.style.width = lvl.pct; fill.style.background = lvl.color;
    label.textContent = lvl.text; label.style.color = lvl.color;
  }

  /* ─── LOGIN ─── */
  function handleLogin() {
    clearAlerts();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pw    = document.getElementById('login-password').value;
    if (!email || !pw) return showAlert('login-error', 'Please fill in all fields.');
    const user = getUsers().find(u => u.email === email && u.passwordHash === simpleHash(pw));
    if (!user) return showAlert('login-error', 'Incorrect email or password.');
    const session = { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
    localStorage.setItem('pb_session', JSON.stringify(session));
    showAlert('login-success', `Welcome back, ${user.firstName}. Loading workspace...`);
    setTimeout(() => { initWorkspace(session); showView('workspace'); clearAlerts(); }, 1100);
  }

  /* ─── REGISTER ─── */
  /* ─── ACCESS CODE (change this to whatever word you want) ─── */
  const ACCESS_CODE = 'basis2025';

  function handleRegister() {
    clearAlerts();
    const first = document.getElementById('reg-first').value.trim();
    const last  = document.getElementById('reg-last').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const role  = document.getElementById('reg-role').value.trim();
    const pw    = document.getElementById('reg-password').value;
    const conf  = document.getElementById('reg-confirm').value;
    const code  = document.getElementById('reg-access-code').value.trim();
    if (!first||!last||!email||!role||!pw||!conf||!code) return showAlert('reg-error','Please fill in all fields.');
    if (code !== ACCESS_CODE) return showAlert('reg-error','Invalid access code. Please contact Project Basis.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAlert('reg-error','Please enter a valid email address.');
    if (pw.length < 8) return showAlert('reg-error','Password must be at least 8 characters.');
    if (pw !== conf) return showAlert('reg-error','Passwords do not match.');
    const users = getUsers();
    if (users.find(u => u.email === email)) return showAlert('reg-error','An account with this email already exists.');
    users.push({ email, firstName: first, lastName: last, role, passwordHash: simpleHash(pw) });
    saveUsers(users);
    const session = { email, firstName: first, lastName: last, role };
    localStorage.setItem('pb_session', JSON.stringify(session));
    showAlert('reg-success', `Account created. Welcome, ${first}!`);
    setTimeout(() => { initWorkspace(session); showView('workspace'); clearAlerts(); }, 1200);
  }

  /* ─── SIGN OUT ─── */
  function signOut() {
    // auto-save before leaving
    try { localStorage.setItem(getStorageKey(), JSON.stringify(collectReport())); } catch(e) {}
    localStorage.removeItem('pb_session');
    showView('main');
  }

  /* ─── CONTACT FORM ─── */
  function handleContact(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-send');
    btn.innerHTML = 'Message Sent ✓';
    btn.style.background = '#2d6a2d';
    setTimeout(() => {
      btn.innerHTML = 'Send Message <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      btn.style.background = '';
    }, 3000);
  }

  /* ─── WORKSPACE INIT ─── */
  let currentSession = null;

  function initWorkspace(session) {
    currentSession = session;
    document.getElementById('user-avatar').textContent = (session.firstName[0] + session.lastName[0]).toUpperCase();
    document.getElementById('user-name').textContent = session.firstName + ' ' + session.lastName;
    const dateInput = document.getElementById('prod-date');
    if (!dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
    loadReport();
  }

  /* ─── TOAST ─── */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ─── MAG LOG ─── */
  let magCount = 0;
  const CHECKSUMS = ['MD5','SHA-1','SHA-256','xxHash'];
  const METHODS   = ['Hand Delivery','FTP / SFTP','Frame.io','Aspera','Hard Drive — Shipped'];

  function addMagRow(data = {}) {
    magCount++;
    const n = magCount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-num">${n}</td>
      <td><input class="ti" style="width:72px"  placeholder="A85"       value="${data.magId||''}"></td>
      <td><input class="ti" style="width:100px" placeholder="A Cam"     value="${data.camera||''}"></td>
      <td><input class="ti" style="width:104px" placeholder="Alexa SXR" value="${data.mediaType||''}"></td>
      <td><input class="ti" style="width:52px"  placeholder="0"         value="${data.clips||''}"></td>
      <td><input class="ti" style="width:80px"  placeholder="0m 0s"     value="${data.duration||''}"></td>
      <td><input class="ti" style="width:72px"  placeholder="0.00"      value="${data.gbs||''}"></td>
      <td><span class="ws-badge clickable" onclick="cycleChecksum(this)">${data.checksum||'MD5'}</span></td>
      <td><button class="check-btn${data.lto      ?' done':''}" onclick="toggleCheck(this)">${data.lto      ?'✓':'×'}</button></td>
      <td><button class="check-btn${data.dailies  ?' done':''}" onclick="toggleCheck(this)">${data.dailies  ?'✓':'×'}</button></td>
      <td><button class="check-btn${data.editorial?' done':''}" onclick="toggleCheck(this)">${data.editorial?'✓':'×'}</button></td>
      <td><button class="check-btn${data.frameio  ?' done':''}" onclick="toggleCheck(this)">${data.frameio  ?'✓':'×'}</button></td>
      <td><input class="ti" style="width:130px" placeholder="Notes..." value="${data.notes||''}"></td>
      <td><button class="delete-btn" onclick="deleteRow(this,'mag-body')" title="Remove"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td>
    `;
    document.getElementById('mag-body').appendChild(tr);
  }

  function cycleChecksum(el) {
    const i = CHECKSUMS.indexOf(el.textContent);
    el.textContent = CHECKSUMS[(i + 1) % CHECKSUMS.length];
  }

  /* ─── DELIVERY LOG ─── */
  let deliveryCount = 0;

  function addDeliveryRow(data = {}) {
    deliveryCount++;
    const n = deliveryCount;
    const methodIdx = Math.max(0, METHODS.indexOf(data.method));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-num">${n}</td>
      <td><input class="ti" style="width:110px" placeholder="PB-D01-EDIT"            value="${data.driveId||''}"></td>
      <td><input class="ti" style="width:180px" placeholder="Day 1 ProRes HQ + Audio" value="${data.contents||''}"></td>
      <td><input class="ti" style="width:160px" placeholder="Pacific Post / T. Chen"  value="${data.deliveredTo||''}"></td>
      <td><span class="ws-badge clickable" data-method="${methodIdx}" onclick="cycleMethod(this)">${METHODS[methodIdx]}</span></td>
      <td><input class="ti" style="width:130px" placeholder="MM/DD H:MMpm"           value="${data.datetime||''}"></td>
      <td><input class="ti" style="width:140px" placeholder="Name — signed"           value="${data.receivedBy||''}"></td>
      <td><input class="ti" style="width:130px" placeholder="Notes..."                value="${data.notes||''}"></td>
      <td><button class="delete-btn" onclick="deleteRow(this,'delivery-body')" title="Remove"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td>
    `;
    document.getElementById('delivery-body').appendChild(tr);
  }

  function cycleMethod(el) {
    let i = parseInt(el.dataset.method);
    i = (i + 1) % METHODS.length;
    el.dataset.method = i; el.textContent = METHODS[i];
  }

  function toggleCheck(btn) {
    btn.classList.toggle('done');
    btn.textContent = btn.classList.contains('done') ? '✓' : '×';
  }

  function deleteRow(btn, tbodyId) {
    btn.closest('tr').remove();
    document.querySelectorAll(`#${tbodyId} tr`).forEach((tr, i) => {
      tr.querySelector('.cell-num').textContent = i + 1;
    });
  }

  /* ─── SAVE / LOAD ─── */
  function getStorageKey() {
    const date = document.getElementById('prod-date').value;
    return `pb_report_${currentSession ? currentSession.email : 'anon'}_${date}`;
  }

  function collectReport() {
    const mags = [];
    document.querySelectorAll('#mag-body tr').forEach(tr => {
      const inp = tr.querySelectorAll('input.ti');
      const chk = tr.querySelectorAll('.check-btn');
      mags.push({
        magId: inp[0].value, camera: inp[1].value, mediaType: inp[2].value,
        clips: inp[3].value, duration: inp[4].value, gbs: inp[5].value,
        checksum: tr.querySelector('.ws-badge').textContent,
        lto: chk[0].classList.contains('done'), dailies: chk[1].classList.contains('done'),
        editorial: chk[2].classList.contains('done'), frameio: chk[3].classList.contains('done'),
        notes: inp[6].value,
      });
    });
    const deliveries = [];
    document.querySelectorAll('#delivery-body tr').forEach(tr => {
      const inp = tr.querySelectorAll('input.ti');
      deliveries.push({
        driveId: inp[0].value, contents: inp[1].value, deliveredTo: inp[2].value,
        method: tr.querySelector('.ws-badge').textContent,
        datetime: inp[3].value, receivedBy: inp[4].value, notes: inp[5].value,
      });
    });
    return { date: document.getElementById('prod-date').value, notes: document.getElementById('daily-notes').value, mags, deliveries };
  }

  function saveReport() {
    localStorage.setItem(getStorageKey(), JSON.stringify(collectReport()));
    showToast('Report saved ✓');
  }

  function loadReport() {
    document.getElementById('mag-body').innerHTML = '';
    document.getElementById('delivery-body').innerHTML = '';
    magCount = 0; deliveryCount = 0;
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const report = JSON.parse(raw);
      report.mags.forEach(m => addMagRow(m));
      report.deliveries.forEach(d => addDeliveryRow(d));
      document.getElementById('daily-notes').value = report.notes || '';
    }
    if (!document.querySelector('#mag-body tr'))      addMagRow();
    if (!document.querySelector('#delivery-body tr')) addDeliveryRow();
  }

  function exportCSV() {
    const report = collectReport();
    const who = currentSession ? `${currentSession.firstName} ${currentSession.lastName} (${currentSession.role})` : 'Unknown';
    let csv = `Project Basis — Daily Report\nProduction Date: ${report.date}\nPrepared by: ${who}\n\n`;
    csv += 'MAG LOG\n';
    csv += ['#','Mag ID','Camera','Media Type','Clips','Duration','GBs','Checksum','LTO','Dailies','Editorial','Frame.io','Notes'].map(h=>`"${h}"`).join(',') + '\n';
    report.mags.forEach((m,i) => {
      csv += [i+1,m.magId,m.camera,m.mediaType,m.clips,m.duration,m.gbs,m.checksum,
        m.lto?'✓':'',m.dailies?'✓':'',m.editorial?'✓':'',m.frameio?'✓':'',m.notes
      ].map(v=>`"${v}"`).join(',') + '\n';
    });
    csv += '\nDELIVERY LOG\n';
    csv += ['#','Drive Label/ID','Contents','Delivered To','Method','Date/Time','Received By','Notes'].map(h=>`"${h}"`).join(',') + '\n';
    report.deliveries.forEach((d,i) => {
      csv += [i+1,d.driveId,d.contents,d.deliveredTo,d.method,d.datetime,d.receivedBy,d.notes
      ].map(v=>`"${v}"`).join(',') + '\n';
    });
    csv += '\nNOTES\n' + report.notes;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    a.download = `PB-Report-${report.date}.csv`;
    a.click();
    showToast('CSV exported ✓');
  }

  /* ─── AUTO-SAVE ON LEAVE ─── */
  window.addEventListener('beforeunload', () => {
    if (currentSession) {
      try { localStorage.setItem(getStorageKey(), JSON.stringify(collectReport())); } catch(e) {}
    }
  });

  /* ─── INIT: check for existing session ─── */
  (function() {
    const session = getSession();
    if (session) {
      // Session exists — workspace link goes directly to workspace
      currentSession = session;
    }
  })();


  /* ─── WORKSPACE MAIN TAB SWITCHING ─── */
  function switchWsTab(name) {
    const mainTabs = ['reports','preproduction','postproduction','contract'];
    document.querySelectorAll('.ws-tab').forEach((t, i) => {
      t.classList.toggle('active', mainTabs[i] === name);
    });
    document.querySelectorAll('#view-workspace .ws-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === 'tab-' + name);
    });
  }

  /* ─── WORKSPACE SUB-TAB SWITCHING (Production Reports) ─── */
  function switchWsSubTab(name) {
    const subTabs = ['daily','completion'];
    document.querySelectorAll('.ws-subtab').forEach((t, i) => {
      t.classList.toggle('active', subTabs[i] === name);
    });
    document.querySelectorAll('.ws-subtab-content').forEach(c => {
      c.classList.toggle('active', c.id === 'subtab-' + name);
    });
  }

  /* ─── STATUS SELECT COLOR UPDATE ─── */
  document.addEventListener('change', function(e) {
    if (e.target.tagName === 'SELECT' && e.target.closest('.checklist-table')) {
      const val = e.target.value;
      e.target.style.color = val === 'confirmed' ? '#7ecb90' : val === 'na' ? 'var(--muted)' : 'var(--muted)';
      e.target.style.borderColor = val === 'confirmed' ? '#27643a' : 'var(--border)';
    }
  });


  /* ─── DAY-BY-DAY LOG ─── */
  let dayCount = 0;
  function addDayRow(data = {}) {
    dayCount++;
    const n = dayCount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-num">${n}</td>
      <td><input class="ti" style="width:90px" type="date" value="${data.date||''}"></td>
      <td><input class="ti" style="width:120px" placeholder="Location" value="${data.location||''}"></td>
      <td><input class="ti" style="width:70px" placeholder="0.00" value="${data.acam||''}"></td>
      <td><input class="ti" style="width:70px" placeholder="0.00" value="${data.bcam||''}"></td>
      <td><input class="ti" style="width:70px" placeholder="0.00" value="${data.ccam||''}"></td>
      <td><input class="ti" style="width:70px" placeholder="0.00" value="${data.audio||''}"></td>
      <td><input class="ti" style="width:70px" placeholder="0.00" value="${data.total||''}" style="color:var(--gold)"></td>
      <td><input class="ti" style="width:70px" placeholder="0" value="${data.clips||''}"></td>
      <td><button class="check-btn${data.dailies?' done':''}" onclick="toggleCheck(this)">${data.dailies?'✓':'×'}</button></td>
      <td><button class="check-btn${data.editorial?' done':''}" onclick="toggleCheck(this)">${data.editorial?'✓':'×'}</button></td>
      <td><button class="check-btn${data.lto?' done':''}" onclick="toggleCheck(this)">${data.lto?'✓':'×'}</button></td>
      <td><input class="ti" style="width:90px" placeholder="Drive ID" value="${data.driveId||''}"></td>
      <td><input class="ti" style="width:130px" placeholder="Notes..." value="${data.notes||''}"></td>
      <td><button class="delete-btn" onclick="deleteRow(this,'day-body')" title="Remove"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td>
    `;
    document.getElementById('day-body').appendChild(tr);
  }

  /* ─── DRIVE INVENTORY ─── */
  let driveCount = 0;
  function addDriveRow(data = {}) {
    driveCount++;
    const n = driveCount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-num">${n}</td>
      <td><input class="ti" style="width:100px" placeholder="PB-D01" value="${data.label||''}"></td>
      <td><input class="ti" style="width:80px" placeholder="2TB SSD" value="${data.typeSize||''}"></td>
      <td><input class="ti" style="width:90px" placeholder="Days 1-3" value="${data.contents||''}"></td>
      <td><input class="ti" style="width:60px" placeholder="1" value="${data.copyNum||''}"></td>
      <td><input class="ti" style="width:130px" placeholder="" value="${data.deliveredTo||''}"></td>
      <td><input class="ti" style="width:90px" placeholder="" value="${data.method||''}"></td>
      <td><input class="ti" style="width:100px" type="date" value="${data.dateDelivered||''}"></td>
      <td><input class="ti" style="width:120px" placeholder="" value="${data.receivedBy||''}"></td>
      <td><input class="ti" style="width:100px" placeholder="" value="${data.tracking||''}"></td>
      <td><button class="check-btn${data.confirmed?' done':''}" onclick="toggleCheck(this)">${data.confirmed?'✓':'×'}</button></td>
      <td><button class="check-btn${data.returned?' done':''}" onclick="toggleCheck(this)">${data.returned?'✓':'×'}</button></td>
      <td><button class="check-btn${data.archived?' done':''}" onclick="toggleCheck(this)">${data.archived?'✓':'×'}</button></td>
      <td><input class="ti" style="width:120px" placeholder="Notes..." value="${data.notes||''}"></td>
      <td><button class="delete-btn" onclick="deleteRow(this,'drive-body')" title="Remove"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td>
    `;
    document.getElementById('drive-body').appendChild(tr);
  }

  // Init completion tab with starter rows
  function initCompletionTab() {
    if (!document.querySelector('#day-body tr')) { for(let i=0;i<5;i++) addDayRow(); }
    if (!document.querySelector('#drive-body tr')) { for(let i=0;i<3;i++) addDriveRow(); }
  }
  document.getElementById('subtab-completion') && setTimeout(initCompletionTab, 100);
