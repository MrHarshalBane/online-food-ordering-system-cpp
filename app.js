/**
 * Online Food Ordering System (C++) — Web & Terminal Logic
 * Directly emulates the OOP logic from order.cpp (FoodItem, Menu, Order, Customer)
 */

// Menu definition matching main() in order.cpp
const MENU_DATA = [
  { id: 1, name: 'Pizza', price: 250, icon: '🍕', desc: 'Cheesy thin-crust pizza topped with herbs & veggies' },
  { id: 2, name: 'Burger', price: 120, icon: '🍔', desc: 'Crispy patty, caramelized onions & secret house sauce' },
  { id: 3, name: 'Pasta', price: 180, icon: '🍝', desc: 'Al dente penne in creamy garlic arrabbiata sauce' },
  { id: 4, name: 'Sandwich', price: 100, icon: '🥪', desc: 'Grilled multi-grain sandwich with spiced veggies' },
  { id: 5, name: 'Cold Drink', price: 60, icon: '🥤', desc: 'Chilled refreshing soda on the rocks' }
];

// OOP State matching C++ classes
class WebOrder {
  constructor() {
    this.orderedItems = []; // Array of { item, qty }
  }

  addOrder(item, qty = 1) {
    const existing = this.orderedItems.find(o => o.item.id === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.orderedItems.push({ item, qty });
    }
  }

  removeOrder(itemId) {
    this.orderedItems = this.orderedItems.filter(o => o.item.id !== itemId);
  }

  updateQty(itemId, delta) {
    const existing = this.orderedItems.find(o => o.item.id === itemId);
    if (!existing) return;
    existing.qty += delta;
    if (existing.qty <= 0) {
      this.removeOrder(itemId);
    }
  }

  clear() {
    this.orderedItems = [];
  }

  getTotal() {
    return this.orderedItems.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);
  }
}

const currentOrder = new WebOrder();

// C++ Terminal Emulator State
const termState = {
  step: 'ITEM_CHOICE', // 'ITEM_CHOICE' -> 'MORE_CHOICE' -> 'NAME' -> 'PHONE' -> 'ADDR' -> 'DONE'
  items: [],
  customer: { name: '', phone: '', address: '' }
};

document.addEventListener('DOMContentLoaded', () => {
  renderMenuCards();
  setupTabSwitcher();
  setupCartActions();
  setupTerminal();
  updateCartDisplay();
  updateOOPInspector();
});

/* ==========================================================================
   Render Food Menu Cards
   ========================================================================== */
function renderMenuCards() {
  const container = document.getElementById('menu-cards-container');
  if (!container) return;

  container.innerHTML = MENU_DATA.map(item => `
    <div class="food-card" id="food-card-${item.id}">
      <span class="food-id-tag">#${item.id} (Menu Vector)</span>
      <div class="food-icon-wrap">${item.icon}</div>
      <div>
        <h3 class="food-name">${item.name}</h3>
        <p class="food-desc">${item.desc}</p>
      </div>
      <div class="food-bottom">
        <span class="food-price">Rs. ${item.price}</span>
        <button class="add-btn" onclick="addToTray(${item.id})">
          <span>+ Add</span>
        </button>
      </div>
    </div>
  `).join('');
}

window.addToTray = function(id) {
  const item = MENU_DATA.find(m => m.id === id);
  if (!item) return;
  currentOrder.addOrder(item, 1);
  updateCartDisplay();
  updateOOPInspector();
};

/* ==========================================================================
   Cart & Bill Calculation
   ========================================================================== */
function setupCartActions() {
  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    currentOrder.clear();
    updateCartDisplay();
    updateOOPInspector();
  });

  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();

    if (!name || !phone || !address) {
      alert('Please fill out your Delivery Details (Name, Phone, Address) before placing the order.');
      return;
    }

    showReceiptModal({ name, phone, address });
  });

  document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    document.getElementById('receipt-modal').classList.remove('open');
    currentOrder.clear();
    document.getElementById('customer-form').reset();
    updateCartDisplay();
    updateOOPInspector();
  });
}

function updateCartDisplay() {
  const listEl = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('bill-subtotal');
  const taxEl = document.getElementById('bill-tax');
  const deliveryEl = document.getElementById('bill-delivery');
  const totalEl = document.getElementById('bill-total');
  const placeBtn = document.getElementById('place-order-btn');

  if (currentOrder.orderedItems.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-state">
        <span class="empty-icon">🍽️</span>
        <p>Your order is empty</p>
        <small>Select delicious items from the menu to start your order</small>
      </div>
    `;
    subtotalEl.innerText = 'Rs. 0.00';
    taxEl.innerText = 'Rs. 0.00';
    deliveryEl.innerText = 'Rs. 0.00';
    totalEl.innerText = 'Rs. 0.00';
    placeBtn.disabled = true;
    return;
  }

  listEl.innerHTML = currentOrder.orderedItems.map(({ item, qty }) => `
    <div class="cart-item-row">
      <div class="cart-item-info">
        <span style="font-size: 1.2rem;">${item.icon}</span>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rs. ${item.price} each</div>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-val">${qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove item">✕</button>
      </div>
    </div>
  `).join('');

  const subtotal = currentOrder.getTotal();
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 0 ? 30 : 0;
  const total = subtotal + tax + delivery;

  subtotalEl.innerText = `Rs. ${subtotal.toFixed(2)}`;
  taxEl.innerText = `Rs. ${tax.toFixed(2)}`;
  deliveryEl.innerText = `Rs. ${delivery.toFixed(2)}`;
  totalEl.innerText = `Rs. ${total.toFixed(2)}`;
  placeBtn.disabled = false;
}

window.changeQty = function(id, delta) {
  currentOrder.updateQty(id, delta);
  updateCartDisplay();
  updateOOPInspector();
};

window.removeItem = function(id) {
  currentOrder.removeOrder(id);
  updateCartDisplay();
  updateOOPInspector();
};

function showReceiptModal(cust) {
  const modal = document.getElementById('receipt-modal');
  const itemsContainer = document.getElementById('receipt-items-container');
  const totalVal = document.getElementById('receipt-total-val');
  const custDetails = document.getElementById('receipt-customer-details');

  itemsContainer.innerHTML = currentOrder.orderedItems.map(({ item, qty }) => `
    <div class="receipt-item-line">
      <span>${item.name}</span>
      <span>x${qty}</span>
      <span>Rs. ${(item.price * qty).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = currentOrder.getTotal();
  const tax = Math.round(subtotal * 0.05);
  const delivery = 30;
  const total = subtotal + tax + delivery;

  totalVal.innerText = `Rs. ${total.toFixed(2)}`;
  custDetails.innerHTML = `
    <div><strong>Customer:</strong> ${escapeHtml(cust.name)}</div>
    <div><strong>Phone:</strong> ${escapeHtml(cust.phone)}</div>
    <div><strong>Delivery Address:</strong> ${escapeHtml(cust.address)}</div>
    <div style="margin-top: 0.35rem; color: #4ade80;">Thank you for ordering, ${escapeHtml(cust.name)}!</div>
  `;

  modal.classList.add('open');
}

/* ==========================================================================
   Tab Navigation
   ========================================================================== */
function setupTabSwitcher() {
  const tabMenu = document.getElementById('tab-menu');
  const tabTerm = document.getElementById('tab-terminal');
  const menuView = document.getElementById('menu-view');
  const termView = document.getElementById('terminal-view');

  tabMenu.addEventListener('click', () => {
    tabMenu.classList.add('active');
    tabTerm.classList.remove('active');
    menuView.classList.add('active-view');
    termView.classList.remove('active-view');
  });

  tabTerm.addEventListener('click', () => {
    tabTerm.classList.add('active');
    tabMenu.classList.remove('active');
    termView.classList.add('active-view');
    menuView.classList.remove('active-view');
    setTimeout(() => {
      document.getElementById('term-input')?.focus();
    }, 50);
  });
}

/* ==========================================================================
   C++ Terminal Simulator (order.cpp runtime)
   ========================================================================== */
function setupTerminal() {
  const inputEl = document.getElementById('term-input');
  const promptLabel = document.getElementById('term-prompt-label');
  const historyLog = document.getElementById('term-history-log');
  const consoleEl = document.getElementById('term-console');
  const resetBtn = document.getElementById('term-reset-btn');

  function appendLog(lineHtml) {
    const div = document.createElement('div');
    div.className = 'term-row';
    div.innerHTML = lineHtml;
    historyLog.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function displayMenuInTerminal() {
    appendLog('<span class="t-cyan">------ MENU ------</span>');
    MENU_DATA.forEach(m => {
      appendLog(`<span>${m.id}. ${m.name} - Rs. ${m.price}</span>`);
    });
  }

  function resetTerminalSession() {
    termState.step = 'ITEM_CHOICE';
    termState.items = [];
    termState.customer = { name: '', phone: '', address: '' };
    historyLog.innerHTML = '';
    displayMenuInTerminal();
    promptLabel.innerText = 'Enter item number to order: ';
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();
    updateOOPInspector();
  }

  resetBtn.addEventListener('click', resetTerminalSession);
  displayMenuInTerminal();

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = inputEl.value.trim();
      inputEl.value = '';

      if (val.toLowerCase() === 'restart' || val.toLowerCase() === 'clear') {
        resetTerminalSession();
        return;
      }

      if (termState.step === 'ITEM_CHOICE') {
        appendLog(`<span class="t-amber">Enter item number to order: </span><span class="t-cyan">${escapeHtml(val)}</span>`);
        const choice = parseInt(val, 10);
        if (choice >= 1 && choice <= MENU_DATA.length) {
          const item = MENU_DATA[choice - 1];
          termState.items.push(item);
          appendLog(`<span class="t-green">${item.name} added to your order.</span>`);
        } else {
          appendLog(`<span class="t-red">Invalid choice.</span>`);
        }
        termState.step = 'MORE_CHOICE';
        promptLabel.innerText = 'Do you want to add more items? (y/n): ';
        updateOOPInspector();
      } else if (termState.step === 'MORE_CHOICE') {
        appendLog(`<span class="t-amber">Do you want to add more items? (y/n): </span><span class="t-cyan">${escapeHtml(val)}</span>`);
        if (val.toLowerCase() === 'y') {
          termState.step = 'ITEM_CHOICE';
          displayMenuInTerminal();
          promptLabel.innerText = 'Enter item number to order: ';
        } else {
          termState.step = 'NAME';
          promptLabel.innerText = 'Enter your name: ';
        }
      } else if (termState.step === 'NAME') {
        appendLog(`<span class="t-amber">Enter your name: </span><span class="t-cyan">${escapeHtml(val)}</span>`);
        termState.customer.name = val;
        termState.step = 'PHONE';
        promptLabel.innerText = 'Enter your phone number: ';
        updateOOPInspector();
      } else if (termState.step === 'PHONE') {
        appendLog(`<span class="t-amber">Enter your phone number: </span><span class="t-cyan">${escapeHtml(val)}</span>`);
        termState.customer.phone = val;
        termState.step = 'ADDR';
        promptLabel.innerText = 'Enter your address: ';
        updateOOPInspector();
      } else if (termState.step === 'ADDR') {
        appendLog(`<span class="t-amber">Enter your address: </span><span class="t-cyan">${escapeHtml(val)}</span>`);
        termState.customer.address = val;
        termState.step = 'DONE';

        // Show Order Output matching order.showOrder()
        appendLog('<span class="t-cyan">------ YOUR ORDER ------</span>');
        let total = 0;
        termState.items.forEach(it => {
          appendLog(`<span>${it.name} - Rs. ${it.price}</span>`);
          total += it.price;
        });
        appendLog(`<span class="t-green">Total Amount: Rs. ${total}</span>`);
        appendLog(`<span>Name: ${escapeHtml(termState.customer.name)}</span>`);
        appendLog(`<span>Phone: ${escapeHtml(termState.customer.phone)}</span>`);
        appendLog(`<span>Address: ${escapeHtml(termState.customer.address)}</span>`);
        appendLog(`<span class="t-amber">Thank you for ordering, ${escapeHtml(termState.customer.name)}!</span>`);
        appendLog('<span class="t-dim">Process finished with exit code 0</span>');

        promptLabel.innerText = 'Session complete. Type "restart" to run again: ';
        updateOOPInspector();
      } else if (termState.step === 'DONE') {
        resetTerminalSession();
      }
    }
  });
}

/* ==========================================================================
   OOP Inspector Updates
   ========================================================================== */
function updateOOPInspector() {
  const vectorCount = document.getElementById('oop-vector-count');
  const vectorContainer = document.getElementById('oop-vector-items');
  const orderTotal = document.getElementById('oop-order-total');
  const custName = document.getElementById('oop-cust-name');
  const custPhone = document.getElementById('oop-cust-phone');
  const custAddr = document.getElementById('oop-cust-addr');

  // We show either terminal state or current GUI order state
  const isTerminalActive = document.getElementById('terminal-view').classList.contains('active-view');
  
  if (isTerminalActive && termState.items.length > 0) {
    vectorCount.innerText = termState.items.length;
    vectorContainer.innerHTML = termState.items.map(it => `
      <span class="vector-chip">FoodItem("${it.name}", ${it.price})</span>
    `).join('');
    const sum = termState.items.reduce((a, b) => a + b.price, 0);
    orderTotal.innerText = `Rs. ${sum.toFixed(2)}`;
    custName.innerText = `"${termState.customer.name || ''}"`;
    custPhone.innerText = `"${termState.customer.phone || ''}"`;
    custAddr.innerText = `"${termState.customer.address || ''}"`;
  } else {
    const totalItems = currentOrder.orderedItems.reduce((a, b) => a + b.qty, 0);
    vectorCount.innerText = totalItems;
    if (currentOrder.orderedItems.length === 0) {
      vectorContainer.innerHTML = '<span class="empty-vector">[ empty vector ]</span>';
    } else {
      vectorContainer.innerHTML = currentOrder.orderedItems.map(({ item, qty }) => `
        <span class="vector-chip">${qty}x FoodItem("${item.name}", ${item.price})</span>
      `).join('');
    }
    orderTotal.innerText = `Rs. ${currentOrder.getTotal().toFixed(2)}`;
    const formName = document.getElementById('cust-name')?.value || '';
    const formPhone = document.getElementById('cust-phone')?.value || '';
    const formAddr = document.getElementById('cust-address')?.value || '';
    custName.innerText = `"${formName}"`;
    custPhone.innerText = `"${formPhone}"`;
    custAddr.innerText = `"${formAddr}"`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
