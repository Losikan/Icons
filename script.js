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
