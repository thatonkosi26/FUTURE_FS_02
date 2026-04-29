/* ==========================================
   ui.js — UI Rendering & Component Module
   ========================================== */
   const UI = (() => {

    // ─── Toast ───
    const toastContainer = (() => {
      const el = document.createElement('div');
      el.className = 'toast-container';
      document.body.appendChild(el);
      return el;
    })();
  
    function toast(msg, type = 'success', duration = 3200) {
      const iconSvg = type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `<span class="toast-icon">${iconSvg}</span><span class="toast-msg">${msg}</span>`;
      toastContainer.appendChild(el);
      setTimeout(() => {
        el.style.transition = 'all 0.2s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => el.remove(), 220);
      }, duration);
    }
  
    // ─── Avatar helpers ───
    const COLORS = ['', 'c-blue', 'c-amber', 'c-purple', 'c-rose', 'c-teal'];
    function getAvatarColor(str) {
      let h = 0;
      for (const c of str) h = c.charCodeAt(0) + ((h << 5) - h);
      return COLORS[Math.abs(h) % COLORS.length];
    }
    function getInitials(name) {
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    }
  
    // ─── Time ───
    function timeAgo(date) {
      const s = (Date.now() - new Date(date)) / 1000;
      if (s < 60)    return 'just now';
      if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
      if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
      if (s < 604800)return `${Math.floor(s / 86400)}d ago`;
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  
    // ─── Value ───
    function formatValue(val) {
      if (!val) return '—';
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000)    return `$${(val / 1000).toFixed(0)}k`;
      return `$${val}`;
    }
  
    // ─── Source ───
    const SOURCE_ICONS = {
      website:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      referral:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      social:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
      email:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      cold_call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>',
      other:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };
    const SOURCE_LABELS = { website: 'Website', referral: 'Referral', social: 'Social', email: 'Email', cold_call: 'Cold Call', other: 'Other' };
  
    function sourceLabel(src) { return SOURCE_LABELS[src] || src; }
    function sourceBadge(src) {
      return `<span class="lead-source-badge">${SOURCE_ICONS[src] || SOURCE_ICONS.other}${SOURCE_LABELS[src] || src}</span>`;
    }
  
    // ─── Note type icons ───
    const NOTE_ICONS = {
      note:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      call:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>',
      email:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      meeting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    };
  
    // ─── Status select ───
    function statusSelect(leadId, current) {
      const opts = ['new','contacted','proposal','converted','lost']
        .map(s => `<option value="${s}"${s===current?' selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`)
        .join('');
      return `<select class="status-select ${current}" data-lead-id="${leadId}" onchange="App.updateStatus(this)">${opts}</select>`;
    }
  
    // ─── Lead table row ───
    function leadRow(lead) {
      const color = getAvatarColor(lead.name);
      const initials = getInitials(lead.name);
      const editIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      const delIcon  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
      return `
        <tr data-id="${lead._id}" onclick="App.openLeadDetail('${lead._id}')">
          <td>
            <div class="lead-name-cell">
              <div class="lead-avatar ${color}">${initials}</div>
              <div>
                <div class="lname">${escHtml(lead.name)}</div>
                <div class="lemail">${escHtml(lead.email)}</div>
              </div>
            </div>
          </td>
          <td><span class="lead-company">${escHtml(lead.company||'—')}</span></td>
          <td>${sourceBadge(lead.source)}</td>
          <td onclick="event.stopPropagation()">${statusSelect(lead._id, lead.status)}</td>
          <td class="lead-value">${formatValue(lead.value)}</td>
          <td class="lead-time">${timeAgo(lead.createdAt)}</td>
          <td onclick="event.stopPropagation()">
            <div class="table-actions">
              <button class="btn-row" onclick="App.openEditModal('${lead._id}')" title="Edit">${editIcon}</button>
              <button class="btn-row del" onclick="App.deleteLead('${lead._id}','${escHtml(lead.name).replace(/'/g,'&#39;')}')" title="Delete">${delIcon}</button>
            </div>
          </td>
        </tr>`;
    }
  
    // ─── Stats & charts ───
    function renderStats(stats) {
      const rate = stats.conversionRate || 0;
      const total = Math.max(stats.total, 1);
  
      setText('stat-total', stats.total);
      setText('stat-converted', stats.converted);
      setText('stat-rate', rate + '%');
      setText('stat-new', stats.newLeads);
  
      setWidth('bar-total', 100);
      setWidth('bar-converted', ((stats.converted / total) * 100));
      setWidth('bar-rate', Math.min(rate, 100));
      setWidth('bar-new', ((stats.newLeads / total) * 100));
  
      // Pills
      setText('hot-pill', `${stats.newLeads} Hot Opportunities`);
      setText('att-pill', `${stats.contacted} Clients Need Attention`);
  
      // Real active % stat in header
      const active = (stats.newLeads || 0) + (stats.contacted || 0) + (stats.proposal || 0);
      const activePct = stats.total > 0 ? Math.round((active / stats.total) * 100) : 0;
      const activePctEl = document.getElementById('active-pct');
      if (activePctEl) activePctEl.textContent = activePct + '%';
  
      // Revenue value (sum deal values or placeholder)
      const revenueEl = document.getElementById('revenue-value');
      if (revenueEl) revenueEl.textContent = `$${((stats.converted || 0) * 8.2).toFixed(1)}k est.`;
  
      // Mini chart
      renderMiniChart(stats);
  
      // Funnel
      renderFunnel(stats);
  
      // Distribution
      renderDistribution(stats);
    }
  
    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function setWidth(id, pct) { const el = document.getElementById(id); if (el) el.style.width = Math.max(pct, 0) + '%'; }
  
    function renderMiniChart(stats) {
      const el = document.getElementById('mini-chart');
      if (!el) return;
      const months = ['Apr','May','Jun','Jul','Aug','Sep'];
      const seed = stats.total || 12;
      const vals = months.map((_, i) => Math.max(Math.round(seed * (0.4 + i * 0.12 + Math.sin(i) * 0.1)), 1));
      const max = Math.max(...vals);
      el.innerHTML = vals.map((v, i) => `
        <div class="mini-bar ${i === vals.length-1 ? 'active' : ''}"
             style="height:${Math.max((v/max)*100, 8)}%"
             title="${months[i]}: ${v} leads">
          <div class="bar-tip">${months[i]}: ${v}</div>
        </div>`).join('');
    }
  
    function renderFunnel(stats) {
      const el = document.getElementById('funnel-bars');
      if (!el) return;
      const data = [
        { key: 'new',       label: 'New Leads', count: stats.newLeads   || 0 },
        { key: 'contacted', label: 'Contacted',  count: stats.contacted  || 0 },
        { key: 'proposal',  label: 'Proposal',   count: stats.proposal   || 0 },
        { key: 'converted', label: 'Converted',  count: stats.converted  || 0 },
      ];
      const max = Math.max(...data.map(d => d.count), 1);
      el.innerHTML = data.map(d => `
        <div class="funnel-col">
          <div class="funnel-count">${d.count}</div>
          <div class="funnel-bar-wrap">
            <div class="funnel-bar ${d.key}" style="height:${Math.max((d.count/max)*100, 6)}%"></div>
          </div>
          <div class="funnel-label">${d.label}</div>
        </div>`).join('');
    }
  
    function renderDistribution(stats) {
      const el = document.getElementById('dist-legend');
      if (!el) return;
      const total = Math.max(stats.total, 1);
      const items = [
        { label: 'New',       count: stats.newLeads  || 0, color: '#9AE600' },
        { label: 'Contacted', count: stats.contacted  || 0, color: '#3B82F6' },
        { label: 'Proposal',  count: stats.proposal   || 0, color: '#F59E0B' },
        { label: 'Converted', count: stats.converted  || 0, color: '#10B981' },
        { label: 'Lost',      count: (stats.total - stats.newLeads - stats.contacted - (stats.proposal||0) - stats.converted) || 0, color: '#EF4444' },
      ].filter(i => i.count > 0);
  
      el.innerHTML = items.map(i => {
        const pct = Math.round((i.count / total) * 100);
        return `
          <div class="dist-item">
            <div class="dist-dot" style="background:${i.color}"></div>
            <span class="dist-label">${i.label}</span>
            <div class="dist-track"><div class="dist-fill" style="background:${i.color};width:${pct}%"></div></div>
            <span class="dist-pct">${pct}%</span>
          </div>`;
      }).join('') || '<div style="color:var(--text-3);font-size:0.8rem">No data yet</div>';
    }
  
    // ─── HTML escape ───
    function escHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
  
    return {
      toast, getAvatarColor, getInitials, timeAgo, formatValue,
      sourceLabel, sourceBadge, statusSelect, leadRow,
      renderStats, escHtml, NOTE_ICONS,
    };
  })();