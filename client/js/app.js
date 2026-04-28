/* ==========================================
   app.js — Main Application Logic
   ========================================== */

   const API_BASE = 'http://localhost:5000/api';

   const App = (() => {
     let allLeads = [];
     let currentFilter = 'all';
     let searchQuery = '';
     let currentDetailId = null;
     let pendingDeleteId = null;
     let pendingDeleteName = '';
   
     // ─── Init ───
     async function init() {
       if (!Auth.requireAuth()) return;
       loadUser();
       await loadLeads();
       bindEvents();
       renderRegions();
     }
   
     function loadUser() {
       const user = Auth.getUser();
       if (!user) return;
       ['user-name','topbar-name'].forEach(id => setText(id, user.name));
       ['user-role','topbar-role'].forEach(id => setText(id, user.role || 'Manager'));
       ['user-avatar','topbar-avatar'].forEach(id => setText(id, UI.getInitials(user.name)));
     }
   
     function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
   
     // ─── Load Leads ───
     async function loadLeads() {
       try {
         const params = {};
         if (currentFilter !== 'all') params.status = currentFilter;
         if (searchQuery) params.search = searchQuery;
         const data = await API.getLeads(params);
         allLeads = data.leads || [];
         UI.renderStats(data.stats || {});
         renderLeadsTable(allLeads);
         const badge = document.getElementById('leads-nav-badge');
         if (badge) badge.textContent = data.stats?.total || 0;
       } catch (err) {
         UI.toast(err.message || 'Failed to load leads', 'error');
       }
     }
   
     function renderLeadsTable(leads) {
       const tbody = document.getElementById('leads-tbody');
       const countEl = document.getElementById('leads-count');
       if (!tbody) return;
       if (leads.length === 0) {
         tbody.innerHTML = `<tr><td colspan="7">
           <div class="empty-state">
             <div class="empty-icon-wrap">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <h3>No leads found</h3>
             <p>${searchQuery || currentFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first lead to get started!'}</p>
           </div>
         </td></tr>`;
       } else {
         tbody.innerHTML = leads.map(UI.leadRow).join('');
       }
       if (countEl) countEl.innerHTML = `Showing <strong>${leads.length}</strong> lead${leads.length !== 1 ? 's' : ''}`;
     }
   
     // ─── Status update ───
     async function updateStatus(selectEl) {
       const leadId = selectEl.dataset.leadId;
       const newStatus = selectEl.value;
       selectEl.className = `status-select ${newStatus}`;
       try {
         await API.updateLead(leadId, { status: newStatus });
         UI.toast('Status updated');
         const lead = allLeads.find(l => l._id === leadId);
         if (lead) lead.status = newStatus;
       } catch (err) {
         UI.toast(err.message || 'Failed to update status', 'error');
         await loadLeads();
       }
     }
   
     // ─── Search & Filter ───
     let _searchTimer = null;
     function handleSearch(e) {
       searchQuery = e.target.value.trim();
       clearTimeout(_searchTimer);
       _searchTimer = setTimeout(loadLeads, 300);
     }
   
     function setFilter(status) {
       currentFilter = status;
       document.querySelectorAll('.filter-tab').forEach(t =>
         t.classList.toggle('active', t.dataset.status === status));
       loadLeads();
     }
   
     function setView(view) {
       document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
       const map = { overview: 0, leads: 1 };
       const items = document.querySelectorAll('.nav-item');
       if (items[map[view]]) items[map[view]].classList.add('active');
     }
   
     // ─── Add / Edit Modal ───
     function openAddModal() {
       closeAllDropdowns();
       document.getElementById('modal-title').textContent = 'Add New Lead';
       ['lead-id','field-name','field-email','field-phone','field-company','field-value'].forEach(id => {
         const el = document.getElementById(id);
         if (el) el.value = '';
       });
       document.getElementById('field-source').value = 'other';
       document.getElementById('field-status').value = 'new';
       document.getElementById('lead-modal').classList.remove('hidden');
       setTimeout(() => document.getElementById('field-name').focus(), 100);
     }
   
     function openEditModal(leadId) {
       const lead = allLeads.find(l => l._id === leadId);
       if (!lead) return;
       closeDetailModal();
       document.getElementById('modal-title').textContent = 'Edit Lead';
       document.getElementById('lead-id').value = lead._id;
       document.getElementById('field-name').value = lead.name || '';
       document.getElementById('field-email').value = lead.email || '';
       document.getElementById('field-phone').value = lead.phone || '';
       document.getElementById('field-company').value = lead.company || '';
       document.getElementById('field-source').value = lead.source || 'other';
       document.getElementById('field-status').value = lead.status || 'new';
       document.getElementById('field-value').value = lead.value || '';
       document.getElementById('lead-modal').classList.remove('hidden');
       setTimeout(() => document.getElementById('field-name').focus(), 100);
     }
   
     function editFromDetail() {
       if (currentDetailId) openEditModal(currentDetailId);
     }
   
     function closeModal() {
       document.getElementById('lead-modal').classList.add('hidden');
     }
   
     async function saveLead() {
       const id = document.getElementById('lead-id').value;
       const name = document.getElementById('field-name').value.trim();
       const email = document.getElementById('field-email').value.trim();
       if (!name || !email) { UI.toast('Name and email are required', 'error'); return; }
   
       const body = {
         name, email,
         phone:   document.getElementById('field-phone').value.trim(),
         company: document.getElementById('field-company').value.trim(),
         source:  document.getElementById('field-source').value,
         status:  document.getElementById('field-status').value,
         value:   parseFloat(document.getElementById('field-value').value) || 0,
       };
   
       const btn = document.getElementById('btn-save-lead');
       btn.disabled = true;
       btn.textContent = 'Saving…';
   
       try {
         if (id) {
           await API.updateLead(id, body);
           UI.toast('Lead updated successfully');
         } else {
           await API.createLead(body);
           UI.toast('Lead added successfully');
         }
         closeModal();
         await loadLeads();
       } catch (err) {
         UI.toast(err.message || 'Failed to save lead', 'error');
       } finally {
         btn.disabled = false;
         btn.textContent = 'Save Lead';
       }
     }
   
     // ─── Delete (confirm modal) ───
     function deleteLead(id, name) {
       pendingDeleteId = id;
       pendingDeleteName = name;
       document.getElementById('confirm-text').textContent = `Are you sure you want to delete "${name}"?`;
       document.getElementById('confirm-modal').classList.remove('hidden');
     }
   
     function deleteLeadFromDetail() {
       if (!currentDetailId) return;
       const lead = allLeads.find(l => l._id === currentDetailId);
       if (lead) deleteLead(lead._id, lead.name);
     }
   
     function closeConfirm() {
       document.getElementById('confirm-modal').classList.add('hidden');
       pendingDeleteId = null;
       pendingDeleteName = '';
     }
   
     async function confirmDelete() {
       if (!pendingDeleteId) return;
       const btn = document.getElementById('btn-confirm-delete');
       btn.disabled = true;
       btn.textContent = 'Deleting…';
       try {
         await API.deleteLead(pendingDeleteId);
         UI.toast(`"${pendingDeleteName}" deleted`);
         closeConfirm();
         closeDetailModal();
         await loadLeads();
       } catch (err) {
         UI.toast(err.message || 'Failed to delete', 'error');
       } finally {
         btn.disabled = false;
         btn.textContent = 'Delete';
       }
     }
   
     // ─── Lead Detail ───
     async function openLeadDetail(leadId) {
       const lead = allLeads.find(l => l._id === leadId);
       if (!lead) return;
       currentDetailId = leadId;
   
       const color = UI.getAvatarColor(lead.name);
       const initials = UI.getInitials(lead.name);
       const av = document.getElementById('detail-avatar');
       av.textContent = initials;
       av.className = `detail-avatar ${color}`;
   
       document.getElementById('detail-name').textContent = lead.name;
       document.getElementById('detail-email-meta').textContent = lead.email;
       document.getElementById('detail-company-meta').textContent = lead.company || '—';
       document.getElementById('detail-created').textContent = UI.timeAgo(lead.createdAt);
       document.getElementById('detail-field-email').textContent = lead.email;
       document.getElementById('detail-field-phone').textContent = lead.phone || '—';
       document.getElementById('detail-field-company').textContent = lead.company || '—';
       document.getElementById('detail-field-source').textContent = UI.sourceLabel(lead.source);
       document.getElementById('detail-field-value').textContent = UI.formatValue(lead.value);
       document.getElementById('detail-status-select').value = lead.status;
   
       document.getElementById('detail-modal').classList.remove('hidden');
       await loadNotes(leadId);
     }
   
     function closeDetailModal() {
       document.getElementById('detail-modal').classList.add('hidden');
       currentDetailId = null;
     }
   
     async function updateDetailStatus(selectEl) {
       if (!currentDetailId) return;
       try {
         await API.updateLead(currentDetailId, { status: selectEl.value });
         UI.toast('Status updated');
         const lead = allLeads.find(l => l._id === currentDetailId);
         if (lead) {
           lead.status = selectEl.value;
           const tbl = document.querySelector(`select[data-lead-id="${currentDetailId}"]`);
           if (tbl) { tbl.value = selectEl.value; tbl.className = `status-select ${selectEl.value}`; }
         }
       } catch (err) {
         UI.toast(err.message || 'Failed to update status', 'error');
       }
     }
   
     // ─── Notes ───
     async function loadNotes(leadId) {
       const el = document.getElementById('notes-list');
       el.innerHTML = '<div style="color:var(--text-3);font-size:0.8rem;padding:8px 0">Loading…</div>';
       try {
         const data = await API.getNotes(leadId);
         renderNotes(data.notes || []);
       } catch {
         el.innerHTML = '<div style="color:var(--s-lost);font-size:0.8rem">Failed to load notes.</div>';
       }
     }
   
     function renderNotes(notes) {
       const el = document.getElementById('notes-list');
       if (notes.length === 0) {
         el.innerHTML = `<div class="empty-state" style="padding:20px 0">
           <div class="empty-icon-wrap" style="width:32px;height:32px">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:15px;height:15px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
           </div>
           <p style="font-size:0.78rem">No notes yet. Add one below.</p>
         </div>`;
         return;
       }
       const delIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
       const clkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:10px;height:10px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
       el.innerHTML = notes.map(note => `
         <div class="note-item">
           <div class="note-type-icon">${UI.NOTE_ICONS[note.type] || UI.NOTE_ICONS.note}</div>
           <div style="flex:1;min-width:0">
             <div class="note-content">${UI.escHtml(note.content)}</div>
             <div class="note-meta">${clkIcon} ${note.author || 'Admin'} · ${UI.timeAgo(note.createdAt)}</div>
           </div>
           <button class="btn-row del" onclick="App.deleteNote('${note._id}')" title="Delete note" style="flex-shrink:0">${delIcon}</button>
         </div>`).join('');
     }
   
     async function addNote() {
       if (!currentDetailId) return;
       const textarea = document.getElementById('note-input');
       const content = textarea.value.trim();
       if (!content) { UI.toast('Note cannot be empty', 'error'); return; }
   
       const btn = document.getElementById('btn-add-note');
       btn.disabled = true;
   
       try {
         const user = Auth.getUser();
         await API.createNote({
           leadId: currentDetailId,
           content,
           author: user?.name || 'Admin',
           type: document.getElementById('note-type').value,
         });
         textarea.value = '';
         UI.toast('Note added');
         await loadNotes(currentDetailId);
       } catch (err) {
         UI.toast(err.message || 'Failed to add note', 'error');
       } finally {
         btn.disabled = false;
       }
     }
   
     async function deleteNote(noteId) {
       try {
         await API.deleteNote(noteId);
         UI.toast('Note deleted');
         await loadNotes(currentDetailId);
       } catch (err) {
         UI.toast(err.message || 'Failed to delete note', 'error');
       }
     }
   
     // ─── Export CSV ───
     function exportLeads() {
       closeAllDropdowns();
       if (allLeads.length === 0) { UI.toast('No leads to export', 'error'); return; }
       const headers = ['Name','Email','Phone','Company','Source','Status','Value','Created'];
       const rows = allLeads.map(l => [
         l.name, l.email, l.phone||'', l.company||'',
         l.source, l.status, l.value||0,
         new Date(l.createdAt).toLocaleDateString()
       ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
       const csv = [headers.join(','), ...rows].join('\n');
       const blob = new Blob([csv], { type: 'text/csv' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url; a.download = `clientiq-leads-${new Date().toISOString().slice(0,10)}.csv`;
       a.click(); URL.revokeObjectURL(url);
       UI.toast('CSV exported successfully');
     }
   
     // ─── Profile Edit ───
     function openProfileEdit() {
       closeAllDropdowns();
       const user = Auth.getUser();
       if (user) {
         document.getElementById('profile-name').value = user.name || '';
         document.getElementById('profile-email').value = user.email || '';
         document.getElementById('profile-role').value = user.role || 'Manager';
       }
       document.getElementById('profile-modal').classList.remove('hidden');
     }
   
     function saveProfile() {
       const name = document.getElementById('profile-name').value.trim();
       const email = document.getElementById('profile-email').value.trim();
       const role = document.getElementById('profile-role').value.trim();
       if (!name || !email) { UI.toast('Name and email are required', 'error'); return; }
       const user = Auth.getUser() || {};
       Auth.setSession(Auth.getToken(), { ...user, name, email, role });
       loadUser();
       document.getElementById('profile-modal').classList.add('hidden');
       UI.toast('Profile updated');
     }
   
     // ─── Insights ───
     function showInsights() {
       closeAllDropdowns();
       const total = allLeads.length;
       const converted = allLeads.filter(l => l.status === 'converted').length;
       const newL = allLeads.filter(l => l.status === 'new').length;
       const lost = allLeads.filter(l => l.status === 'lost').length;
       const avgValue = total > 0 ? allLeads.reduce((s,l) => s + (l.value||0), 0) / total : 0;
       const topSource = (() => {
         const counts = {};
         allLeads.forEach(l => { counts[l.source] = (counts[l.source]||0) + 1; });
         return Object.entries(counts).sort((a,b) => b[1]-a[1])[0] || ['—', 0];
       })();
   
       document.getElementById('insights-body').innerHTML = `
         <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
           ${insightCard('Total Leads', total, 'All time')}
           ${insightCard('Converted', converted, `${total > 0 ? ((converted/total)*100).toFixed(1) : 0}% rate`)}
           ${insightCard('Lost Leads', lost, `${total > 0 ? ((lost/total)*100).toFixed(1) : 0}% churn`)}
           ${insightCard('Avg Deal Value', UI.formatValue(avgValue), 'Per lead')}
         </div>
         <div style="padding:14px;background:var(--surface-3);border-radius:var(--r);font-size:0.845rem">
           <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-3);margin-bottom:8px">Top Insights</div>
           <div style="display:flex;flex-direction:column;gap:6px;color:var(--text-2)">
             <div>• Top source: <strong>${UI.sourceLabel(topSource[0])}</strong> (${topSource[1]} leads)</div>
             <div>• <strong>${newL}</strong> leads are awaiting first contact</div>
             <div>• Conversion rate is <strong>${total > 0 ? ((converted/total)*100).toFixed(1) : 0}%</strong></div>
             ${converted > 0 ? `<div>• Est. closed revenue: <strong>${UI.formatValue(allLeads.filter(l=>l.status==='converted').reduce((s,l)=>s+(l.value||0),0))}</strong></div>` : ''}
           </div>
         </div>`;
       document.getElementById('insights-modal').classList.remove('hidden');
     }
   
     function insightCard(label, value, sub) {
       return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px">
         <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-3);margin-bottom:6px">${label}</div>
         <div style="font-size:1.5rem;font-weight:800;letter-spacing:-0.04em;color:var(--text)">${value}</div>
         <div style="font-size:0.73rem;color:var(--text-3);margin-top:2px">${sub}</div>
       </div>`;
     }
   
     // ─── Forecast ───
     function showForecast() {
       const total = allLeads.length;
       const rate = total > 0 ? (allLeads.filter(l=>l.status==='converted').length / total) : 0;
       const pipeline = allLeads.filter(l => ['new','contacted','proposal'].includes(l.status));
       const forecast = pipeline.reduce((s,l) => s + (l.value||0), 0) * rate;
       UI.toast(`Forecast: ${UI.formatValue(forecast)} expected from ${pipeline.length} active leads`);
     }
   
     // ─── Settings (opens settings panel) ───
     function openSettings() {
       const panel = document.getElementById('settings-panel');
       if (panel) panel.classList.toggle('hidden');
     }
   
     // ─── Notifications ───
     function markAllRead() {
       document.querySelectorAll('.notif-unread-dot').forEach(el => {
         el.className = ''; el.style.cssText = 'width:7px;height:7px;flex-shrink:0';
       });
       document.querySelector('.notif-dot')?.remove();
       UI.toast('All notifications marked as read');
       document.getElementById('notif-panel').classList.add('hidden');
     }
   
     // ─── Regions ───
     function renderRegions() {
       const total = Math.max(allLeads.length, 1);
       const regionData = [
         { name: 'US',    count: Math.round(total * 0.38) },
         { name: 'EU',    count: Math.round(total * 0.24) },
         { name: 'APAC',  count: Math.round(total * 0.18) },
         { name: 'MENA',  count: Math.round(total * 0.10) },
         { name: 'LATAM', count: Math.round(total * 0.07) },
         { name: 'AFR',   count: Math.round(total * 0.03) },
       ];
       const max = Math.max(...regionData.map(r => r.count), 1);
       const grid = document.getElementById('regions-grid');
       if (!grid) return;
       grid.innerHTML = regionData.map(r => `
         <div class="region-item" onclick="UI.toast('${r.name}: ${r.count} leads')">
           <div class="region-name">${r.name}</div>
           <div class="region-count">${r.count} leads</div>
           <div class="region-bar"><div class="region-bar-fill" style="width:${(r.count/max)*100}%"></div></div>
         </div>`).join('');
     }
   
     // ─── Dropdown management ───
     function closeAllDropdowns() {
       document.getElementById('notif-panel')?.classList.add('hidden');
       document.getElementById('settings-panel')?.classList.add('hidden');
     }
   
     // ─── Bind Events ───
     function bindEvents() {
       const searchInput = document.getElementById('search-input');
       if (searchInput) searchInput.addEventListener('input', handleSearch);
   
       document.querySelectorAll('.filter-tab').forEach(tab =>
         tab.addEventListener('click', () => setFilter(tab.dataset.status)));
   
       // Modal overlay clicks
       ['lead-modal','detail-modal','confirm-modal'].forEach(id => {
         const el = document.getElementById(id);
         if (el) el.addEventListener('click', e => { if (e.target === el) { closeModal(); closeDetailModal(); closeConfirm(); } });
       });
   
       // Dropdown toggles
       document.getElementById('btn-notif')?.addEventListener('click', e => {
         e.stopPropagation();
         document.getElementById('settings-panel')?.classList.add('hidden');
         document.getElementById('notif-panel')?.classList.toggle('hidden');
       });
       document.getElementById('btn-settings-icon')?.addEventListener('click', e => {
         e.stopPropagation();
         document.getElementById('notif-panel')?.classList.add('hidden');
         document.getElementById('settings-panel')?.classList.toggle('hidden');
       });
   
       // Close dropdowns on outside click
       document.addEventListener('click', () => closeAllDropdowns());
   
       // Note textarea — Ctrl/Cmd+Enter to submit
       document.getElementById('note-input')?.addEventListener('keydown', e => {
         if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') addNote();
       });
   
       // Logout
       document.getElementById('btn-logout')?.addEventListener('click', Auth.logout);
   
       // Escape key
       document.addEventListener('keydown', e => {
         if (e.key === 'Escape') { closeModal(); closeDetailModal(); closeConfirm(); closeAllDropdowns(); }
       });
     }
   
     return {
       init, loadLeads, setFilter, setView,
       openAddModal, openEditModal, closeModal, saveLead, editFromDetail,
       deleteLead, deleteLeadFromDetail, closeConfirm, confirmDelete,
       openLeadDetail, closeDetailModal, updateDetailStatus,
       addNote, deleteNote,
       updateStatus,
       exportLeads,
       openProfileEdit, saveProfile,
       showInsights, showForecast,
       openSettings, markAllRead,
     };
   })();