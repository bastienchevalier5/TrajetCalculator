window.makeDraggable = (elementId) => {
    const el = document.getElementById(elementId);
    let offsetX = 0, offsetY = 0, isDragging = false;
    const margin = 20; // Marge autour de l'écran

    el.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
        el.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // Obtenir les dimensions de la fenêtre
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Obtenir les dimensions de l'élément
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        // Calculer les nouvelles positions avec les marges
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Empêcher de sortir à gauche et appliquer la marge
        if (newX < margin) newX = margin;
        if (newX + elWidth > windowWidth - margin) newX = windowWidth - elWidth - margin;

        // Empêcher de sortir en haut et appliquer la marge
        if (newY < margin) newY = margin;
        if (newY + elHeight > windowHeight - margin) newY = windowHeight - elHeight - margin;

        // Appliquer les nouvelles positions
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        el.style.cursor = "grab";
    });
};
