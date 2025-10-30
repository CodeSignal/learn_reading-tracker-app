// SPA logic for Reading Tracker (Users, Books, Reading Progress)
document.addEventListener('DOMContentLoaded', () => {
  // --- Auth State & Helpers ---
  const authStatus = document.getElementById('authStatus');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showLoginBtn = document.getElementById('showLogin');
  const showRegisterBtn = document.getElementById('showRegister');
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');

  let token = localStorage.getItem('token') || '';
  let currentUser = null; // { userId, role }

  // Unwrap API payloads that may be nested as
  // { data: {...}, meta } and/or { success: true, data: {...} }
  function unwrap(json) {
    let payload = json;
    try {
      for (let i = 0; i < 3; i++) {
        if (payload && typeof payload === 'object' && 'data' in payload && ((payload && payload.success === true) || ('meta' in payload))) {
          payload = payload.data;
          continue;
        }
        break;
      }
    } catch {}
    return payload;
  }
  function decodeJwt(t) {
    try {
      const payload = t.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch { return null; }
  }

  function shortId(id) { return (typeof id === 'string') ? id.slice(0, 8) : id; }

  function setAuth(newToken) {
    token = newToken || '';
    if (token) {
      localStorage.setItem('token', token);
      const payload = decodeJwt(token);
      currentUser = payload ? { userId: payload.sub, role: payload.role } : null;
    } else {
      localStorage.removeItem('token');
      currentUser = null;
    }
    renderAuthStatus();
    refreshVisibility();
    // If Friends tab is currently active, refresh its data so
    // newly logged-in user can see incoming requests immediately.
    const friendsSection = document.getElementById('section-friends');
    if (friendsSection && !friendsSection.classList.contains('hidden')) {
      if (typeof loadFriendsTab === 'function') {
        loadFriendsTab();
      }
    }
  }

  function renderAuthStatus() {
    if (currentUser) {
      authStatus.innerHTML = `<span class="mr-2">Logged in as <strong>${shortId(currentUser.userId)}</strong> (${currentUser.role})</span><button id="logoutBtn" class="px-2 py-1 bg-gray-200 rounded">Logout</button>`;
      document.getElementById('logoutBtn').onclick = () => setAuth('');
      document.getElementById('authForms').classList.add('hidden');
    } else {
      authStatus.textContent = 'Not logged in';
      document.getElementById('authForms').classList.remove('hidden');
    }
  }

  showLoginBtn.onclick = () => { loginForm.classList.remove('hidden'); registerForm.classList.add('hidden'); };
  showRegisterBtn.onclick = () => { registerForm.classList.remove('hidden'); loginForm.classList.add('hidden'); };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); loginMessage.textContent = '';
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const res = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username, password }) });
    const raw = await res.json().catch(() => null);
    const json = unwrap(raw);
    if (!res.ok) { loginMessage.textContent = (raw && raw.error && raw.error.message) || 'Login failed'; return; }
    const tokenVal = json && json.access_token;
    setAuth(tokenVal);
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); registerMessage.textContent = '';
    const name = document.getElementById('registerName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const res = await fetch('/auth/register', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, username, password }) });
    if (!res.ok) { registerMessage.textContent = 'Registration failed'; return; }
    registerMessage.textContent = 'Registered! You can now login.';
    showLoginBtn.click();
  });

  setAuth(token);
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-section');

  // Switch tab and show corresponding section
  function showSection(name) {
    sections.forEach(sec => {
      sec.id === `section-${name}` ? sec.classList.remove('hidden') : sec.classList.add('hidden');
    });
    tabs.forEach(btn => {
      btn.id === `tab-${name}` ? btn.classList.add('text-blue-500') : btn.classList.remove('text-blue-500');
    });
    if (name === 'users') {
      loadUsers();
    } else if (name === 'books') {
      loadBooks();
    } else if (name === 'reading') {
      loadUserOptions();
      loadBookOptions();
      loadSearchBookOptions();
      readingOutput.textContent = '';
      searchReadingOutput.textContent = '';
    } else if (name === 'friends') {
      loadFriendsTab();
    } else if (name === 'admin') {
      loadLogs();
      // The first request to /admin/logs is only logged after it completes.
      // Refresh shortly after to include that entry as well.
      setTimeout(loadLogs, 400);
    }
  }
  tabs.forEach(btn => btn.addEventListener('click', () => showSection(btn.id.split('-')[1])));
  showSection('users');

  // --- Users CRUD ---
  const usersTableBody = document.getElementById('usersTableBody');
  const userStatsOutput = document.getElementById('userStatsOutput');
  const friendsUsersTableBody = document.getElementById('friendsUsersTableBody');
  const friendRequestMessage = document.getElementById('friendRequestMessage');

  async function loadUsers() {
    const res = await fetch('/users');
    if (!res.ok) return;
    const raw = await res.json();
    const j = unwrap(raw);
    const users = Array.isArray(j) ? j : [];
    usersTableBody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      const adminOnly = (currentUser && currentUser.role === 'admin');
      const actions = `
        <button data-id="${u.id}" class="stats-user bg-indigo-500 text-white px-2 rounded">Stats</button>
        ${adminOnly ? `<button data-id="${u.id}" data-name="${u.name}" data-username="${u.username}" class=\"edit-user bg-yellow-300 px-2 rounded\">Edit</button>
        <button data-id=\"${u.id}\" class=\"delete-user bg-red-400 text-white px-2 rounded\">Delete</button>` : '<span class="text-gray-400">Admin only</span>'}`;
      tr.innerHTML = `
        <td class="border px-4 py-2">${shortId(u.id)}</td>
        <td class="border px-4 py-2">${u.name}</td>
        <td class="border px-4 py-2">${u.username}</td>
        <td class="border px-4 py-2 space-x-2">${actions}</td>`;
      usersTableBody.appendChild(tr);
    });
    document.querySelectorAll('.stats-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/users/${id}/stats`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        const raw = await res.json().catch(() => null);
        if (!res.ok) userStatsOutput.textContent = (raw && raw.error && raw.error.message) || 'Failed to load user stats';
        else userStatsOutput.textContent = JSON.stringify(unwrap(raw), null, 2);
      });
    });
    document.querySelectorAll('.edit-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const currentName = btn.dataset.name || '';
        const currentUsername = btn.dataset.username || '';
        const name = prompt('Enter new name:', currentName);
        if (name === null) return;
        const username = prompt('Enter new username:', currentUsername);
        if (username === null) return;
        await fetch(`/users/${id}`, {
          method: 'PATCH', headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify({ name, username })
        });
        loadUsers();
      });
    });
    document.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Delete this user?')) return;
        await fetch(`/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        loadUsers();
      });
    });
  }
  // Create User UI removed; registration flow handles new users

  // --- Books CRUD & Catalog ---
  const booksTableBody = document.getElementById('booksTableBody');
  const createBookForm = document.getElementById('createBookForm');
  const booksSearch = document.getElementById('booksSearch');
  const booksSortBy = document.getElementById('booksSortBy');
  const booksOrder = document.getElementById('booksOrder');
  const booksPage = document.getElementById('booksPage');
  const booksPageSize = document.getElementById('booksPageSize');
  const booksApply = document.getElementById('booksApply');
  const booksMeta = document.getElementById('booksMeta');
  const bookStatsOutput = document.getElementById('bookStatsOutput');

  function normalizeBooksResponse(raw) {
    if (raw && raw.data && Array.isArray(raw.data.items)) return raw.data;
    if (raw && Array.isArray(raw?.data)) return { items: raw.data, page: 1, pageSize: raw.data.length, total: raw.data.length };
    if (raw && Array.isArray(raw.items)) return raw;
    if (Array.isArray(raw)) return { items: raw, page: 1, pageSize: raw.length, total: raw.length };
    return { items: [], page: 1, pageSize: 0, total: 0 };
  }

  async function loadBooks() {
    const params = new URLSearchParams();
    if (booksSearch && booksSearch.value.trim()) params.set('q', booksSearch.value.trim());
    if (booksSortBy && booksSortBy.value) params.set('sortBy', booksSortBy.value);
    if (booksOrder && booksOrder.value) params.set('order', booksOrder.value);
    if (booksPage && booksPage.value) params.set('page', booksPage.value);
    if (booksPageSize && booksPageSize.value) params.set('pageSize', booksPageSize.value);
    const url = `/books${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const raw = await res.json();
    const j = unwrap(raw);
    const { items: books, page, pageSize, total } = normalizeBooksResponse(j);
    booksTableBody.innerHTML = '';
    books.forEach(b => {
      const tr = document.createElement('tr');
      const adminActions = (currentUser && currentUser.role === 'admin')
        ? `<button data-id="${b.id}" class="edit-book bg-yellow-300 px-2 rounded">Edit</button>
           <button data-id="${b.id}" class="delete-book bg-red-400 text-white px-2 rounded">Delete</button>`
        : '<span class="text-gray-400">Admin only</span>';
      tr.innerHTML = `
        <td class="border px-4 py-2">${shortId(b.id)}</td>
        <td class="border px-4 py-2">${b.title}</td>
        <td class="border px-4 py-2">${b.author}</td>
        <td class="border px-4 py-2">${b.totalPages ?? '-'}</td>
        <td class="border px-4 py-2">${b.publishDate ?? '-'}</td>
        <td class="border px-4 py-2">${b.uploadedAt ? String(b.uploadedAt).substring(0,19).replace('T',' ') : '-'}</td>
        <td class="border px-4 py-2 space-x-2">
          <button data-id="${b.id}" class="stats-book bg-indigo-500 text-white px-2 rounded">Stats</button>
          ${adminActions}
        </td>`;
      booksTableBody.appendChild(tr);
    });
    booksMeta.textContent = `Showing ${books.length} of ${total} (page ${page}, size ${pageSize})`;
    document.querySelectorAll('.edit-book').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const title = prompt('Enter new title:'); if (title===null) return;
        const author = prompt('Enter new author:'); if (author===null) return;
        await fetch(`/books/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify({ title, author }) });
        loadBooks();
      });
    });
    document.querySelectorAll('.delete-book').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Delete this book?')) return;
        await fetch(`/books/${id}`, { method:'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        loadBooks();
      });
    });
    document.querySelectorAll('.stats-book').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/books/${id}/stats`);
        const raw = await res.json().catch(() => null);
        if (!res.ok) {
          bookStatsOutput.textContent = (raw && raw.error && raw.error.message) || 'Failed to fetch stats';
        } else {
          bookStatsOutput.textContent = JSON.stringify(unwrap(raw), null, 2);
        }
      });
    });
  }
  if (booksApply) booksApply.addEventListener('click', (e) => { e.preventDefault(); loadBooks(); });
  createBookForm.addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('newBookTitle').value.trim();
    const author = document.getElementById('newBookAuthor').value.trim();
    const totalPages = parseInt(document.getElementById('newBookPages').value);
    const publishDate = document.getElementById('newBookPublishDate').value.trim();
    if (!title || !author || !totalPages) return;
    const body = { title, author, totalPages };
    if (publishDate) body.publishDate = publishDate;
    await fetch('/books', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(body) });
    createBookForm.reset();
    loadBooks();
  });

  // --- Reading Progress ---
  const readingUserSelect = document.getElementById('readingUserSelect');
  const readingBookSelect = document.getElementById('readingBookSelect');
  const updateReadingForm = document.getElementById('updateReadingForm');
  const readingOutput = document.getElementById('readingOutput');
  const searchBookSelect = document.getElementById('searchBookSelect');
  const searchReadingBtn = document.getElementById('searchReadingBtn');
  const searchReadingOutput = document.getElementById('searchReadingOutput');

  // --- Friends Management ---
  const incomingRequestsBody = document.getElementById('incomingRequestsBody');
  const incomingMessage = document.getElementById('incomingMessage');
  const refreshIncomingBtn = document.getElementById('refreshIncomingBtn');
  const friendsUserSelect = document.getElementById('friendsUserSelect');
  const loadFriendsBtn = document.getElementById('loadFriendsBtn');
  const friendsList = document.getElementById('friendsList');
  const friendProgress = document.getElementById('friendProgress');

  async function loadFriendsTab() {
    // Populate users for sending requests and selection
    await loadFriendsUsersTable();
    await loadFriendsUserSelect();
    await loadIncomingRequests();
    friendRequestMessage.textContent = '';
    incomingMessage.textContent = '';
    friendsList.innerHTML = '';
    friendProgress.textContent = '';
  }

  async function loadFriendsUsersTable() {
    const res = await fetch('/users');
    if (!res.ok) return;
    const raw = await res.json();
    const j = unwrap(raw);
    const users = Array.isArray(j) ? j : [];
    friendsUsersTableBody.innerHTML = '';
    // Optionally fetch current user's friends to disable request for existing friends
    let myFriends = [];
    if (currentUser) {
      try {
        const r = await fetch(`/users/${currentUser.userId}/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
        const jr = await r.json();
        const un = unwrap(jr);
        myFriends = Array.isArray(un) ? un : [];
      } catch {}
    }
    const friendIds = new Set(myFriends.map(f => f.id));
    users.forEach(u => {
      const tr = document.createElement('tr');
      let btnHtml = '';
      if (!currentUser) {
        btnHtml = '<span class="text-gray-400">Login required</span>';
      } else if (u.id === currentUser.userId) {
        btnHtml = '<span class="text-gray-400">This is you</span>';
      } else if (friendIds.has(u.id)) {
        btnHtml = '<span class="text-green-600">Already friends</span>';
      } else {
        btnHtml = `<button data-id="${u.id}" class="send-friend bg-blue-500 text-white px-2 py-1 rounded">Request</button>`;
      }
      tr.innerHTML = `
        <td class="border px-4 py-2">${shortId(u.id)}</td>
        <td class="border px-4 py-2">${u.name}</td>
        <td class="border px-4 py-2">${u.username}</td>
        <td class="border px-4 py-2">${btnHtml}</td>`;
      friendsUsersTableBody.appendChild(tr);
    });
    document.querySelectorAll('.send-friend').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id || '';
        friendRequestMessage.textContent = '';
        if (!currentUser) { friendRequestMessage.textContent = 'Please login first.'; return; }
        const res = await fetch('/friends/request', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ recipientId: id }) });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          friendRequestMessage.textContent = (json && json.error && json.error.message) || 'Failed to send request';
        } else {
          friendRequestMessage.textContent = 'Request sent!';
          loadIncomingRequests();
          loadFriendsUsersTable();
        }
      });
    });
  }

  async function loadIncomingRequests() {
    if (!currentUser) { incomingRequestsBody.innerHTML = ''; incomingMessage.textContent = 'Login to view incoming requests.'; return; }
    const res = await fetch('/friends/requests', { headers: { 'Authorization': `Bearer ${token}` } });
    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      incomingRequestsBody.innerHTML = '';
      incomingMessage.textContent = (raw && raw.error && raw.error.message) || 'Failed to load incoming requests';
      return;
    }
    const j2 = unwrap(raw);
    const requests = Array.isArray(j2) ? j2 : [];
    incomingRequestsBody.innerHTML = '';
    if (!requests.length) {
      incomingRequestsBody.innerHTML = '<tr><td class="px-4 py-2" colspan="3">No pending requests.</td></tr>';
      return;
    }
    // We need usernames for senders; fetch the users list
    const allUsersRes = await fetch('/users');
    const allUsersJson = await allUsersRes.json().catch(() => null);
    const allUsers = (() => { const u = unwrap(allUsersJson); return Array.isArray(u) ? u : []; })();
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    requests.forEach(r => {
      const sender = userMap.get(r.senderId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-4 py-2">${shortId(r.id)}</td>
        <td class="border px-4 py-2">${sender ? sender.name + ' (@' + sender.username + ')' : r.senderId}</td>
        <td class="border px-4 py-2 space-x-2">
          <button data-id="${r.id}" data-status="accepted" class="handle-req bg-green-500 text-white px-2 py-1 rounded">Accept</button>
          <button data-id="${r.id}" data-status="declined" class="handle-req bg-red-500 text-white px-2 py-1 rounded">Decline</button>
        </td>`;
      incomingRequestsBody.appendChild(tr);
    });
    document.querySelectorAll('.handle-req').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id || '';
        const status = btn.dataset.status;
        const res = await fetch(`/friends/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
        const raw = await res.json().catch(() => null);
        if (!res.ok) {
          incomingMessage.textContent = (raw && raw.error && raw.error.message) || 'Failed to handle request';
        } else {
          incomingMessage.textContent = 'Request updated.';
          loadIncomingRequests();
          loadFriendsUsersTable();
        }
      });
    });
  }

  async function loadFriendsUserSelect() {
    const res = await fetch('/users');
    if (!res.ok) return;
    const raw = await res.json();
    const j = unwrap(raw);
    const users = Array.isArray(j) ? j : [];
    friendsUserSelect.innerHTML = '<option value="">Select User</option>';
    users.forEach(u => { friendsUserSelect.innerHTML += `<option value="${u.id}">${shortId(u.id)} - ${u.name} (@${u.username})</option>`; });
  }

  if (refreshIncomingBtn) refreshIncomingBtn.addEventListener('click', loadIncomingRequests);
  if (loadFriendsBtn) loadFriendsBtn.addEventListener('click', async () => {
    const userId = friendsUserSelect.value || '';
    friendsList.innerHTML = '';
    friendProgress.textContent = '';
    if (!userId) return;
    const res = await fetch(`/users/${userId}/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      friendsList.innerHTML = `<li class="text-red-600">${(raw && raw.error && raw.error.message) || 'Failed to load friends'}</li>`;
      return;
    }
    const j = unwrap(raw);
    const friends = Array.isArray(j) ? j : [];
    if (!friends.length) {
      friendsList.innerHTML = '<li>No friends yet.</li>';
      return;
    }
    friends.forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = `${shortId(f.id)} - ${f.name} (@${f.username}) <button data-id="${f.id}" class="view-progress bg-indigo-500 text-white px-2 py-0.5 rounded ml-2">View Progress</button>`;
      friendsList.appendChild(li);
    });
    document.querySelectorAll('.view-progress').forEach(btn => {
      btn.addEventListener('click', async () => {
        const friendId = btn.dataset.id || '';
        friendProgress.textContent = '';
        const res = await fetch(`/friends/${friendId}/progress`, { headers: { 'Authorization': `Bearer ${token}` } });
        const raw = await res.json().catch(() => null);
        if (!res.ok) {
          friendProgress.textContent = (raw && raw.error && raw.error.message) || 'Failed to load progress';
          return;
        }
        const j = unwrap(raw);
        const sessions = Array.isArray(j) ? j : [];
        if (!sessions.length) {
          friendProgress.textContent = 'No reading sessions.';
        } else {
          friendProgress.innerHTML = '<ul>' + sessions.map(s => `<li>Book ${shortId(s.bookId)}: page ${s.currentPage}</li>`).join('') + '</ul>';
        }
      });
    });
  });

  async function loadUserOptions() {
    const res = await fetch('/users');
    if (!res.ok) return;
    const raw = await res.json();
    const j = unwrap(raw);
    const users = Array.isArray(j) ? j : [];
    readingUserSelect.innerHTML = '<option value="">Select User</option>';
    users.forEach(u => { readingUserSelect.innerHTML += `<option value="${u.id}">${shortId(u.id)} - ${u.name}</option>`; });
    // Enforce Owner-or-Admin UX: non-admins can only update themselves
    if (currentUser && currentUser.role !== 'admin') {
      readingUserSelect.value = String(currentUser.userId);
      readingUserSelect.disabled = true;
    } else {
      readingUserSelect.disabled = false;
    }
  }
  async function loadBookOptions() {
    const res = await fetch('/books');
    if (!res.ok) return;
    const raw = await res.json();
    const norm = normalizeBooksResponse(unwrap(raw));
    const books = norm.items || [];
    readingBookSelect.innerHTML = '<option value="">Select Book</option>';
    books.forEach(b => { readingBookSelect.innerHTML += `<option value="${b.id}">${shortId(b.id)} - ${b.title}</option>`; });
  }
  async function loadSearchBookOptions() {
    const res = await fetch('/books');
    if (!res.ok) return;
    const raw = await res.json();
    const norm = normalizeBooksResponse(unwrap(raw));
    const books = norm.items || [];
    searchBookSelect.innerHTML = '<option value="">Select Book</option>';
    books.forEach(b => { searchBookSelect.innerHTML += `<option value="${b.id}">${shortId(b.id)} - ${b.title}</option>`; });
  }
  updateReadingForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentUser) { readingOutput.textContent = 'Please login to update progress.'; return; }
    const isAdmin = !!(currentUser && currentUser.role === 'admin');
    const userId = isAdmin ? (readingUserSelect.value) : (currentUser ? currentUser.userId : '');
    const bookId = (readingBookSelect.value);
    const currentPage = parseInt(document.getElementById('readingCurrentPage').value);
    const status = document.getElementById('readingStatusSelect').value;
    if (!bookId || !userId) { readingOutput.textContent = 'Please select user and book.'; return; }
    const body = { userId, bookId };
    if (status === 'want-to-read') { body.currentPage = 0; body.status = status; }
    else {
      if (Number.isNaN(currentPage)) { readingOutput.textContent = 'Enter current page or choose status.'; return; }
      body.currentPage = currentPage;
      if (status) body.status = status;
    }
    const res = await fetch('/reading/progress', { method:'PATCH', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(body) });
    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = raw?.error?.message || 'Error updating progress';
      readingOutput.textContent = msg;
      return;
    }
    const payload = unwrap(raw);
    readingOutput.textContent = JSON.stringify(payload, null, 2);
  });
  // Shelf
  const loadShelfBtn = document.getElementById('loadShelfBtn');
  const shelfStatus = document.getElementById('shelfStatus');
  const shelfSortBy = document.getElementById('shelfSortBy');
  const shelfOrder = document.getElementById('shelfOrder');
  const shelfOutput = document.getElementById('shelfOutput');
  if (loadShelfBtn) loadShelfBtn.addEventListener('click', async () => {
    if (!currentUser) { shelfOutput.textContent = 'Login required.'; return; }
    const params = new URLSearchParams();
    if (shelfStatus && shelfStatus.value) params.set('status', shelfStatus.value);
    if (shelfSortBy && shelfSortBy.value) params.set('sortBy', shelfSortBy.value);
    if (shelfOrder && shelfOrder.value) params.set('order', shelfOrder.value);
    const res = await fetch(`/reading/shelf?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const raw = await res.json().catch(() => null);
    if (!res.ok) { shelfOutput.textContent = (raw && raw.error && raw.error.message) || 'Failed to load shelf'; return; }
    const itemsRaw = unwrap(raw);
    const items = Array.isArray(itemsRaw) ? itemsRaw : [];
    if (!items.length) { shelfOutput.textContent = 'Shelf is empty.'; return; }
    shelfOutput.innerHTML = '<table class="min-w-full"><thead><tr><th class="px-2">Title</th><th class="px-2">Author</th><th class="px-2">Status</th><th class="px-2">Progress</th><th class="px-2">Updated</th></tr></thead><tbody>' +
      items.map(i => `<tr><td class="px-2">${i.title}</td><td class="px-2">${i.author}</td><td class="px-2">${i.status}</td><td class="px-2">${Math.round((i.progress||0)*100)}%</td><td class="px-2">${i.updatedAt||'-'}</td></tr>`).join('') +
      '</tbody></table>';
  });
  searchReadingBtn.addEventListener('click', async () => {
    const bookId = searchBookSelect.value;
    if (!bookId) {
      searchReadingOutput.textContent = 'Please select a book.';
      return;
    }
    const res = await fetch(`/reading/progress/${bookId}`);
    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = raw?.error?.message || 'Error fetching progress';
      searchReadingOutput.textContent = msg;
      return;
    }
    const j = unwrap(raw);
    const data = Array.isArray(j) ? j : [];
    if (!data.length) {
      searchReadingOutput.textContent = 'No progress for this book.';
    } else {
      searchReadingOutput.innerHTML = '<ul>' + data.map(item => `<li>${shortId(item.user.id)} - ${item.user.name}: ${item.currentPage}</li>`).join('') + '</ul>';
    }
  });

  function refreshVisibility() {
    // Show/hide book creation form (query element to avoid early ReferenceErrors)
    const createForm = document.getElementById('createBookForm');
    if (!createForm) return;
    if (currentUser?.role === 'admin') {
      createForm.classList.remove('hidden');
    } else {
      createForm.classList.add('hidden');
    }
    // Admin tab visibility
    const adminTab = document.getElementById('tab-admin');
    if (adminTab) {
      if (currentUser?.role === 'admin') adminTab.classList.remove('hidden');
      else adminTab.classList.add('hidden');
    }
  }

  // Initial load
  loadUsers(); loadBooks(); loadSearchBookOptions();

  // --- Admin Logs Viewer ---
  const logsTableBody = document.getElementById('logsTableBody');
  const logsLimit = document.getElementById('logsLimit');
  const refreshLogsBtn = document.getElementById('refreshLogs');
  const logsMessage = document.getElementById('logsMessage');

  async function loadLogs() {
    if (!currentUser || currentUser.role !== 'admin') {
      logsMessage.textContent = 'Admin only';
      logsTableBody.innerHTML = '';
      return;
    }
    const limit = parseInt(logsLimit.value) || 20;
    const res = await fetch(`/admin/logs?limit=${limit}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      logsMessage.textContent = (raw && raw.error && raw.error.message) || 'Failed to load logs';
      logsTableBody.innerHTML = '';
      return;
    }
    logsMessage.textContent = '';
    const j = unwrap(raw);
    const logs = Array.isArray(j) ? j : [];
    logsTableBody.innerHTML = '';
    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-4 py-2">${l.at}</td>
        <td class="border px-4 py-2">${l.method}</td>
        <td class="border px-4 py-2">${l.url}</td>
        <td class="border px-4 py-2">${l.status}</td>
        <td class="border px-4 py-2">${l.ms}</td>`;
      logsTableBody.appendChild(tr);
    });
  }
  if (refreshLogsBtn) refreshLogsBtn.addEventListener('click', loadLogs);
});
