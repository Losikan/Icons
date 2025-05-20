// Dark mode toggle
const modeToggle = document.getElementById('modeSwitch');
const body = document.body;

// Laad opgeslagen voorkeur
if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark-mode');
  modeToggle.checked = true;
}

modeToggle.addEventListener('change', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

// Wachtwoord zichtbaarheid
document.querySelectorAll('.login_password').forEach(icon => {
  icon.addEventListener('click', (e) => {
    const input = e.target.closest('.login_box').querySelector('input');
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    e.target.classList.toggle('ri-eye-off-fill');
    e.target.classList.toggle('ri-eye-fill');
  });
});

// Form validatie
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    let valid = true;
    
    // Controleer verplichte velden
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.closest('.login_box').classList.add('error');
      } else {
        input.closest('.login_box').classList.remove('error');
      }
    });

    // Wachtwoord match bij registratie
    if (form.id === 'registerForm') {
      const password = form.querySelector('#password');
      const confirmPassword = form.querySelector('#confirmPassword');
      
      if (password.value !== confirmPassword.value) {
        valid = false;
        confirmPassword.closest('.login_box').classList.add('error');
      }
    }

    if (!valid) e.preventDefault();
  });
});