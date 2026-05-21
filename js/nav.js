// Aktuell aktive Seite im Footer markieren
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-item').forEach(item => {
  item.classList.remove('active');
  if (item.getAttribute('href') === currentPage) {
    item.classList.add('active');
  }
});