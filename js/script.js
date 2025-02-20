// Dark Mode Toggle
const modeSwitch = document.getElementById('modeSwitch');
const backgroundImage = document.getElementById('backgroundImage');

modeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Als dark mode aan staat, wijzig dan de afbeelding naar de donkere versie
    if (document.body.classList.contains('dark-mode')) {
        backgroundImage.setAttribute('href', 'Assets/img/dark.jpg'); // Dark mode afbeelding
    } else {
        backgroundImage.setAttribute('href', "Assets/img/fortnite-battle-royale-uhd-4k-wallpaper.jpg"); // Light mode afbeelding
    }
});
