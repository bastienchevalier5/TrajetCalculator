
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

    var customPin = L.divIcon({
        className: 'custom-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [20, 20], // Taille de l'icône
        iconAnchor: [10, 10], // Point d'ancrage
        popupAnchor: [0, -35] // Position du popup
    });

    L.marker([48.8566, 2.3522], { icon: customPin }).addTo(map)
        .bindPopup("Paris")
        .openPopup();

  // Ajouter un sélecteur de thème CartoDB simple
  addCartoDBThemeSelector();
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
      }
