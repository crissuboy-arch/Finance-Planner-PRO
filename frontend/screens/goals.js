(function () {
  'use strict';
  var g = globalThis;
  var GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '🎓', '💼', '🏦', '💍', '👶', '🏥', '📈', '💰'];

  g.FPScreens.goals = {
    init: function (container, _ref) {
      var onNavigate = _ref.onNavigate;
      render();

      function render() {
        var state = g.FPState;
        var goals = state.goals || [];
        var totalTarget = goals.reduce(function (s, g) { return s + Number(g.target); }, 0);
        var totalSaved = goals.reduce(function (s, g) { return s + Number(g.saved || 0); }, 0);

        container.innerHTML =
          '<div class="screen active">' +
          '<div class="screen-header"><h1>Goals</h1><button class="btn-icon" onclick="navigate(\'home\')">✕</button></div>' +
          '<div class="screen-body">' +
          '<div class="card card-gradient">' +
          '<div class="card-header"><h3 style="color:white">Savings Goals</h3></div>' +
          '<div class="amount" style="color:white">' + g.formatCurrency(totalSaved) + '</div>' +
          '<div style="font-size:13px;opacity:0.8;margin-top:2px">of ' + g.formatCurrency(totalTarget) + ' target</div>' +
          '<div class="progress-bar" style="margin-top:10px;background:rgba(255,255,255,0.2)">' +
          '<div class="progress-fill" style="width:' + (totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0) + '%"></div>' +
          '</div></div>' +
          '<button class="btn btn-primary btn-block" id="addGoalBtn">+ New Goal</button>' +
          '<div style="height:4px"></div>' +
          '<div class="section-title"><span>Your Goals</span></div>' +
          '<div id="goalList">' +
          (goals.length === 0
            ? '<div class="empty-state"><div class="empty-icon">🎯</div><h3>No goals yet</h3><p>Set financial goals and track your progress</p></div>'
            : goals.slice().reverse().map(function (g) {
              var pct = g.target > 0 ? Math.min(100, ((g.saved || 0) / g.target) * 100) : 0;
              return '<div class="goal-card">' +
                '<div style="display:flex;justify-content:space-between;align-items:start">' +
                '<div><div class="goal-icon">' + (g.icon || '🎯') + '</div>' +
                '<div class="goal-name">' + g.name + '</div>' +
                '<div class="goal-amounts">' + g.formatCurrency(g.saved || 0) + ' / ' + g.formatCurrency(g.target) + '</div></div>' +
                '<div style="text-align:right"><div style="font-size:22px;font-weight:800;color:var(--primary)">' + Math.round(pct) + '%</div>' +
                '<div style="font-size:12px;color:var(--text-muted)">' + (g.deadline ? 'Due: ' + g.deadline : '') + '</div></div>' +
                '</div>' +
                '<div class="progress-bar goal-progress"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                (pct < 100
                  ? '<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px" data-goal-save="' + g.id + '">+ Add Savings</button>'
                  : '<div style="text-align:center;margin-top:8px;font-weight:700;color:var(--primary)">🎉 Goal achieved!</div>'
                ) +
                '</div>';
            }).join('')
          ) +
          '</div>' +
          '</div>' +
          '</div>';

        document.getElementById('addGoalBtn').addEventListener('click', showAddGoal);
        var saveBtns = container.querySelectorAll('[data-goal-save]');
        for (var si = 0; si < saveBtns.length; si++) {
          (function (btn) {
            btn.addEventListener('click', function () { showAddSavings(btn.dataset.goalSave); });
          })(saveBtns[si]);
        }
      }

      function showAddGoal() {
        var html =
          '<div class="input-group"><label>Goal Name</label><div class="input-wrap"><input type="text" id="modalName" placeholder="e.g. Emergency Fund"></div></div>' +
          '<div class="input-group"><label>Target Amount ($)</label><div class="input-wrap"><input type="number" id="modalAmount" placeholder="0.00" step="0.01" min="0"></div></div>' +
          '<div class="input-group"><label>Icon</label><div class="category-picker" id="iconPicker">' +
          GOAL_ICONS.map(function (ic) { return '<div class="category-item" data-icon="' + ic + '"><span class="cat-icon" style="font-size:24px">' + ic + '</span></div>'; }).join('') +
          '</div></div>' +
          '<div class="input-group"><label>Deadline (optional)</label><div class="input-wrap"><input type="date" id="modalDeadline"></div></div>';
        g.showModal(html, function () {
          var name = document.getElementById('modalName').value;
          var amount = document.getElementById('modalAmount').value;
          var icon = document.querySelector('#iconPicker .category-item.selected');
          var deadline = document.getElementById('modalDeadline').value;
          if (!name || !amount) return;
          var state = g.FPState;
          state.goals.push({
            id: g.uid(),
            name: name,
            amount: Number(amount),
            target: Number(amount),
            saved: 0,
            icon: icon ? icon.dataset.icon : '🎯',
            deadline: deadline,
            created: new Date().toISOString()
          });
          g.saveState();
          g.addXP(15);
          g.checkAchievements();
          render();
          g.showToast('Goal created! +15 XP', 'success');
        }, 'New Goal');
        setTimeout(function () {
          var items = document.querySelectorAll('#iconPicker .category-item');
          for (var ii = 0; ii < items.length; ii++) {
            (function (el) {
              el.addEventListener('click', function () {
                var all = document.querySelectorAll('#iconPicker .category-item');
                for (var ai = 0; ai < all.length; ai++) all[ai].classList.remove('selected');
                el.classList.add('selected');
              });
            })(items[ii]);
          }
        }, 50);
      }

      function showAddSavings(goalId) {
        var goal = state.goals.find(function (g) { return g.id === goalId; });
        if (!goal) return;
        var html =
          '<div class="input-group"><label>Amount to add ($)</label><div class="input-wrap"><input type="number" id="modalSaveAmount" placeholder="0.00" step="0.01" min="0"></div></div>' +
          '<p style="font-size:13px;color:var(--text-muted)">Current: ' + g.formatCurrency(goal.saved || 0) + ' of ' + g.formatCurrency(goal.target) + '</p>';
        g.showModal(html, function () {
          var saveAmt = Number(document.getElementById('modalSaveAmount').value);
          if (!saveAmt || saveAmt <= 0) return;
          goal.saved = (goal.saved || 0) + saveAmt;
          state.totalSavings += saveAmt;
          if (goal.saved >= goal.target) {
            g.showToast('🎉 Goal achieved: ' + goal.name + '!', 'success');
            g.launchConfetti();
            g.addXP(100);
          } else {
            g.addXP(Math.round(saveAmt / 5));
          }
          g.saveState();
          render();
        }, 'Add to ' + goal.name, 'Save');
      }
    }
  };
})();