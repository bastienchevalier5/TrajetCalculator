
// Variables globales
var map;
var completePathLayer = null;
var completeGlowLayer = null;
var locations = []; // Déplacé en variable globale pour être accessible par addPins
var markers = []; // Pour stocker les marqueurs actifs
var customSound; // Pour l'effet sonore

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

    // Créer les sons de sabre laser
    customSound = createCustomSound('./assets/sounds/lightSaber.mp4');

    // Créer les marqueurs et dessiner l'itinéraire initial
    drawRoute(locations);

    // Ajouter le sélecteur de thème
    if (typeof addCartoDBThemeSelector === 'function') {
        addCartoDBThemeSelector();
    }

    // Gérer les événements de zoom
    map.on('zoomend moveend', function () {
        // S'assurer que le chemin complet est visible
        if (completePathLayer && completeGlowLayer) {
            completePathLayer.redraw();
            completeGlowLayer.redraw();
        }
    });
}

// Fonction pour créer une icône de départ
function createStartPin() {
    return L.divIcon({
        className: 'start-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -35]
    });
}

// Fonction pour créer une icône d'arrivée
function createEndPin() {
    return L.divIcon({
        className: 'end-pin',
        html: '<div class="pin-content"><i class="bi bi-flag-fill text-white m-0"></i></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -35]
    });
}

// Fonction pour créer une icône d'étape intermédiaire
function createMiddlePin() {
    return L.divIcon({
        className: 'middle-pin',
        html: '<div class="pin-content"></div>',
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
        popupAnchor: [0, -35]
    });
}

// Fonction pour créer le contenu personnalisé du popup
function createCustomPopupContent(location, index) {
    // Créer un contenu plus riche avec des informations supplémentaires
    var content = `
        <div class="popup-container">
            <div class="popup-header">
                <h3>${location.name}</h3>
                <span class="popup-info">${location.info}</span>
            </div>
            <div class="popup-footer">
                <span class="popup-position">Position: ${index + 1}/${locations.length}</span>
            </div>
        </div>
    `;

    return content;
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

// Fonction pour dessiner l'itinéraire complet et ses marqueurs
function drawRoute(routeLocations) {
    // Nettoyer la carte des marqueurs et chemins existants
    clearMapLayers();

    // Créer les nouveaux marqueurs
    markers = routeLocations.map(function (loc, index) {
        // Créer le contenu du popup avec HTML personnalisé
        var popupContent = createCustomPopupContent(loc, index);

        // Créer le marqueur avec le popup personnalisé
        return L.marker(loc.latLng, { icon: loc.icon })
            .bindPopup(popupContent, {
                className: 'custom-popup',
                maxWidth: 300,
                closeButton: false
            });
    });

    // Ajouter tous les marqueurs à la carte
    markers.forEach(marker => marker.addTo(map));

    // Ouvrir le popup du premier marqueur
    if (markers.length > 0) {
        markers[0].openPopup();
    }

    // Extraire les points pour le chemin
    var pathPoints = routeLocations.map(loc => loc.latLng);

    // Adapter la vue pour voir tout l'itinéraire
    if (pathPoints.length > 1) {
        map.fitBounds(L.latLngBounds(pathPoints));
    }

    // Animer le chemin
    animatePathSegmentBySegment(routeLocations, markers, customSound, pathPoints);
}

// Fonction pour nettoyer la carte des marqueurs et chemins existants
function clearMapLayers() {
    // Supprimer les marqueurs existants
    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];

    // Supprimer les chemins existants
    if (completePathLayer && map.hasLayer(completePathLayer)) {
        map.removeLayer(completePathLayer);
    }
    if (completeGlowLayer && map.hasLayer(completeGlowLayer)) {
        map.removeLayer(completeGlowLayer);
    }

    // Supprimer toutes les animations de segment en cours
    map.eachLayer(function (layer) {
        if (layer._path && layer._path.classList.contains('segment-animation')) {
            map.removeLayer(layer);
        }
    });
}

// Fonction pour animer le chemin segment par segment
function animatePathSegmentBySegment(routeLocations, routeMarkers, sound, pathPoints) {
    var currentSegment = 0;
    var totalSegments = routeLocations.length - 1;
    var animationDuration = 1.73; // Durée en secondes

    // Ne rien faire s'il n'y a pas assez de points
    if (totalSegments <= 0) return;

    // Créer une fonction pour révéler progressivement le chemin complet
    function revealNextSegment() {
        if (currentSegment >= totalSegments) return;

        // Créer un sous-chemin temporaire pour l'animation
        var segmentPoints = [
            routeLocations[currentSegment].latLng,
            routeLocations[currentSegment + 1].latLng
        ];

        // Animation temporaire du segment
        var tempPath = L.polyline(segmentPoints, {
            color: '#0d6efd',
            weight: 3,
            opacity: 1,
            className: 'segment-animation'
        }).addTo(map);

        // Jouer le son
        sound.play();

        // Après l'animation, supprimer le chemin temporaire et révéler la partie correspondante du chemin complet
        setTimeout(function () {
            // Supprimer le chemin temporaire d'animation
            map.removeLayer(tempPath);

            // Révéler progressivement le chemin complet
            var visiblePath = [];
            for (var i = 0; i <= currentSegment + 1; i++) {
                visiblePath.push(routeLocations[i].latLng);
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
    var borderColor = isDarkTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    var containerBg = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

    // Mettre à jour tous les inputs
    inputs.forEach(function (input) {
        input.style.color = textColor;
        input.style.borderColor = borderColor;
    });

    // Mettre à jour le conteneur principal
    var routeContainer = document.querySelector('.route-container');
    if (routeContainer && routeContainer.parentElement) {
        routeContainer.parentElement.style.background = containerBg;
        routeContainer.parentElement.style.borderColor = borderColor;
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

// Fonction appelée depuis C# pour mettre à jour les points et recalculer l'itinéraire
function addPins(villes) {
    if (!map) {
        console.error("La carte n'est pas encore initialisée !");
        return;
    }

    // Convertir les villes C# en format pour notre carte
    var newLocations = [];

    villes.forEach((ville, index) => {
        let iconType;
        let infoType;

        if (index === 0) {
            iconType = createStartPin();
            infoType = "Départ de l'itinéraire";
        } else if (index === villes.length - 1) {
            iconType = createEndPin();
            infoType = "Arrivée";
        } else {
            iconType = createMiddlePin();
            infoType = `Étape ${index}`;
        }

        newLocations.push({
            latLng: [ville.latitude, ville.longitude],
            name: ville.label,
            icon: iconType,
            info: infoType
        });
    });

    // Mettre à jour la variable globale locations
    locations = newLocations;

    // Dessiner le nouvel itinéraire
    drawRoute(locations);
}

