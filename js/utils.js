// utils.js – gemeinsam genutzte Hilfsfunktionen

const ICON_MAP = {
  dog:       'assets/dogicon_v2.png',
  cat:       'assets/caticon_v2.png',
  bunny:     'assets/bunnyicon_v2.png',
  gunneapig: 'assets/gunneapig_v2.png',
  bird:      'assets/birdicon_v2.png',
};

function getAnimalIcon(icon) {
  return ICON_MAP[icon] || 'assets/dogicon_v2.png';
}