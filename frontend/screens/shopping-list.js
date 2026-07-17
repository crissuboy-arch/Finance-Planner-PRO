(function () {
  'use strict';
  var g = globalThis;
  var SHOP_CATS = [
    { icon: '🛒', name: 'Groceries' },
    { icon: '🏠', name: 'Household' },
    { icon: '👕', name: 'Clothing' },
    { icon: '📚', name: 'Education' },
    { icon: '🎮', name: 'Entertainment' },
    { icon: '💊', name: 'Health' },
    { icon: '📌', name: 'Other' }
  ];

  g.FPScreens['shopping-list'] = {
    init: function (container, _ref) {
      var onNavigate = _ref.onNavigate;
      render();

      function render() {
        var state = g.FPState;
        var items = state.shopping || [];
        var total = items.reduce(function (s, i) { return s + Number(i.price || 0); }, 0);
        var purchased = items.filter(function (i) { return i.done; });
        var purchasedTotal = purchased.reduce(function (s, i) { return s + Number(i.price || 0); }, 0);

        container.innerHTML =
          '<div class="screen active">' +
          '<div class="screen-header"><h1>Shopping List</h1><button class="btn-icon" onclick="navigate(\'home\')">✕</button></div>' +
          '<div class="screen-body">' +
          '<div class="stat-row">' +
          '<div class="stat-card"><div class="stat-icon">🛒</div><div class="stat-value">' + items.length + '</div><div class="stat-label">Items</div></div>' +
          '<div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">' + purchased.length + '</div><div class="stat-label">Purchased</div></div>' +
          '<div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value">' + g.formatCurrency(total) + '</div><div class="stat-label">Est. Total</div></div>' +
          '<div class="stat-card"><div class="stat-icon">💵</div><div class="stat-value">' + g.formatCurrency(purchasedTotal) + '</div><div class="stat-label">Spent</div></div>' +
          '</div>' +
          '<button class="btn btn-primary btn-block" id="addShopBtn">+ Add Item</button>' +
          '<div style="height:4px"></div>' +
          '<div class="section-title"><span>Items</span></div>' +
          '<div id="shopList">' +
          (items.length === 0
            ? '<div class="empty-state"><div class="empty-icon">🛒</div><h3>Shopping list empty</h3><p>Add items to your shopping list</p></div>'
            : items.slice().reverse().map(function (i) {
              var cat = SHOP_CATS.find(function (c) { return c.name === i.category; });
              return '<div class="shopping-item">' +
                '<div class="shop-check ' + (i.done ? 'checked' : '') + '" data-shop-id="' + i.id + '">' + (i.done ? '✓' : '') + '</div>' +
                '<div class="shop-info">' +
                '<div class="shop-title ' + (i.done ? 'done' : '') + '">' + i.name + '</div>' +
                '<div class="shop-price">' + (cat ? cat.icon + ' ' : '') + (i.category || '') + (i.notes ? ' · ' + i.notes : '') + '</div>' +
                '</div>' +
                '<div class="shop-value">' + (i.price ? g.formatCurrency(i.price) : '') + '</div>' +
                '<button class="btn-icon" style="width:32px;height:32px;font-size:14px" data-shop-del="' + i.id + '">🗑️</button>' +
                '</div>';
            }).join('')
          ) +
          '</div>' +
          '</div>' +
          '</div>';

        document.getElementById('addShopBtn').addEventListener('click', showAddItem);
        var checks = container.querySelectorAll('[data-shop-id]');
        for (var ci = 0; ci < checks.length; ci++) {
          (function (el) {
            el.addEventListener('click', function () {
              var item = state.shopping.find(function (x) { return x.id === el.dataset.shopId; });
              if (item) {
                item.done = !item.done;
                g.saveState();
                if (item.done) { g.addXP(2); g.showToast('Purchased: ' + item.name, 'success'); }
                render();
              }
            });
          })(checks[ci]);
        }
        var dels = container.querySelectorAll('[data-shop-del]');
        for (var di = 0; di < dels.length; di++) {
          (function (el) {
            el.addEventListener('click', function () {
              var idx = state.shopping.findIndex(function (x) { return x.id === el.dataset.shopDel; });
              if (idx >= 0) {
                state.shopping.splice(idx, 1);
                g.saveState();
                render();
                g.showToast('Item removed', 'info');
              }
            });
          })(dels[di]);
        }
      }

      function showAddItem() {
        var html =
          '<div class="input-group"><label>Item Name</label><div class="input-wrap"><input type="text" id="modalName" placeholder="e.g. Milk"></div></div>' +
          '<div class="input-group"><label>Category</label><div class="input-wrap"><select id="modalCategory">' +
          SHOP_CATS.map(function (c) { return '<option value="' + c.name + '">' + c.icon + ' ' + c.name + '</option>'; }).join('') +
          '</select></div></div>' +
          '<div class="input-group"><label>Est. Price ($)</label><div class="input-wrap"><input type="number" id="modalPrice" placeholder="0.00" step="0.01" min="0"></div></div>' +
          '<div class="input-group"><label>Notes</label><div class="input-wrap"><input type="text" id="modalNotes" placeholder="Optional"></div></div>';
        g.showModal(html, function () {
          var name = document.getElementById('modalName').value;
          var cat = document.getElementById('modalCategory').value;
          var price = document.getElementById('modalPrice').value;
          var notes = document.getElementById('modalNotes').value;
          if (!name) return;
          var state = g.FPState;
          state.shopping.push({ id: g.uid(), name: name, category: cat, price: price ? Number(price) : 0, notes: notes, done: false });
          g.saveState();
          g.addXP(2);
          render();
          g.showToast('Added: ' + name, 'success');
        }, 'Add Item');
      }
    }
  };
})();