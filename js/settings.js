document.querySelectorAll(".selector-container").forEach((container) => {
  const options = container.dataset.options.split(",");
  const display = container.querySelector(".option-display");
  let currentIndex = 0;

  function updateDisplay() {
    display.textContent = options[currentIndex];
    display.classList.add("option-change");
    setTimeout(() => display.classList.remove("option-change"), 300);
  }

  container.setIndex = function (index) {
    currentIndex = index;
    updateDisplay();
  };

  display.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % options.length;
    updateDisplay();
  });

  updateDisplay();
});

document.querySelectorAll('.tab-container input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll('.tab-container input[type="radio"]').forEach((r) => r.removeAttribute("checked"));
    radio.setAttribute("checked", "");
  });
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("change", () => {
    document.querySelectorAll(".settings-section").forEach((section) => {
      section.style.display = "none";
    });
    const targetId = tab.id.replace("tab", "");
    const targetSection = document.querySelector(
      `.settings__${targetId === "1" ? "general" : targetId === "2" ? "audio" : "account"}`
    );
    if (targetSection) {
      targetSection.style.display = "flex";
      targetSection.style.animation = "fadeIn 0.5s ease";
    }
  });
});

document.querySelector(".tab--1").checked = true;
document.querySelector(".settings__general").style.display = "flex";

document.querySelectorAll(".setting").forEach(setting => {
  setting.addEventListener("click", function () {
      const targetId = this.getAttribute("data-content");
      const targetContent = document.getElementById(targetId);

      document.querySelectorAll(".content").forEach(content => {
          if (content !== targetContent) {
              content.classList.remove("open");
          }
      });

      targetContent.classList.toggle("open");
  });
});

document.querySelectorAll(".content button").forEach(button => {
  button.addEventListener("click", function () {
      const notification = document.getElementById("notification");

      notification.classList.add("show");

      setTimeout(() => {
          notification.classList.remove("show");
      }, 3000);
  });
});