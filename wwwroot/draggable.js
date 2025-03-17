window.makeDraggable = (elementId) => {
    const el = document.getElementById(elementId);
    let offsetX = 0, offsetY = 0, isDragging = false;

    el.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
        el.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        el.style.left = `${e.clientX - offsetX}px`;
        el.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        el.style.cursor = "grab";
    });
};
