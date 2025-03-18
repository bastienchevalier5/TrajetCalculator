
// Variables globales
var map;

// Fonction pour initialiser la carte
// Fonction pour initialiser la carte
function initMap() {
  // Vérifier si l'élément map existe
  if (!document.getElementById('map')) {
    console.error("Element with id 'map' not found");
    return;
  }

  // Définir les limites maximales de la carte (monde entier)
  var southWest = L.latLng(-85, -180);
  var northEast = L.latLng(85, 180);
  var bounds = L.latLngBounds(southWest, northEast);

  // Créer la carte centrée sur Seattle avec les options de limites
  map = L.map('map', {
    center: [48.8566, 2.3522],
    zoom: 5,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,  // Rend les limites "collantes" (0-1)
    minZoom: 3,  // Empêche un dézoom trop important
    bounceAtZoomLimits: false  // Empêche le rebond quand on atteint les limites de zoom
  });

  // Ajouter la couche de tuiles (thème sombre CartoDB)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CartoDB & OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

    var startPin = L.divIcon({
        className: 'start-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [20, 20], // Taille de l'icône
        iconAnchor: [10, 10], // Point d'ancrage
        popupAnchor: [0, -35] // Position du popup
    });

    var endPin = L.divIcon({
        className: 'end-pin',
        html: '<div class="pin-content"><i class="bi bi-flag-fill text-white m-0"></i></div>',
        iconSize: [20, 20], // Taille de l'icône
        iconAnchor: [10, 10], // Point d'ancrage
        popupAnchor: [0, -35] // Position du popup
    });

    var middlePin = L.divIcon({
        className: 'middle-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [15, 15], // Taille de l'icône
        iconAnchor: [7.5, 7.5], // Point d'ancrage
        popupAnchor: [0, -35] // Position du popup
    });

    L.marker([48.8566, 2.3522], { icon: startPin }).addTo(map)
        .bindPopup("Paris")
        .openPopup();

    L.marker([45.7640, 4.8357], { icon: middlePin }).addTo(map)
        .bindPopup("Lyon")
        .openPopup();

    L.marker([43.2965, 5.3698], { icon: middlePin }).addTo(map)
        .bindPopup("Marseille")
        .openPopup();

    L.marker([44.8378, -0.5792], { icon: endPin }).addTo(map)
        .bindPopup("Bordeaux")
        .openPopup();


    // Ajouter un polyline (chemin) reliant les 4 points
    var latlngs = [
        [48.8566, 2.3522], // Paris
        [45.7640, 4.8357], // Lyon
        [43.2965, 5.3698], // Marseille
        [44.8378, -0.5792] // Bordeaux
    ];

    // Pour le path existant, modifiez-le pour ajouter l'effet néon
    var path = L.polyline(latlngs, {
        color: '#0d6efd', // Couleur cyan néon
        weight: 3,        // Augmenter l'épaisseur
        opacity: 1,
        className: 'neon-path' // Ajouter une classe pour pouvoir appliquer des styles CSS
    }).addTo(map);

    // Ajouter un second polyline légèrement plus large pour l'effet de lueur
    var glowPath = L.polyline(latlngs, {
        color: '#0d6efd',
        weight: 6,       // Plus large pour créer l'effet de lueur
        opacity: 0.3,     // Semi-transparent
        className: 'neon-glow'
    }).addTo(map);

    // Placer ce glowPath en dessous du path principal
    glowPath.bringToBack();

    // Ajouter du CSS pour l'animation et le style néon (à ajouter dans votre fichier CSS ou dans une balise style)
    var style = document.createElement('style');
    style.innerHTML = `
.neon-path {
    filter: drop-shadow(0 0 5px #00ffff) drop-shadow(0 0 8px #00ffff);
    animation: neonPulse 1.5s infinite alternate;
}

.neon-glow {
    filter: blur(4px);
    animation: neonGlowPulse 1.5s infinite alternate;
}

@keyframes neonPulse {
    from { filter: drop-shadow(0 0 5px #00ffff) drop-shadow(0 0 8px #00ffff); }
    to { filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 15px #00ffff); }
}

@keyframes neonGlowPulse {
    from { opacity: 0.2; }
    to { opacity: 0.4; }
}

/* Style pour les marqueurs également */
.start-pin .pin-content, .end-pin .pin-content, .middle-pin .pin-content {
    box-shadow: 0 0 10px #00ffff, 0 0 15px #00ffff;
    border-radius: 50%;
    background-color: #00ffff;
}
`;
    document.head.appendChild(style);

    // Centrer la carte sur le chemin
    map.fitBounds(path.getBounds());

  // Ajouter un sélecteur de thème CartoDB simple
    addCartoDBThemeSelector();

    adjustTextColors('dark_all');
}

// Fonction pour ajouter un sélecteur de thème CartoDB
function addCartoDBThemeSelector() {
          // Créer un div pour le sélecteur
          var selectorDiv = document.createElement('div');
selectorDiv.style.position = 'absolute';
selectorDiv.style.bottom = '10px';
selectorDiv.style.left = '10px';
selectorDiv.style.zIndex = '1000';
selectorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
selectorDiv.style.padding = '5px';
selectorDiv.style.borderRadius = '4px';

// Créer le sélecteur
var select = document.createElement('select');
select.style.backgroundColor = '#333';
select.style.color = 'white';
select.style.border = '1px solid #555';
select.style.padding = '2px';
select.style.fontSize = '12px';

// Ajouter les options de thème CartoDB uniquement
var themes = {
  'dark_all': 'CartoDB Dark',
'dark_nolabels': 'CartoDB Dark No Labels',
'light_all': 'CartoDB Light',
'light_nolabels': 'CartoDB Light No Labels',
'rastertiles/voyager_nolabels': 'CartoDB Voyager No Labels',
'rastertiles/voyager': 'CartoDB Voyager',
'rastertiles/voyager_labels_under': 'CartoDB Voyager Labels Under'
          };

for (var value in themes) {
              var option = document.createElement('option');
option.value = value;
option.text = themes[value];
select.appendChild(option);
          }

// Définir l'option par défaut sur "dark_all"
select.value = 'dark_all';

// Ajouter l'événement de changement
select.addEventListener('change', function () {
  changeCartoDBTheme(this.value);
          });

// Ajouter le sélecteur au div
selectorDiv.appendChild(select);

// Ajouter le div à la page
document.body.appendChild(selectorDiv);
      }

// Fonction pour ajuster les couleurs du texte en fonction du thème
function adjustTextColors(theme) {
    // Récupérer tous les éléments input avec la classe input-route
    var inputs = document.querySelectorAll('.input-route');

    // Définir les couleurs en fonction du thème
    var isDarkTheme = theme.includes('Dark');
    var textColor = isDarkTheme ? '#ffffff' : '#333333';
    var borderColor = isDarkTheme ? 'rgba(0, 0, 0, 0.3)':'rgba(255, 255, 255, 0.3)' ;
    var containerBg = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' ;

    // Mettre à jour tous les inputs
    inputs.forEach(function (input) {
        input.style.color = textColor;
        input.style.borderColor = borderColor;
    });

    // Mettre à jour le conteneur principal
    var routeContainer = document.querySelector('.route-container').parentElement;
    if (routeContainer) {
        routeContainer.style.background = containerBg;
        routeContainer.style.borderColor = borderColor;
    }
}
// Fonction pour changer le thème CartoDB
function changeCartoDBTheme(theme) {
  // Supprimer les couches existantes
  map.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });

// Construire l'URL pour CartoDB
var tileUrl = `https://{s}.basemaps.cartocdn.com/${theme}/{z}/{x}/{y}{r}.png`;

// Ajouter la nouvelle couche
L.tileLayer(tileUrl, {
  attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
maxZoom: 19
}).addTo(map);
    adjustTextColors(theme);
      }
