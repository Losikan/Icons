// Unified Selection Handler
class SelectionManager {
  constructor(type) {
      this.type = type;
      this.selector = `.${type}-selection`;
      this.slotSelector = `.${type}-slot`;
      this.initEventListeners();
  }

  toggleMenu(imgElement) {
      document.querySelectorAll(this.selector).forEach(menu => {
          menu.classList.remove('active');
      });
      const menu = imgElement.nextElementSibling;
      menu.classList.toggle('active');
  }

  selectItem(optionElement) {
      const mainImage = optionElement.closest(this.selector).previousElementSibling;
      mainImage.src = optionElement.src;
      optionElement.closest(this.selector).classList.remove('active');
  }

  initEventListeners() {
      document.addEventListener('click', (e) => {
          if (!e.target.closest(this.slotSelector)) {
              document.querySelectorAll(this.selector).forEach(menu => {
                  menu.classList.remove('active');
              });
          }
      });
  }
}

// Initialize Managers
const characterManager = new SelectionManager('character');
const weaponManager = new SelectionManager('weapon');
const emoteManager = new SelectionManager('emote');

// Expose functions
window.toggleCharacterSelection = (img) => characterManager.toggleMenu(img);
window.selectCharacter = (option) => characterManager.selectItem(option);
window.toggleWeaponSelection = (img) => weaponManager.toggleMenu(img);
window.selectWeapon = (option) => weaponManager.selectItem(option);
window.toggleEmoteSelection = (img) => emoteManager.toggleMenu(img);
window.selectEmote = (option) => emoteManager.selectItem(option);

// Dark Mode
const modeSwitch = document.getElementById('modeSwitch');

function initializeDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true' || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'));
  document.body.classList.toggle('dark-mode', isDark);
  modeSwitch.checked = isDark;
}

modeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Initialize
initializeDarkMode();