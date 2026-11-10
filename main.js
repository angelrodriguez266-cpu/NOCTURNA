/**
 * NØCTURNA® - CULTURE AFTER DARK
 * Interactive Front-End Engine with Multi-view and Carousels
 */

document.addEventListener('DOMContentLoaded', () => {
  // Header scroll appearance enhancement
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    if (window.scrollY > 30) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });
  // --- Cart State ---
  let cart = [];
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBtn = document.getElementById('cartToggleBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const toastNotice = document.getElementById('toastNotice');

  // Format currency COP
  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const showToast = (msg) => {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  };

  const updateCartUI = () => {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartBadge) cartBadge.textContent = totalItems;

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<div class="cart-empty-msg">Tu carrito está vacío</div>';
      if (cartSubtotal) cartSubtotal.textContent = '$0 COP';
      return;
    }

    let subtotal = 0;
    cartItemsList.innerHTML = cart.map((item, index) => {
      subtotal += item.price * item.quantity;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatCOP(item.price)} × ${item.quantity}</div>
          </div>
          <button class="cart-item-remove" data-index="${index}" aria-label="Eliminar producto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    if (cartSubtotal) {
      cartSubtotal.textContent = formatCOP(subtotal);
    }

    // Attach remove handlers
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  };

  const toggleCart = (open) => {
    if (!cartOverlay) return;
    if (open) {
      cartOverlay.classList.add('active');
    } else {
      cartOverlay.classList.remove('active');
    }
  };

  if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCart(false));
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) toggleCart(false);
    });
  }

  // Quick add to cart buttons
  document.querySelectorAll('.quick-add-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = button.dataset.name;
      const price = parseInt(button.dataset.price, 10);
      const image = button.dataset.image;

      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name, price, image, quantity: 1 });
      }

      updateCartUI();
      showToast(`+1 ${name} AGREGADO`);
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('active'));
    });
  }

  // --- CAROUSEL NAVIGATION CONTROLS ---
  // Setup horizontal scroll helper
  const setupCarouselControls = (viewportId, prevBtnId, nextBtnId) => {
    const viewport = document.getElementById(viewportId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!viewport || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
      const scrollStep = viewport.clientWidth * 0.75;
      viewport.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const scrollStep = viewport.clientWidth * 0.75;
      viewport.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });
  };

  setupCarouselControls('camisasViewport', 'camisasPrevBtn', 'camisasNextBtn');
  setupCarouselControls('postersViewport', 'postersPrevBtn', 'postersNextBtn');

  // --- SHIRT PRESENTATION INTERCHANGE (Frontal, Espalda, Manga) ---
  const shirtCards = document.querySelectorAll('.product-slide-card');
  const viewNames = ['FRONTAL', 'ESPALDA', 'MANGA'];

  shirtCards.forEach(card => {
    const imgDisplay = card.querySelector('.product-img-display');
    const viewTag = card.querySelector('.product-view-tag');
    const dots = card.querySelectorAll('.view-dot-btn');

    const views = [
      card.dataset.front,
      card.dataset.back,
      card.dataset.sleeve
    ];

    let currentIndex = 0;
    let autoInterval = null;

    const setView = (idx) => {
      currentIndex = idx;
      if (imgDisplay) {
        imgDisplay.src = views[idx];
      }
      if (viewTag) {
        viewTag.textContent = viewNames[idx];
      }
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === idx);
      });
    };

    // Manual view switch via dot buttons
    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        setView(dotIdx);
      });
    });

    // Auto cycle interval every 3.2 seconds
    const startCycle = () => {
      if (autoInterval) clearInterval(autoInterval);
      autoInterval = setInterval(() => {
        const nextIdx = (currentIndex + 1) % 3;
        setView(nextIdx);
      }, 3200);
    };

    const stopCycle = () => {
      if (autoInterval) clearInterval(autoInterval);
    };

    // Start auto cycle
    startCycle();

    // Pause on hover for closer inspection, resume on mouse leave
    card.addEventListener('mouseenter', stopCycle);
    card.addEventListener('mouseleave', startCycle);
  });

  // --- POSTERS LIGHTBOX MODAL ---
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  const openLightbox = (src, title) => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = title;
    lightboxModal.classList.add('active');
  };

  const closeLightbox = () => {
    if (lightboxModal) lightboxModal.classList.remove('active');
  };

  document.querySelectorAll('.poster-slide-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.poster-img');
      const title = card.querySelector('.poster-title')?.textContent || 'POSTER NØCTURNA';
      if (img) { const fullSrc = img.dataset.full || img.src; openLightbox(fullSrc, title); }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // --- NEWSLETTER VALIDATION ---
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newsletterMsg.className = 'newsletter-msg error';
        newsletterMsg.textContent = 'POR FAVOR INGRESA UN CORREO VÁLIDO.';
        return;
      }

      newsletterMsg.className = 'newsletter-msg success';
      newsletterMsg.textContent = 'BIENVENIDO AL CÍRCULO NØCTURNA. REVISA TU BANDEJA.';
      newsletterForm.reset();
      showToast('SUSCRIPCIÓN CONFIRMADA');
    });
  }

  // --- SIMULATION CHECKOUT BUTTON ---
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('EL CARRITO ESTÁ VACÍO');
        return;
      }
      showToast('PASARELA DE PAGO EN PREPARACIÓN...');
    });
  }
});