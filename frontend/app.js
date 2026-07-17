(function() {
  'use strict';

  const global = globalThis;
  const STORAGE_KEY = 'finance_planner_pro';

  const DEFAULT_STATE = {
    onboarded: false,
    theme: 'light',
    user: { name: 'User', avatar: '👤', level: 1 },
    xp: 0,
    xpToNext: 100,
    checkin: { done: false, date: null, streak: 0, lastCheckin: null },
    transactions: [],
    income: [],
    bills: [],
    debts: [],
    budgets: [],
    shopping: [],
    goals: [],
    calendar: [],
    achievements: [],
    missions: { daily: [], weekly: [], monthly: [] },
    aiChat: [],
    aiHistory: [],
    financialHealth: 65,
    totalSavings: 0,
    totalIncome: 0,
    totalExpenses: 0,
  };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) { /* ignore */ }
    return { ...DEFAULT_STATE };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(global.FPState));
    } catch (e) { /* ignore */ }
  }

  global.FPState = loadState();

  // Apply theme on load
  if (global.FPState.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Navigation
  function navigate(screenId, params = {}) {
    const container = document.getElementById('screenContainer');
    if (!container) return;

    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = '';
      container.style.opacity = '1';

      const screen = global.FPScreens[screenId];
      if (screen && screen.init) {
        screen.init(container, { ...params, onNavigate: navigate });
      } else {
        navigate('home');
      }

      // Update bottom nav
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenId);
      });
    }, 80);
  }

  global.navigate = navigate;

  // Gamification
  function addXP(amount) {
    const state = global.FPState;
    state.xp += amount;
    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.user.level++;
      state.xpToNext = Math.floor(state.xpToNext * 1.3);
      global.showToast(`Level Up! You're now level ${state.user.level} 🎉`, 'success');
      setTimeout(() => global.launchConfetti(), 300);
    }
    saveState();
    if (global.updateGamificationUI) global.updateGamificationUI();
  }

  global.addXP = addXP;

  // Daily Check-in
  function doCheckin() {
    const state = global.FPState;
    const today = new Date().toDateString();
    if (state.checkin.done && state.checkin.date === today) return;

    state.checkin.done = true;
    state.checkin.date = today;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.checkin.lastCheckin === yesterday) {
      state.checkin.streak++;
    } else if (state.checkin.lastCheckin !== today) {
      state.checkin.streak = 1;
    }
    state.checkin.lastCheckin = today;
    saveState();
    addXP(10 + Math.min(state.checkin.streak * 2, 50));
    global.showToast(`Day ${state.checkin.streak} streak! +${10 + Math.min(state.checkin.streak * 2, 50)} XP`, 'success');
    setTimeout(() => global.launchConfetti(), 300);
    if (global.updateGamificationUI) global.updateGamificationUI();
  }

  global.doCheckin = doCheckin;

  // Toast
  function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(-10px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  global.showToast = showToast;

  // Confetti
  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    const colors = ['#16A34A', '#22C55E', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (Math.random() * 1.5 + 1) + 's';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3000);
  }

  global.launchConfetti = launchConfetti;

  // Theme toggle
  function toggleTheme() {
    const state = global.FPState;
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    saveState();
  }

  global.toggleTheme = toggleTheme;

  // Format currency
  function formatCurrency(amount) {
    return '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  global.formatCurrency = formatCurrency;

  // Get today's date for inputs
  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  global.todayStr = todayStr;

  // Modal helper
  function showModal(html, onConfirm, title = '') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-handle"></div>
        ${title ? `<h2>${title}</h2>` : ''}
        ${html}
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-outline btn-block btn-sm" id="modalCancel">Cancel</button>
          <button class="btn btn-primary btn-block btn-sm" id="modalConfirm">Save</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modalCancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#modalConfirm').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      if (overlay.parentNode) overlay.remove();
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    return overlay;
  }

  global.showModal = showModal;

  // Calculate financial health
  function calcHealth() {
    const state = global.FPState;
    const income = state.income.reduce((s, i) => s + Number(i.amount), 0);
    const expenses = state.transactions.reduce((s, t) => s + Number(t.amount), 0);
    const bills = state.bills.filter(b => !b.paid).reduce((s, b) => s + Number(b.amount), 0);
    const debts = state.debts.reduce((s, d) => s + Number(d.remaining), 0);
    let score = 65;
    if (income > 0) {
      const ratio = income > 0 ? (income - expenses) / income : 0;
      score += ratio * 20;
    }
    if (bills === 0) score += 10;
    if (debts === 0) score += 10;
    if (state.totalSavings > 0) score += 5;
    score = Math.max(0, Math.min(100, Math.round(score)));
    state.financialHealth = score;
    saveState();
    return score;
  }

  global.calcHealth = calcHealth;

  // Generate unique ID
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  global.uid = uid;

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    const state = global.FPState;
    if (!state.onboarded) {
      navigate('onboarding');
    } else {
      navigate('home');
    }
  });
})();