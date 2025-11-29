import '@material/web/all.js';
import { setupNavbar } from './navigation.js';

//COMPONENTS
function includeComponent(id, file, callback) {
  fetch(file)
    .then(response => {
      if (!response.ok)
        throw new Error(`Errore nel caricamento di ${file}`);

      return response.text();
    })
    .then(content => {
      document.getElementById(id).innerHTML = content;
      
      if (callback)
        callback();
    })
    .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
  //GRAIN EFFECT
  grained('#page', {
    animate: false,
    patternWidth: 100,
    patternHeight: 100,
    grainOpacity: 0.05,
    grainDensity: 1,
    grainWidth: 1,
    grainHeight: 1
  });

  includeComponent("navbar", "./components/navigation.html", () => {
    setupNavbar();;
  });
});