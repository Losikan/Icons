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



//Prijs filter//
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

// Radio-Filter//
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

/////AI CHATBOT////
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

const container = document.querySelector('.container-populaire');
const articles = document.querySelectorAll('.article');

container.addEventListener('scroll', () => {
  articles.forEach(article => {
    const rect = article.getBoundingClientRect();
    article.classList.toggle('active', rect.left >= 0 && rect.right <= window.innerWidth);
  });
});

// Overige functionaliteit
document.querySelector('.ri-menu-line').addEventListener('click', () => {
  console.log('Menu geopend');
});

document.querySelector('.ri-account-circle-fill').addEventListener('click', () => {
  console.log('Account menu geopend');
});

// API //

