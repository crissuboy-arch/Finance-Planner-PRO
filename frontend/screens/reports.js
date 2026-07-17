(function () {
  'use strict';
  var g = globalThis;

  function getChartData(state) {
    var now = new Date();
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monthlyIncome = Array(12).fill(0);
    var monthlyExpenses = Array(12).fill(0);
    state.income.forEach(function (i) {
      var d = new Date(i.date);
      if (d.getFullYear() === now.getFullYear()) monthlyIncome[d.getMonth()] += Number(i.amount);
    });
    state.transactions.forEach(function (e) {
      var d = new Date(e.date);
      if (d.getFullYear() === now.getFullYear()) monthlyExpenses[d.getMonth()] += Number(e.amount);
    });
    return { monthlyIncome: monthlyIncome, monthlyExpenses: monthlyExpenses, monthNames: monthNames };
  }

  g.FPScreens.reports = {
    init: function (container, _ref) {
      var onNavigate = _ref.onNavigate;
      var state = g.FPState;
      var now = new Date();
      var data = getChartData(state);
      var totalIncome = state.income.reduce(function (s, i) { return s + Number(i.amount); }, 0);
      var totalExpenses = state.transactions.reduce(function (s, e) { return s + Number(e.amount); }, 0);
      var totalDebt = state.debts.reduce(function (s, d) { return s + Number(d.remaining || 0); }, 0);
      var netWorth = totalIncome - totalExpenses + state.totalSavings - totalDebt;
      var savings = state.totalSavings || 0;
      var catExpenses = {};
      state.transactions.forEach(function (e) {
        catExpenses[e.category] = (catExpenses[e.category] || 0) + Number(e.amount);
      });
      var catEntries = Object.entries(catExpenses).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);

      container.innerHTML =
        '<div class="screen active">' +
        '<div class="screen-header"><h1>Reports</h1><button class="btn-icon" onclick="navigate(\'home\')">✕</button></div>' +
        '<div class="screen-body">' +
        '<div class="net-worth">' +
        '<div class="nw-label">Net Worth</div>' +
        '<div class="nw-amount">' + g.formatCurrency(netWorth) + '</div>' +
        '<div class="nw-detail">Income: ' + g.formatCurrency(totalIncome) + ' · Expenses: ' + g.formatCurrency(totalExpenses) + '</div>' +
        '</div>' +
        '<div class="stat-row">' +
        '<div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value positive">' + g.formatCurrency(totalIncome) + '</div><div class="stat-label">Total Income</div></div>' +
        '<div class="stat-card"><div class="stat-icon">💳</div><div class="stat-value negative">' + g.formatCurrency(totalExpenses) + '</div><div class="stat-label">Expenses</div></div>' +
        '<div class="stat-card"><div class="stat-icon">🏦</div><div class="stat-value positive">' + g.formatCurrency(savings) + '</div><div class="stat-label">Savings</div></div>' +
        '<div class="stat-card"><div class="stat-icon">⚔️</div><div class="stat-value negative">' + g.formatCurrency(totalDebt) + '</div><div class="stat-label">Debt</div></div>' +
        '</div>' +
        '<div class="card"><div class="card-header"><h3>Monthly Comparison</h3></div><div class="chart-container"><canvas id="monthlyChart"></canvas></div></div>' +
        '<div class="card"><div class="card-header"><h3>Spending by Category</h3></div><div class="chart-container" style="height:180px"><canvas id="categoryChart"></canvas></div></div>' +
        '<div class="card"><div class="card-header"><h3>Cash Flow</h3></div>' +
        '<div style="display:flex;justify-content:space-around;padding:12px 0">' +
        '<div style="text-align:center"><div style="font-size:14px;color:var(--text-muted)">Incoming</div><div style="font-size:22px;font-weight:800;color:var(--primary)">' + g.formatCurrency(totalIncome) + '</div></div>' +
        '<div style="text-align:center"><div style="font-size:14px;color:var(--text-muted)">Outgoing</div><div style="font-size:22px;font-weight:800;color:var(--danger)">' + g.formatCurrency(totalExpenses) + '</div></div>' +
        '<div style="text-align:center"><div style="font-size:14px;color:var(--text-muted)">Net</div><div style="font-size:22px;font-weight:800;color:' + (totalIncome - totalExpenses >= 0 ? 'var(--primary)' : 'var(--danger)') + '">' + g.formatCurrency(totalIncome - totalExpenses) + '</div></div>' +
        '</div></div>' +
        '</div>' +
        '</div>';

      setTimeout(function () {
        var mChart = document.getElementById('monthlyChart');
        if (mChart) {
          var monthLabels = data.monthNames.slice(0, now.getMonth() + 1);
          var incomeBars = monthLabels.map(function (m, i) { return { label: m, value: data.monthlyIncome[i] }; });
          var expenseBars = monthLabels.map(function (m, i) { return { label: m, value: data.monthlyExpenses[i] }; });
          g.drawBarChart(mChart, incomeBars, { color: '#16A34A', color2: '#10B981', showValues: false });
          var cChart = document.getElementById('categoryChart');
          if (cChart) {
            var doughnutData = catEntries.map(function (entry) {
              return { label: entry[0], value: entry[1] };
            });
            var totalCat = catEntries.reduce(function (s, entry) { return s + entry[1]; }, 0);
            g.drawDoughnutChart(cChart, doughnutData, { centerText: g.formatCurrency(totalCat) });
          }
        }
      }, 100);
    }
  };
})();