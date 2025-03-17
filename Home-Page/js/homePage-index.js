// Skins kiezen

function toggleSelection(imgElement) {
    
    document.querySelectorAll('.character-selection').forEach(menu => {
        menu.classList.remove('active');
    });

    
    const selectionMenu = imgElement.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectCharacter(optionElement) {
  
    const mainImage = optionElement.closest('.character-selection').previousElementSibling;
    
    
    mainImage.src = optionElement.src;
    
    
    optionElement.closest('.character-selection').classList.remove('active');
}


document.addEventListener('click', (event) => {
    if (!event.target.closest('.character-slot')) {
        document.querySelectorAll('.character-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


// Wapen selectie
function toggleSelection(container) {
    
    document.querySelectorAll('.weapon-selection').forEach(menu => {
        if (menu !== container.nextElementSibling) {
            menu.classList.remove('active');
        }
    });

    
    const selectionMenu = container.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectWeapon(optionElement) {
    
    const container = optionElement.closest('.weapon-selection').previousElementSibling;
    const mainImage = container.querySelector('.weapon-image');
    
    
    mainImage.src = optionElement.src;
    
   
    optionElement.closest('.weapon-selection').classList.remove('active');
}


document.addEventListener('click', (event) => {
    if (!event.target.closest('.weapon-slot')) {
        document.querySelectorAll('.weapon-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


// Emote Selectie 
function toggleSelection(container) {
    
    document.querySelectorAll('.emote-selection').forEach(menu => {
        if (menu !== container.nextElementSibling) {
            menu.classList.remove('active');
        }
    });

    
    const selectionMenu = container.nextElementSibling;
    selectionMenu.classList.toggle('active');
}

function selectEmote(optionElement) {
    
    const container = optionElement.closest('.emote-selection').previousElementSibling;
    const mainImage = container.querySelector('.emote-image');
    
   
    mainImage.src = optionElement.src;
    
   
    optionElement.closest('.emote-selection').classList.remove('active');
}


document.addEventListener('click', (event) => {
    if (!event.target.closest('.emote-slot')) {
        document.querySelectorAll('.emote-selection').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

