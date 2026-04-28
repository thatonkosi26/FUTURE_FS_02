/* ==========================================
   api.js — API Communication Module
   ========================================== */
const API = (() => {

  function headers() {
    const token = Auth.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async function request(method, path, body = null) {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    // Handle 401
    if (res.status === 401) {
      Auth.logout();
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    if (!data.success && res.status !== 200) {
      throw new Error(data.message || 'API Error');
    }
    return data;
  }

  return {
    // Leads
    getLeads: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/leads${qs ? '?' + qs : ''}`);
    },
    createLead: (body) => request('POST', '/leads', body),
    updateLead: (id, body) => request('PUT', `/leads/${id}`, body),
    deleteLead: (id) => request('DELETE', `/leads/${id}`),

    // Notes
    getNotes: (leadId) => request('GET', `/notes/${leadId}`),
    createNote: (body) => request('POST', '/notes', body),
    deleteNote: (id) => request('DELETE', `/notes/${id}`),

    // Auth
    getMe: () => request('GET', '/auth/me'),
  };
})();
