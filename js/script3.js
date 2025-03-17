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

class Carousel {
  constructor() {
    this.cards = Array.from(document.querySelectorAll(".card"));
    this.prevBtn = document.querySelector(".prev-btn");
    this.nextBtn = document.querySelector(".next-btn");
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
    this.prevBtn.addEventListener("click", () => this.navigate(-1));
    this.nextBtn.addEventListener("click", () => this.navigate(1));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.navigate(-1);
      if (e.key === "ArrowRight") this.navigate(1);
    });

    let touchStartX = 0;
    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });

    document.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.navigate(1) : this.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    requestAnimationFrame(() => {
      this.activeIndex =
        (this.activeIndex + direction + this.totalCards) % this.totalCards;
      this.updatePositions();
    });

    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  updatePositions() {
    requestAnimationFrame(() => {
      this.cards.forEach((card, index) => {
        const position =
          (index - this.activeIndex + this.totalCards) % this.totalCards;
        this.applyStyles(card, position);
      });
    });
  }

  applyStyles(card, position) {
    card.classList.remove("active", "prev", "next", "far-left", "far-right");

    if (position === 0) {
      card.classList.add("active");
    } else if (position === 1) {
      card.classList.add("next");
    } else if (position === this.totalCards - 1) {
      card.classList.add("prev");
    } else if (position === 2) {
      card.classList.add("far-right");
    } else if (position === this.totalCards - 2) {
      card.classList.add("far-left");
    }
  }
}

const carousel = new Carousel();

const cookieCard = document.querySelector(".cookies-card");
const exitButton = document.querySelector(".exit-button");
const acceptButton = document.querySelector(".accept");
const rejectButton = document.querySelector(".reject");

function closePopup() {
  cookieCard.classList.add("hide");
  setTimeout(() => {
    cookieCard.style.display = "none";
  }, 300);
}

exitButton.addEventListener("click", closePopup);

acceptButton.addEventListener("click", function () {
  this.innerHTML = '<i class="ri-check-line"></i>';
  closePopup();
});

rejectButton.addEventListener("click", function () {
  this.innerHTML = '<i class="ri-emotion-sad-fill"></i>';
  closePopup();
});

document.querySelectorAll(".card-button").forEach((button) => {
  button.addEventListener("click", function (event) {
    if (!this.classList.contains("available")) {
      this.classList.add("shake");
      setTimeout(() => this.classList.remove("shake"), 300);
    }

    if (this.classList.contains("available")) {
      event.preventDefault();

      const link = this.closest("a").href;
      setTimeout(() => {
        window.location.href = link;
      }, 500);
    }
  });
});
