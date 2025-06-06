class SelectionManager {
  constructor(type) {
    this.type = type;
    this.selector = `.${type}-selection`;
    this.slotSelector = `.${type}-slot`;
    if (document.querySelector(this.selector) || document.querySelector(this.slotSelector)) {
      this.initEventListeners();
    }
  }

  toggleMenu(imgElement) {
    document.querySelectorAll(this.selector).forEach(menu => menu.classList.remove('active'));
    imgElement.nextElementSibling.classList.toggle('active');
  }

  selectItem(optionElement) {
    const mainImage = optionElement.closest(this.selector).previousElementSibling;
    mainImage.src = optionElement.src;
    optionElement.closest(this.selector).classList.remove('active');
  }

  initEventListeners() {
    document.addEventListener('click', e => {
      if (!e.target.closest(this.slotSelector)) {
        document.querySelectorAll(this.selector).forEach(menu => menu.classList.remove('active'));
      }
    });
  }
}
function selectItem(type, skinId) {
    if (!user.inventory.includes(skinId)) {
        showPurchasePrompt(skinId);
        return;
    }
    
    const preview = document.getElementById(`${type}Preview`);
    preview.src = `assets/images/${type}${skinId}.webp`;
    state.selected[type] = skinId;
    updateContinueButton();
}

function showPurchasePrompt(skinId) {
    // Haal skin data op uit je JSON
    const skin = skinsData.data.items.br.find(i => i.id === skinId);
    if (confirm(`Wil je ${skin.name} kopen voor ${skin.price} coins?`)) {
        fetch('/shop/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                itemId: skinId, 
                price: skin.price 
            })
        }).then(response => {
            if (response.ok) location.reload();
        });
    }
}
function initializeDarkMode() {
  const modeSwitch = document.getElementById('modeSwitch');
  if (!modeSwitch && !document.body.classList.contains('dark-mode')) return;

  const isDark = localStorage.getItem('darkMode') === 'true' || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'));

  document.body.classList.toggle('dark-mode', isDark);
  if (modeSwitch) modeSwitch.checked = isDark;

  modeSwitch?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
}

class Carousel {
  constructor() {
    this.cards = Array.from(document.querySelectorAll('.card'));
    if (this.cards.length === 0) return;

    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    
    if (!this.prevBtn || !this.nextBtn) return;

    this.activeIndex = 0;
    this.totalCards = this.cards.length;
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updatePositions();
  }

  setupEventListeners() {
    this.prevBtn.addEventListener('click', () => this.navigate(-1));
    this.nextBtn.addEventListener('click', () => this.navigate(1));

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });

    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.navigate(1) : this.navigate(-1);
    });
  }

  navigate(direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.activeIndex = (this.activeIndex + direction + this.totalCards) % this.totalCards;
    this.updatePositions();
    setTimeout(() => this.isAnimating = false, 600);
  }

  updatePositions() {
  this.cards.forEach((card, index) => {
    card.classList.remove('active', 'next', 'prev', 'far-right', 'far-left', 'hidden');

    const offset = (index - this.activeIndex + this.totalCards) % this.totalCards;

    if (offset === 0) {
      card.classList.add('active');
    } else if (offset === 1) {
      card.classList.add('next');
    } else if (offset === this.totalCards - 1) {
      card.classList.add('prev');
    } else if (offset === 2) {
      card.classList.add('far-right');
    } else if (offset === this.totalCards - 2) {
      card.classList.add('far-left');
    } else {
      card.classList.add('hidden');
    }
  });
}

}

function setupCookieConsent() {
  const cookieCard = document.querySelector('.cookies-card');
  if (!cookieCard) return;

  const buttons = ['exit', 'accept', 'reject'].map(c => document.querySelector(`.${c}`));
  
  const closePopup = () => {
    cookieCard.classList.add('hide');
    setTimeout(() => cookieCard.style.display = 'none', 300);
  };

  buttons[0]?.addEventListener('click', closePopup);
  buttons[1]?.addEventListener('click', () => {
    buttons[1].innerHTML = '<i class="ri-check-line"></i>';
    closePopup();
  });
  buttons[2]?.addEventListener('click', () => {
    buttons[2].innerHTML = '<i class="ri-emotion-sad-fill"></i>';
    closePopup();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();

  if (document.querySelectorAll('.card').length > 0) {
    new Carousel();
  }
  
  setupCookieConsent();

  const managers = ['character', 'weapon', 'emote']
    .filter(type => document.querySelector(`.${type}-selection`) || document.querySelector(`.${type}-slot`))
    .map(t => new SelectionManager(t));
    
  managers.forEach(manager => {
    window[`toggle${manager.type.charAt(0).toUpperCase() + manager.type.slice(1)}Selection`] = 
      img => manager.toggleMenu(img);
    window[`select${manager.type.charAt(0).toUpperCase() + manager.type.slice(1)}`] = 
      option => manager.selectItem(option);
  });

  const searchIcon = document.getElementById('search-icon');
  const searchInput = document.querySelector('.search-input');
  if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', e => {
      e.stopPropagation();
      searchInput.classList.toggle('active');
      searchInput.classList.contains('active') && searchInput.focus();
    });
    document.addEventListener('click', e => !e.target.closest('.search-container') && searchInput.classList.remove('active'));
    searchInput.addEventListener('keypress', e => e.key === 'Enter' && console.log('Search:', searchInput.value));
  }


  // user account
const userIcon = document.querySelector('.header-user-avatar'); // Specific to header
const accountCard = document.querySelector('.account-card');

if (userIcon && accountCard) {
  userIcon.addEventListener('click', e => {
    e.stopPropagation();
    accountCard.classList.toggle('show');
  });

  document.addEventListener('click', e => {
    if (!accountCard.contains(e.target) && !userIcon.contains(e.target)) {
      accountCard.classList.remove('show');
    }
  });
}

  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');
  if (sidebar && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    };
    document.querySelectorAll('.ri-menu-line, .sidebar-close').forEach(el => el.addEventListener('click', toggleSidebar));
    overlay.addEventListener('click', toggleSidebar);
    document.addEventListener('keydown', e => e.key === 'Escape' && toggleSidebar());
  }

  const cardButtons = document.querySelectorAll('.card-button');
  if (cardButtons.length > 0) {
    cardButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!this.classList.contains('available')) {
          this.classList.add('shake');
          setTimeout(() => this.classList.remove('shake'), 300);
        }
        this.classList.contains('available') && setTimeout(() => window.location.href = this.closest('a').href, 500);
      });
    });
  }
});
    document.querySelectorAll('.flip-container').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'email') alert('❌ Verkeerd e-mailadres');
    if (params.get('error') === 'password') alert('❌ Verkeerd wachtwoord');
});
document.addEventListener('DOMContentLoaded', () => {
   
  
const handlePurchase = async (itemId, price) => {
  try {
    const numericPrice = Number(price);
    
    const response = await fetch('/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        itemId: String(itemId), 
        price: numericPrice
      })
    });

        const result = await response.json();
        
        if (result.error) {
            alert(result.error);
        } else {
            document.querySelectorAll(`[data-item-id="${itemId}"] .cart-icon`).forEach(icon => {
                icon.outerHTML = `<div class="owned-badge"><i class="ri-checkbox-circle-fill"></i></div>`;
            });
            
            document.querySelectorAll(`[data-item-id="${itemId}"] .price`).forEach(priceElement => {
                priceElement.classList.remove('clickable');
                priceElement.innerHTML = `
                    <i class="ri-copper-diamond-line"></i>
                    <span class="owned-text">Gekocht</span>
                `;
            });

            document.querySelectorAll('.coin-display, #coins-display').forEach(el => {
                el.textContent = result.coins;
            });
        }
    } catch (error) {
        alert('Aankoop mislukt, probeer later opnieuw');
    }
};

document.querySelectorAll('.cart-icon, .price.clickable').forEach(element => {
    element.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        const itemId = target.dataset.itemId;
        const itemName = target.dataset.itemName;
        const price = parseInt(target.dataset.itemPrice);

        if (confirm(`Weet je zeker dat je "${itemName}" wilt kopen voor ${price} coins?`)) {
            await handlePurchase(itemId, price);
        }
    });
});
});


