/* ============================================
   Slik Suede — Cart & Product Logic
   ============================================ */

const BASE_PRODUCTS = [
  { id: 1, name: 'Obsidian Suede Blazer', category: 'Outerwear', price: 2899, image: 'assets/product-01.jpg', badge: 'New' },
  { id: 2, name: 'Champagne Oxford Shirt', category: 'Shirts', price: 1699, image: 'assets/product-02.jpg', badge: 'New' },
  { id: 3, name: 'Mocha Cashmere Sweater', category: 'Knitwear', price: 2599, image: 'assets/product-03.jpg', badge: 'Bestseller' },
  { id: 4, name: 'Onyx Tailored Trousers', category: 'Bottoms', price: 1899, image: 'assets/product-04.jpg', badge: '' },
  { id: 5, name: 'Ivory Linen Shirt', category: 'Shirts', price: 2499, image: 'assets/product-05.jpg', badge: 'Premium' },
  { id: 6, name: 'Camel Suede Chinos', category: 'Bottoms', price: 1999, image: 'assets/product-06.jpg', badge: '' },
  { id: 7, name: 'Espresso Merino Turtleneck', category: 'Knitwear', price: 2299, image: 'assets/product-07.jpg', badge: '' },
  { id: 8, name: 'Pearl Wool Scarf', category: 'Accessories', price: 1599, image: 'assets/product-08.jpg', badge: '' },
  { id: 9, name: 'Gold Wool Overcoat', category: 'Outerwear', price: 2799, image: 'assets/product-09.jpg', badge: 'Premium' },
  { id: 10, name: 'Charcoal Cropped Jacket', category: 'Outerwear', price: 2499, image: 'assets/product-10.jpg', badge: '' },
  { id: 11, name: 'Sand Slim-Fit Jeans', category: 'Bottoms', price: 1799, image: 'assets/product-11.jpg', badge: 'Bestseller' },
  { id: 12, name: 'Velvet Evening Blazer', category: 'Outerwear', price: 2199, image: 'assets/product-12.jpg', badge: '' },
  { id: 13, name: 'Slate Cotton Overshirt', category: 'Shirts', price: 1699, image: 'assets/product-13.jpg', badge: 'New' },
  { id: 14, name: 'Midnight Wool Coat', category: 'Outerwear', price: 2999, image: 'assets/product-14.jpg', badge: 'Premium' },
  { id: 15, name: 'Bronze Silk Scarf Set', category: 'Accessories', price: 1999, image: 'assets/product-15.jpg', badge: '' }
];

const PRODUCTS = BASE_PRODUCTS.concat(typeof EXTRA_PRODUCTS !== 'undefined' ? EXTRA_PRODUCTS : []);

const CART_KEY = 'sliksuede_cart';

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCartSidebar();
}

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  showToast('Added to cart!');
  openCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const el = document.querySelector('.cart-count');
  if (!el) return;
  const count = getCartCount();
  el.textContent = count;
  el.style.display = count > 0 ? 'flex' : 'none';
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function openCart() {
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.querySelector('.cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.querySelector('.cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartSidebar() {
  const container = document.querySelector('.cart-items');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    const totalEl = document.querySelector('.cart-total-amount');
    if (totalEl) totalEl.textContent = formatINR(0);
    return;
  }

  container.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return '';
    return `
      <div class="cart-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <div class="price">${formatINR(product.price)}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${product.id})">Remove</button>
      </div>`;
  }).join('');

  const totalEl = document.querySelector('.cart-total-amount');
  if (totalEl) totalEl.textContent = formatINR(getCartTotal());
}

function createProductCard(product) {
  const badge = product.badge
    ? `<span class="product-badge">${product.badge}</span>`
    : '';
  return `
    <div class="product-card">
      <div class="product-image">
        ${badge}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="category">${product.category}</p>
        <div class="product-footer">
          <span class="product-price">${formatINR(product.price)}</span>
          <button class="add-to-cart" onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

function initShopPage() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const countEl = document.getElementById('shop-count');
  if (countEl) countEl.textContent = PRODUCTS.length;

  renderShopGrid(PRODUCTS);

  const filters = document.getElementById('shop-filters');
  if (!filters) return;

  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];
  filters.innerHTML = categories.map(cat =>
    `<button class="filter-btn${cat === 'All' ? ' active' : ''}" data-category="${cat}">${cat}</button>`
  ).join('');

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    const filtered = cat === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
    renderShopGrid(filtered);
  });
}

function renderShopGrid(items) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = items.map(createProductCard).join('');
}

function initFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  if (!grid) return;
  const featured = PRODUCTS.slice(0, 15);
  grid.innerHTML = featured.map(createProductCard).join('');
}

function initCheckoutPage() {
  const summaryItems = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const shippingEl = document.getElementById('checkout-shipping');
  const totalEl = document.getElementById('checkout-total');
  if (!summaryItems) return;

  const cart = getCart();
  if (cart.length === 0) {
    summaryItems.innerHTML = '<p style="color:var(--muted);padding:20px 0;">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
    if (subtotalEl) subtotalEl.textContent = formatINR(0);
    if (shippingEl) shippingEl.textContent = formatINR(0);
    if (totalEl) totalEl.textContent = formatINR(0);
    return;
  }

  summaryItems.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return '';
    return `
      <div class="checkout-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="checkout-item-details">
          <h4>${product.name}</h4>
          <p>Qty: ${item.qty}</p>
        </div>
        <span class="checkout-item-price">${formatINR(product.price * item.qty)}</span>
      </div>`;
  }).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 199;
  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatINR(shipping);
  if (totalEl) totalEl.textContent = formatINR(subtotal + shipping);
}

function initPaymentOptions() {
  const options = document.querySelectorAll('.payment-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });
}

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    const payment = form.querySelector('input[name="payment"]:checked');
    if (!payment) {
      showToast('Please select a payment method');
      return;
    }
    const gateway = payment.value === 'razorpay' ? 'Razorpay' : 'Cashfree';
    showToast(`Order placed! Redirecting to ${gateway}...`);
    setTimeout(() => {
      localStorage.removeItem(CART_KEY);
      window.location.href = 'index.html';
    }, 2000);
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.');
    form.reset();
  });
}

function initHeader() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  toggle?.addEventListener('click', () => nav?.classList.toggle('open'));

  document.querySelector('.cart-btn')?.addEventListener('click', openCart);
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  updateCartCount();
  renderCartSidebar();
  initShopPage();
  initFeaturedProducts();
  initCheckoutPage();
  initPaymentOptions();
  initCheckoutForm();
  initContactForm();
});
