const products = [
  {
    id: 'aero-h01',
    name: 'Aero H-01',
    category: 'Sound',
    price: 240,
    description: 'Spatial audio, softened edges.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    alt: 'Black over-ear headphones',
  },
  {
    id: 'flux-m02',
    name: 'Flux M-02',
    category: 'Motion',
    price: 185,
    description: 'Time, made tactile.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
    alt: 'Minimal black watch',
  },
  {
    id: 'arc-w03',
    name: 'Arc W-03',
    category: 'Wear',
    price: 160,
    description: 'The daily uniform, evolved.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    alt: 'Bright red sneaker',
  },
  {
    id: 'mod-c04',
    name: 'Mod C-04',
    category: 'Carry',
    price: 210,
    description: 'Everything, in its place.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
    alt: 'Black utility backpack',
  },
  {
    id: 'halo-w05',
    name: 'Halo W-05',
    category: 'Wear',
    price: 95,
    description: 'A frame for the future.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85',
    alt: 'Black sunglasses',
  },
  {
    id: 'still-c06',
    name: 'Still C-06',
    category: 'Carry',
    price: 68,
    description: 'Hydration, re-engineered.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85',
    alt: 'Minimal reusable bottle',
  },
];

const state = {
  filter: 'All',
  query: '',
  cart: [],
  quickViewId: null,
};

const productGrid = document.querySelector('#product-grid');
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const bagButton = document.querySelector('.bag-button');
const bagCount = document.querySelector('.bag-count');
const drawerCount = document.querySelector('.drawer-count');
const cartDrawer = document.querySelector('.cart-drawer');
const drawerBackdrop = document.querySelector('.drawer-backdrop');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.cart-empty');
const subtotal = document.querySelector('.subtotal strong');
const toast = document.querySelector('.toast');
const toastMessage = document.querySelector('.toast-message');
const quickView = document.querySelector('.quick-view');
const searchDock = document.querySelector('.search-dock');
const searchInput = document.querySelector('#search-input');
const mobileNav = document.querySelector('.primary-nav');

const money = (amount) => `$${amount.toLocaleString('en-US')}`;

function visibleProducts() {
  return products.filter((product) => {
    const matchesFilter = state.filter === 'All' || product.category === state.filter;
    const haystack = `${product.name} ${product.category} ${product.description} ${product.alt}`.toLowerCase();
    return matchesFilter && haystack.includes(state.query.toLowerCase());
  });
}

function renderProducts() {
  const visible = visibleProducts();
  productGrid.innerHTML = visible.length
    ? visible.map((product, index) => `
      <article class="product-card" style="animation-delay: ${index * 70}ms">
        <div class="product-art">
          <img src="${product.image}" alt="${product.alt}" loading="lazy" />
          <div class="product-card-top"><span>${product.category}</span><button class="quick-view-button" type="button" data-quick-view="${product.id}">Quick view</button></div>
        </div>
        <div class="product-card-bottom">
          <div class="product-info"><span class="product-name">${product.name}</span><p class="product-description">${product.description}</p></div>
          <div class="product-card-actions"><span class="product-price">${money(product.price)}</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></div>
        </div>
      </article>
    `).join('')
    : '<p class="no-results">No objects found in this frequency. Try another signal.</p>';
}

function updateFilter(filter) {
  state.filter = filter;
  state.query = '';
  if (searchInput) searchInput.value = '';
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  renderProducts();
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) existing.quantity += 1;
  else state.cart.push({ id: productId, quantity: 1 });
  updateCart();
  const product = products.find((item) => item.id === productId);
  showToast(`${product.name} added to your orbit.`);
}

function changeQuantity(productId, change) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  updateCart();
}

function updateCart() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  bagCount.textContent = count;
  drawerCount.textContent = `(${count})`;
  subtotal.textContent = money(total);
  cartEmpty.classList.toggle('hidden', state.cart.length > 0);
  cartItems.innerHTML = state.cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `
      <div class="cart-item">
        <div class="cart-item-image"><img src="${product.image}" alt="${product.alt}" /></div>
        <div class="cart-item-info"><span class="cart-item-name">${product.name}</span><span class="cart-item-meta">${product.category} · ${money(product.price)}</span><div class="cart-item-controls"><button class="qty-button" type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button><span>${item.quantity}</span><button class="qty-button" type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button></div></div>
        <span class="cart-item-price">${money(product.price * item.quantity)}</span>
      </div>
    `;
  }).join('');
}

function setDrawer(open) {
  cartDrawer.classList.toggle('open', open);
  drawerBackdrop.classList.toggle('open', open);
  cartDrawer.setAttribute('aria-hidden', String(!open));
  bagButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

function setSearch(open) {
  searchDock.classList.toggle('open', open);
  searchDock.setAttribute('aria-hidden', String(!open));
  document.querySelector('.search-toggle').setAttribute('aria-expanded', String(open));
  if (open) window.setTimeout(() => searchInput.focus(), 260);
}

function setQuickView(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  state.quickViewId = productId;
  quickView.querySelector('.quick-image img').src = product.image;
  quickView.querySelector('.quick-image img').alt = product.alt;
  quickView.querySelector('#quick-view-title').textContent = product.name;
  quickView.querySelector('.quick-description').textContent = `${product.description} A considered object for your everyday orbit.`;
  quickView.querySelector('.quick-price').textContent = money(product.price);
  quickView.querySelector('.quick-category').textContent = product.category;
  quickView.classList.add('open');
  quickView.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  quickView.classList.remove('open');
  quickView.setAttribute('aria-hidden', 'true');
  state.quickViewId = null;
  if (!cartDrawer.classList.contains('open')) document.body.style.overflow = '';
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => updateFilter(button.dataset.filter));
});

document.querySelectorAll('.collection-card[data-filter]').forEach((card) => {
  card.addEventListener('click', () => {
    updateFilter(card.dataset.filter);
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

productGrid.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  const quickButton = event.target.closest('[data-quick-view]');
  if (addButton) addToCart(addButton.dataset.add);
  if (quickButton) setQuickView(quickButton.dataset.quickView);
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (button) changeQuantity(button.dataset.quantity, Number(button.dataset.change));
});

bagButton.addEventListener('click', () => setDrawer(true));
document.querySelector('.close-drawer').addEventListener('click', () => setDrawer(false));
drawerBackdrop.addEventListener('click', () => setDrawer(false));
document.querySelector('.search-toggle').addEventListener('click', () => setSearch(!searchDock.classList.contains('open')));
document.querySelector('.quick-close').addEventListener('click', closeQuickView);
document.querySelector('.quick-view-backdrop').addEventListener('click', closeQuickView);
document.querySelector('.quick-add').addEventListener('click', () => {
  if (state.quickViewId) addToCart(state.quickViewId);
  closeQuickView();
});

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const open = mobileNav.classList.toggle('open');
  event.currentTarget.classList.toggle('open', open);
  event.currentTarget.setAttribute('aria-expanded', String(open));
});

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.querySelector('.menu-toggle').classList.remove('open');
    document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast('You are on the signal.');
});

document.querySelector('.checkout-button').addEventListener('click', () => {
  if (!state.cart.length) {
    showToast('Your orbit is waiting for an object.');
    return;
  }
  showToast('Checkout is ready for the next step.');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setSearch(false);
    setDrawer(false);
    closeQuickView();
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const heroVisual = document.querySelector('.hero-visual');
heroVisual.addEventListener('pointermove', (event) => {
  const bounds = heroVisual.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 18;
  heroVisual.style.setProperty('--mouse-x', `${x}px`);
  heroVisual.style.setProperty('--mouse-y', `${y}px`);
});
heroVisual.addEventListener('pointerleave', () => {
  heroVisual.style.setProperty('--mouse-x', '0px');
  heroVisual.style.setProperty('--mouse-y', '0px');
});

renderProducts();
updateCart();
