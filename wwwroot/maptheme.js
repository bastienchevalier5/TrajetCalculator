
// Variables globales
var map;

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
    // Créer la carte centrée sur Paris
    map = L.map('map', {
        center: [48.8566, 2.3522],
        zoom: 5,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 3,
        bounceAtZoomLimits: false
    });
    // Ajouter la couche de tuiles (thème sombre CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB & OpenStreetMap',
        maxZoom: 19
    }).addTo(map);
    // Définir les icônes personnalisées
    var startPin = L.divIcon({
        className: 'start-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -35]
    });
    var endPin = L.divIcon({
        className: 'end-pin',
        html: '<div class="pin-content"><i class="bi bi-flag-fill text-white m-0"></i></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -35]
    });
    var middlePin = L.divIcon({
        className: 'middle-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [15, 15], // Taille de l'icône
        iconAnchor: [7.5, 7.5], // Point d'ancrage
        popupAnchor: [0, -35] // Position du popup
    });

    // Points de l'itinéraire
    var locations = [
        { latLng: [48.8566, 2.3522], name: "Paris", icon: startPin },
        { latLng: [45.7640, 4.8357], name: "Lyon", icon: middlePin },
        { latLng: [43.2965, 5.3698], name: "Marseille", icon: middlePin },
        { latLng: [44.8378, -0.5792], name: "Bordeaux", icon: endPin }
    ];

    // Ajouter les marqueurs à la carte
    var markers = locations.map(function (loc) {
        return L.marker(loc.latLng, { icon: loc.icon })
            .bindPopup(loc.name);
    });

    // Ajouter seulement le premier marqueur au début
    markers[0].addTo(map).openPopup();

    // Créer le style pour les effets néon
    addNeonStyles();

    // Ajouter le sélecteur de thème
    if (typeof addCartoDBThemeSelector === 'function') {
        addCartoDBThemeSelector();
    }

    // Créer les sons de sabre laser
    var customSound = createCustomSound('./assets/sounds/lightSaber.mp4');

    // Stocker les chemins complets avant l'animation
    var completePath = [];
    var completePathLayer = null;
    var completeGlowLayer = null;

    // Créer le chemin complet (invisible au début)
    function createCompletePath() {
        // Extraire tous les points de l'itinéraire
        var allPoints = locations.map(loc => loc.latLng);

        // Créer le chemin principal (invisible initialement)
        completePathLayer = L.polyline(allPoints, {
            color: '#0d6efd',
            weight: 3,
            opacity: 0,
            className: 'neon-path complete-path'
        }).addTo(map);

        // Créer l'effet de lueur (invisible initialement)
        completeGlowLayer = L.polyline(allPoints, {
            color: '#0d6efd',
            weight: 6,
            opacity: 0,
            className: 'neon-glow complete-glow'
        }).addTo(map);

        // S'assurer que la lueur est en arrière-plan
        completeGlowLayer.bringToBack();

        // Adapter la vue pour voir tout l'itinéraire
        map.fitBounds(L.latLngBounds(allPoints));

        return allPoints;
    }

    // Créer le chemin complet
    completePath = createCompletePath();

    // Animation du chemin segment par segment
    animatePathSegmentBySegment(locations, markers, customSound, completePath, completePathLayer, completeGlowLayer);

    // Gérer les événements de zoom
    map.on('zoomend moveend', function () {
        // S'assurer que le chemin complet est visible
        if (completePathLayer && completeGlowLayer) {
            completePathLayer.redraw();
            completeGlowLayer.redraw();
        }
    });
}

// Fonction pour ajouter les styles néon
function addNeonStyles() {
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

        .start-pin, .end-pin, .middle-pin{
            border-radius: 50%;
            animation: markerPulse 1.5s infinite alternate;
        }

        @keyframes markerPulse {
            from { box-shadow: 0 0 5px #00ffff, 0 0 8px #00ffff; }
            to { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff; }
        }
        
        .segment-animation {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawPath 1.73s forwards linear;
        }
        
        @keyframes drawPath {
            to { stroke-dashoffset: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Fonction pour créer un objet audio avec un fichier personnalisé
function createCustomSound(audioFilePath) {
    // Créer l'élément audio une seule fois et le réutiliser
    var audioElement = document.createElement('audio');
    audioElement.src = audioFilePath;  // Chemin vers votre fichier audio
    audioElement.preload = 'auto';     // Précharger le son

    // Ajouter l'élément audio à la page mais caché
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);

    // Retourner un objet avec une méthode play()
    return {
        play: function () {
            // Réinitialiser la lecture à chaque appel
            audioElement.currentTime = 0;

            // Lire le son
            var playPromise = audioElement.play();

            // Gérer les erreurs de lecture (important pour la compatibilité navigateur)
            if (playPromise !== undefined) {
                playPromise.catch(function (error) {
                    console.warn("Lecture audio impossible. Interaction utilisateur requise.", error);
                });
            }
        }
    };
}

// Fonction pour animer le chemin segment par segment
function animatePathSegmentBySegment(locations, markers, customSound, completePath, completePathLayer, completeGlowLayer) {
    var currentSegment = 0;
    var totalSegments = locations.length - 1;
    var animationDuration = 1.73; // Durée en secondes

    // Créer une fonction pour révéler progressivement le chemin complet
    function revealNextSegment() {
        if (currentSegment >= totalSegments) return;

        // Ajouter le marqueur suivant
        markers[currentSegment + 1].addTo(map).openPopup();

        // Créer un sous-chemin temporaire pour l'animation
        var segmentPoints = [
            locations[currentSegment].latLng,
            locations[currentSegment + 1].latLng
        ];

        // Animation temporaire du segment
        var tempPath = L.polyline(segmentPoints, {
            color: '#0d6efd',
            weight: 3,
            opacity: 1,
            className: 'segment-animation'
        }).addTo(map);

        // Jouer le son
        customSound.play();

        // Après l'animation, supprimer le chemin temporaire et révéler la partie correspondante du chemin complet
        setTimeout(function () {
            // Supprimer le chemin temporaire d'animation
            map.removeLayer(tempPath);

            // Révéler progressivement le chemin complet
            var visiblePath = [];
            for (var i = 0; i <= currentSegment + 1; i++) {
                visiblePath.push(locations[i].latLng);
            }

            // Remplacer le chemin complet par la partie visible
            if (completePathLayer) {
                map.removeLayer(completePathLayer);
            }
            if (completeGlowLayer) {
                map.removeLayer(completeGlowLayer);
            }

            // Créer le nouveau chemin visible
            completePathLayer = L.polyline(visiblePath, {
                color: '#0d6efd',
                weight: 3,
                opacity: 1,
                className: 'neon-path'
            }).addTo(map);

            // Créer la nouvelle lueur visible
            completeGlowLayer = L.polyline(visiblePath, {
                color: '#0d6efd',
                weight: 6,
                opacity: 0.3,
                className: 'neon-glow'
            }).addTo(map);

            // S'assurer que la lueur est en arrière-plan
            completeGlowLayer.bringToBack();

            // Passer au segment suivant
            currentSegment++;
            if (currentSegment < totalSegments) {
                setTimeout(revealNextSegment, 500); // Délai entre les segments
            }
        }, animationDuration * 1000);
    }

    // Commencer l'animation après un court délai
    setTimeout(revealNextSegment, 1000);
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
