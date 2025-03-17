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

