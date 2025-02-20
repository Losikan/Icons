document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card-img").forEach((card) => {
    const images = card.querySelectorAll("img");
    let currentImageIndex = 0;

    if (images.length <= 1) return;

    let interval;

    const startSlideshow = () => {
      images[currentImageIndex].classList.remove("visible");
      currentImageIndex = (currentImageIndex + 1) % images.length;
      images[currentImageIndex].classList.add("visible");

      interval = setInterval(() => {
        images[currentImageIndex].classList.remove("visible");
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].classList.add("visible");
      }, 1500);
    };

    const stopSlideshow = () => {
      clearInterval(interval);
    };

    card.addEventListener("mouseenter", startSlideshow);
    card.addEventListener("mouseleave", stopSlideshow);
  });
});
