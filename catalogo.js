/* ═══════════════════════════════════════════════════════════════
   CATÁLOGO — intro robot + modal carrusel con robot en esquina
═══════════════════════════════════════════════════════════════ */

/* ── 1. INTRO ROBOT ── */
function abrirCatalogo() {
    const overlay = document.getElementById('robot-intro');
    if (!overlay) return;

    overlay.classList.remove('saliendo');
    overlay.classList.add('activo');

    setTimeout(() => {
        overlay.classList.add('saliendo');
        setTimeout(() => {
            overlay.classList.remove('activo', 'saliendo');
            const destino = document.getElementById('catalogo');
            if (destino) {
                destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', '#catalogo');
            }
        }, 400);
    }, 1800);
}

/* ── 2. INYECTAR EL MODAL EN EL DOM ── */
(function crearModal() {
    const html = `
    <div id="galeria-modal">
        <div class="modal-box">
            <button class="modal-cerrar" id="modal-cerrar" aria-label="Cerrar">
                <i class="ti ti-x"></i>
            </button>

            <p class="modal-titulo" id="modal-titulo">Galería</p>

            <!-- Carrusel -->
            <div class="carrusel-wrap">
                <div class="carrusel-slide activo" id="slide-0">
                    <img src="" alt="Imagen 1" id="slide-img-0">
                </div>
                <div class="carrusel-slide" id="slide-1">
                    <img src="" alt="Imagen 2" id="slide-img-1">
                </div>
                <div class="carrusel-slide" id="slide-2">
                    <img src="" alt="Imagen 3" id="slide-img-2">
                </div>

                <!-- Flechas -->
                <button class="carrusel-btn prev" id="btn-prev" aria-label="Anterior">
                    <i class="ti ti-chevron-left"></i>
                </button>
                <button class="carrusel-btn next" id="btn-next" aria-label="Siguiente">
                    <i class="ti ti-chevron-right"></i>
                </button>
            </div>

            <!-- Puntos indicadores -->
            <div class="carrusel-dots">
                <span class="carrusel-dot activo" data-idx="0"></span>
                <span class="carrusel-dot"        data-idx="1"></span>
                <span class="carrusel-dot"        data-idx="2"></span>
            </div>

            <!-- Robot en esquina inferior derecha -->
            <div class="modal-robot-wrap">
                <div class="robot-burbuja">
                    Mira nada más,<br>esto puede ser tuyo,<br>¡no esperes más!
                </div>
                <div class="robot-wrap-sm">
                    <div class="robot-antenna-sm">
                        <span class="robot-antenna-light-sm"></span>
                    </div>
                    <div class="robot-head-sm">
                        <div class="robot-eye-sm"></div>
                        <div class="robot-eye-sm"></div>
                        <div class="robot-mouth-sm"></div>
                    </div>
                    <div class="robot-body-sm">
                        <div class="robot-light-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    iniciarCarrusel();
    iniciarGaleria();
})();

/* ── 3. CARRUSEL ── */
let slideActual = 0;
const TOTAL_SLIDES = 3;

function iniciarCarrusel() {
    document.getElementById('btn-prev').addEventListener('click', () => moverSlide(-1));
    document.getElementById('btn-next').addEventListener('click', () => moverSlide(1));

    document.querySelectorAll('.carrusel-dot').forEach(dot => {
        dot.addEventListener('click', () => irSlide(parseInt(dot.dataset.idx)));
    });
}

function moverSlide(dir) {
    irSlide((slideActual + dir + TOTAL_SLIDES) % TOTAL_SLIDES);
}

function irSlide(idx) {
    document.getElementById('slide-' + slideActual).classList.remove('activo');
    document.querySelectorAll('.carrusel-dot')[slideActual].classList.remove('activo');

    slideActual = idx;

    document.getElementById('slide-' + slideActual).classList.add('activo');
    document.querySelectorAll('.carrusel-dot')[slideActual].classList.add('activo');
}

/* ── 4. ABRIR MODAL CON LAS IMÁGENES DE LA TARJETA ── */
function iniciarGaleria() {
    const modal   = document.getElementById('galeria-modal');
    const cerrar  = document.getElementById('modal-cerrar');

    // Cerrar con botón X
    cerrar.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic en el fondo oscuro
    modal.addEventListener('click', e => {
        if (e.target === modal) cerrarModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') cerrarModal();
        if (e.key === 'ArrowLeft')  moverSlide(-1);
        if (e.key === 'ArrowRight') moverSlide(1);
    });

    // Asignar clic a cada imagen de la galería del catálogo
    document.querySelectorAll('.catalogo-galeria .galeria-item').forEach(item => {
        item.addEventListener('click', () => {
            // Encontrar la tarjeta padre
            const card  = item.closest('.catalogo-card');
            const titulo = card.querySelector('.catalogo-titulo').textContent;
            const imgs   = card.querySelectorAll('.galeria-item img');

            // Cargar las 3 imágenes en los slides
            imgs.forEach((img, i) => {
                const slideImg = document.getElementById('slide-img-' + i);
                const slide    = document.getElementById('slide-' + i);

                slideImg.src = img.src;
                slideImg.alt = img.alt;

                // Si la imagen original no cargó, mostrar placeholder
                if (item.classList.contains('sin-imagen') || !img.src || img.naturalWidth === 0) {
                    slide.classList.add('vacio');
                    slideImg.style.display = 'none';
                } else {
                    slide.classList.remove('vacio');
                    slideImg.style.display = 'block';
                }
            });

            // Actualizar título y resetear al slide 0
            document.getElementById('modal-titulo').textContent = titulo;
            irSlide(0);

            // Mostrar modal
            modal.classList.add('activo');
            document.body.style.overflow = 'hidden';
        });
    });
}

function cerrarModal() {
    const modal = document.getElementById('galeria-modal');
    modal.classList.remove('activo');
    document.body.style.overflow = '';
}

/* ── 5. SWIPE TÁCTIL para el carrusel ── */
(function swipe() {
    let startX = 0;

    document.addEventListener('touchstart', e => {
        if (!document.getElementById('galeria-modal').classList.contains('activo')) return;
        startX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (!document.getElementById('galeria-modal').classList.contains('activo')) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) moverSlide(diff > 0 ? 1 : -1);
    }, { passive: true });
})();