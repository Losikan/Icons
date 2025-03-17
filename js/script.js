const modeSwitch = document.getElementById("modeSwitch");

if (
  localStorage.getItem("darkMode") === "true" ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches &&
    !localStorage.getItem("darkMode"))
) {
  document.body.classList.add("dark-mode");
  modeSwitch.checked = true;
}

modeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );
});

const searchIcon = document.getElementById("search-icon");
const searchInput = document.querySelector(".search-input");

searchIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  searchInput.classList.toggle("active");
  if (searchInput.classList.contains("active")) {
    searchInput.focus();
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) {
    searchInput.classList.remove("active");
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    console.log("Zoekopdracht:", searchInput.value);
    searchInput.value = "";
    searchInput.classList.remove("active");
  }
});

const userIcon = document.querySelector(".user");
const accountCard = document.querySelector(".account-card");

userIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  accountCard.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!accountCard.contains(e.target) && !userIcon.contains(e.target)) {
    accountCard.classList.remove("show");
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const menuIcon = document.querySelector('.ri-menu-line');
  const overlay = document.querySelector('.overlay');
  const closeIcon = document.querySelector('.sidebar-close');

  const toggleSidebar = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
  };

  menuIcon.addEventListener('click', toggleSidebar);
  closeIcon.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
          toggleSidebar();
      }
  });
});

// Prijs filter
const rangeInput = document.querySelectorAll(".range-input input"),
priceInput = document.querySelectorAll(".price-input input"),
range = document.querySelector(".slider .progress");
let priceGap = 1;

priceInput.forEach(input =>{
    input.addEventListener("input", e =>{
        let minPrice = parseInt(priceInput[0].value),
        maxPrice = parseInt(priceInput[1].value);
        
        if((maxPrice - minPrice >= priceGap) && maxPrice <= rangeInput[1].max){
            if(e.target.className === "input-min"){
                rangeInput[0].value = minPrice;
                range.style.left = ((minPrice / rangeInput[0].max) * 100) + "%";
            }else{
                rangeInput[1].value = maxPrice;
                range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
            }
        }
    });
});

rangeInput.forEach(input =>{
    input.addEventListener("input", e =>{
        let minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value);

        if((maxVal - minVal) < priceGap){
            if(e.target.className === "range-min"){
                rangeInput[0].value = maxVal - priceGap
            }else{
                rangeInput[1].value = minVal + priceGap;
            }
        }else{
            priceInput[0].value = minVal;
            priceInput[1].value = maxVal;
            range.style.left = ((minVal / rangeInput[0].max) * 100) + "%";
            range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
        }
    });
});

// Radio-Filter
document.addEventListener("DOMContentLoaded", function () {
  const filterCheckbox = document.getElementById("filterCheckbox");
  const filterOptions = document.getElementById("filterOptions");

  document.addEventListener("click", function (event) {
      const isClickInsideFilter = filterOptions.contains(event.target) || filterCheckbox.contains(event.target);

      if (!isClickInsideFilter) {
          filterCheckbox.checked = false;
      }
  });

  filterCheckbox.addEventListener("click", function () {
      if (filterCheckbox.checked && filterOptions.style.display === "block") {
          filterCheckbox.checked = false;
      }
  });

  const filterOptionsInputs = document.querySelectorAll(".filter-option input");
  filterOptionsInputs.forEach((option) => {
      option.addEventListener("change", function () {
          const filterType = this.value;
          filterItems(filterType);
          filterCheckbox.checked = false;
      });
  });

  function filterItems(filterType) {
      const items = Array.from(document.querySelectorAll(".item"));

      items.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute("data-price"));
          const priceB = parseFloat(b.getAttribute("data-price"));
          const dateA = new Date(a.getAttribute("data-date"));
          const dateB = new Date(b.getAttribute("data-date"));
          const popularityA = parseFloat(a.getAttribute("data-popularity"));
          const popularityB = parseFloat(b.getAttribute("data-popularity"));
          const reviewsA = parseFloat(a.getAttribute("data-reviews"));
          const reviewsB = parseFloat(b.getAttribute("data-reviews"));

          switch (filterType) {
              case "price-asc":
                  return priceA - priceB;
              case "price-desc":
                  return priceB - priceA;
              case "date-desc":
                  return dateB - dateA;
              case "date-asc":
                  return dateA - dateB;
              case "popular":
                  return popularityB - popularityA;
              case "reviews":
                  return reviewsB - reviewsA;
              default:
                  return 0;
          }
      });

      const container = document.querySelector(".items-container");
      container.innerHTML = "";
      items.forEach((item) => container.appendChild(item));
  }
});

// AI CHATBOT
document.addEventListener('DOMContentLoaded', function () {
  const chatIcon = document.getElementById('chatIcon');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const closeChat = document.getElementById('closeChat');
  const sendMessage = document.getElementById('sendMessage');
  const chatInput = document.getElementById('chatInput');
  const chatbotBody = document.getElementById('chatbotBody');

  chatIcon.addEventListener('click', function () {
    chatbotContainer.style.display = 'flex';
    chatbotContainer.classList.remove('closing');
    chatbotContainer.classList.add('opening');
  });

  closeChat.addEventListener('click', function () {
    chatbotContainer.classList.remove('opening');
    chatbotContainer.classList.add('closing');
    setTimeout(() => {
      chatbotContainer.style.display = 'none';
    }, 300);
  });

  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage.click();
    }
  });

  sendMessage.addEventListener('click', async function () {
    const message = chatInput.value.trim();
    if (message !== '') {
      addMessage('user', message);
      chatInput.value = '';
      setTimeout(() => {
        addMessage('bot', 'Welkom bij Icons, waar dat de beste gamers samen komen! Ik ben de enige echte Icon bot, mijn doel is om al jou vragen te beantwoorden.');
      }, 500);
    }
  });

  document.addEventListener('click', function (event) {
    if (
      !chatbotContainer.contains(event.target) &&
      !chatIcon.contains(event.target) &&
      chatbotContainer.style.display === 'flex'
    ) {
      chatbotContainer.classList.remove('opening');
      chatbotContainer.classList.add('closing');
      setTimeout(() => {
        chatbotContainer.style.display = 'none';
      }, 300);
    }
  });
  
  function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatbotBody.appendChild(messageElement);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }
});

// API Functionaliteit
async function fetchCharacter(characterId) {
  try {
      const response = await fetch('skins.json');
      if (!response.ok) throw new Error('Fout bij ophalen van gegevens');
      
      const data = await response.json();
      const characters = data.data.items.br;
      const character = characters.find(char => char.id === characterId);
      if (!character) throw new Error(`Character met ID ${characterId} niet gevonden`);
      
      const characterContainer = document.getElementById(`char-${characterId}`);
      if (characterContainer) {
          characterContainer.innerHTML = `
              <div class="icons-shop">
              <h2>${character.name}</h2> 
              <img class="icons-shop" src="${character.images.icon}" alt="${character.name}">
              </div>
          `;
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-character-id]").forEach(element => {
      fetchCharacter(element.dataset.characterId);
  });
});

// Countdown Timer
let tijd = 323102; 
const timerElement = document.getElementById("timer");

function updateTimerDisplay() {
    let dagen = Math.floor(tijd / (60 * 60 * 24));
    let uren = Math.floor((tijd % (60 * 60 * 24)) / (60 * 60));
    let minuten = Math.floor((tijd % (60 * 60)) / 60);
    let seconden = tijd % 60;
    
    timerElement.textContent = `${dagen.toString().padStart(2, '0')}:${uren.toString().padStart(2, '0')}:${minuten.toString().padStart(2, '0')}:${seconden.toString().padStart(2, '0')}`;
}

const countdown = setInterval(() => {
    if (tijd > 0) {
        tijd--;
        updateTimerDisplay();
    } else {
        clearInterval(countdown);
        timerElement.textContent = "Tijd voorbij!";
    }
}, 1000);

updateTimerDisplay();
////
const initSlider = () => {
  const slider = document.querySelector('.container-populaire');
  const prevBtn = document.querySelector('.arrow.prev');
  const nextBtn = document.querySelector('.arrow.next');
  let currentIndex = 0;
  const totalSlides = 3;

  const updateButtons = () => {
    prevBtn.style.display = currentIndex <= 0 ? 'none' : 'block';
    nextBtn.style.display = currentIndex >= totalSlides - 1 ? 'none' : 'block';
  };

  const slideTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    slider.scrollTo({
      left: slider.offsetWidth * currentIndex,
      behavior: 'smooth'
    });
    updateButtons();
  };

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    slideTo(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    slideTo(currentIndex + 1);
  });

  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? slideTo(currentIndex + 1) : slideTo(currentIndex - 1);
    }
  });

  updateButtons();
};

let currentFlippedCard = null;
function flipCard(card) {
  if (currentFlippedCard && currentFlippedCard !== card) {
    currentFlippedCard.classList.remove("flipped");
  }
  card.classList.toggle("flipped");
  currentFlippedCard = card.classList.contains("flipped") ? card : null;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".flip-container") && currentFlippedCard) {
    currentFlippedCard.classList.remove("flipped");
    currentFlippedCard = null;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  document.querySelector('.ri-menu-line').addEventListener('click', () => {
    console.log('Menu geopend');
  });

  document.querySelector('.ri-account-circle-fill').addEventListener('click', () => {
    console.log('Account menu geopend');
  });
});