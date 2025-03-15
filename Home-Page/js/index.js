// Character

function toggleSelection(imgElement) {
    // Close all other selection menus
    document.querySelectorAll('.character-selection').forEach(menu => {
        menu.classList.remove('active');
    });

    // Toggle the selection menu for the clicked image
    const selectionMenu = imgElement.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectCharacter(optionElement) {
    // Get the parent slot's main image
    const mainImage = optionElement.closest('.character-selection').previousElementSibling;
    
    // Update the main image with the selected option
    mainImage.src = optionElement.src;
    
    // Close the selection menu
    optionElement.closest('.character-selection').classList.remove('active');
}

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.character-slot')) {
        document.querySelectorAll('.character-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


// Weapon

function toggleSelection(imgElement) {
    // Close all other selection menus
    document.querySelectorAll('.weapon-selection').forEach(menu => {
        menu.classList.remove('active');
    });

    // Toggle the selection menu for the clicked image
    const selectionMenu = imgElement.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectWeapon(optionElement) {
    // Get the parent slot's main image
    const mainImage = optionElement.closest('.weapon-selection').previousElementSibling;
    
    // Update the main image with the selected option
    mainImage.src = optionElement.src;
    
    // Close the selection menu
    optionElement.closest('.weapon-selection').classList.remove('active');
}

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.weapon-slot')) {
        document.querySelectorAll('.weapon-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


// Emote

function toggleSelection(imgElement) {
    // Close all other selection menus
    document.querySelectorAll('.emote-selection').forEach(menu => {
        menu.classList.remove('active');
    });

    // Toggle the selection menu for the clicked image
    const selectionMenu = imgElement.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectEmote(optionElement) {
    // Get the parent slot's main image
    const mainImage = optionElement.closest('.emote-selection').previousElementSibling;
    
    // Update the main image with the selected option
    mainImage.src = optionElement.src;
    
    // Close the selection menu
    optionElement.closest('.emote-selection').classList.remove('active');
}

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.emote-slot')) {
        document.querySelectorAll('.emote-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


/* header */

// Dark mode functionaliteit
const modeSwitch = document.getElementById('modeSwitch');

if (localStorage.getItem('darkMode') === 'true' || 
   (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'))) {
  document.body.classList.add('dark-mode');
  modeSwitch.checked = true;
}

modeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Zoekfunctionaliteit //
const searchIcon = document.getElementById('search-icon');
const searchInput = document.querySelector('.search-input');

searchIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  searchInput.classList.toggle('active');
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    searchInput.classList.remove('active');
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    console.log('Zoekopdracht:', searchInput.value);
    searchInput.value = '';
    searchInput.classList.remove('active');
  }
});