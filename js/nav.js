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