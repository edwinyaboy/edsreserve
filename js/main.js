document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.querySelector(".close");
    let scale = 1, panX = 0, panY = 0;
    let isDragging = false, startX, startY;
    let touchDistance = 0;

    if (!modal || !modalImg) return;

    modal.classList.add("modal-transition");

    document.querySelectorAll(".strain-img").forEach(img => {
        img.addEventListener("click", function() {
            document.body.classList.add("modal-open");
            modal.style.display = "flex";
            setTimeout(() => modal.classList.add("open"), 10);
            modalImg.src = this.src;
            resetZoom();
        });
    });

    function closeModal() {
        modal.classList.remove("open");
        setTimeout(() => {
            modal.style.display = "none";
            document.body.classList.remove("modal-open");
        }, 300);
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = e => { if(e.target===modal) closeModal(); }
    window.addEventListener("keydown", e => { if(e.key==="Escape") closeModal(); });

    modalImg.addEventListener("mousedown", e => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        modalImg.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", e => {
        if(!isDragging) return;
        e.preventDefault();
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        modalImg.style.cursor = "grab";
    });

    modalImg.addEventListener("wheel", e => {
        e.preventDefault();
        const rect = modalImg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = -Math.sign(e.deltaY)*0.1;
        zoomAt(Math.min(3, Math.max(0.5, scale + delta)), mouseX, mouseY);
    });

    modalImg.addEventListener("touchstart", e => {
        e.preventDefault();
        if(e.touches.length===2) touchDistance = getTouchDistance(e.touches);
        else if(e.touches.length===1){
            isDragging=true;
            startX=e.touches[0].clientX - panX;
            startY=e.touches[0].clientY - panY;
        }
    }, { passive:false });

    modalImg.addEventListener("touchmove", e => {
        e.preventDefault();
        if(e.touches.length===2){
            const newDist = getTouchDistance(e.touches);
            const delta = (newDist - touchDistance) * 0.02;
            const rect = modalImg.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX)/2 - rect.left;
            const midY = (e.touches[0].clientY + e.touches[1].clientY)/2 - rect.top;
            zoomAt(Math.min(3, Math.max(0.5, scale + delta)), midX, midY);
            touchDistance = newDist;
        } else if(e.touches.length===1 && isDragging){
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            applyTransform();
        }
    }, { passive:false });

    modalImg.addEventListener("touchend", e => {
        if(e.touches.length<2) touchDistance=0;
        if(e.touches.length===0) isDragging=false;
    });

    modalImg.addEventListener("dblclick", resetZoom);

    function getTouchDistance(touches){
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx*dx + dy*dy);
    }

	function zoomAt(newScale, mouseX, mouseY) {
		const rect = modalImg.getBoundingClientRect();
		const mouseImgX = mouseX;
		const mouseImgY = mouseY;		
		const newPanX = mouseImgX - (mouseImgX - panX) * (newScale / scale);
		const newPanY = mouseImgY - (mouseImgY - panY) * (newScale / scale);
	
		panX = newPanX;
		panY = newPanY;
		scale = Math.min(3, Math.max(0.5, newScale));
		applyTransform();
	}

    function resetZoom(){
        scale=1; panX=0; panY=0;
        applyTransform();
    }

    function applyTransform(){
        modalImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    document.querySelectorAll('.toggle-btn').forEach(button=>{
        button.addEventListener('click', ()=>{
            const details=button.nextElementSibling;
            details.classList.toggle('show');
            button.innerText = details.classList.contains('show') 
                ? "Hide Strain Details" 
                : "View Strain Details";
        });
    });
});