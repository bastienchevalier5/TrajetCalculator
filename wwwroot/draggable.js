window.makeDraggable = (elementId) => {
    const el = document.getElementById(elementId);
    const handle = el.querySelector(".drag-handle"); // Sélectionne la barre de drag
    let offsetX = 0, offsetY = 0, isDragging = false;
    const margin = 20; // Marge autour de la fenêtre

    handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
        el.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Appliquer les limites avec marge
        if (newX < margin) newX = margin;
        if (newX + elWidth > windowWidth - margin) newX = windowWidth - elWidth - margin;
        if (newY < margin) newY = margin;
        if (newY + elHeight > windowHeight - margin) newY = windowHeight - elHeight - margin;

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        el.style.cursor = "grab";
    });
};
