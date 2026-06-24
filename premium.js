/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE REGISTRO PREMIUM — premium.js
   Agregar en index.html antes de </body>:
   <script src="premium.js"></script>
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Clave de localStorage ── */
    const LS_KEY = 'fhm_usuario';

    /* ══════════════════════════════════════════════════════════
       1. INYECTAR EL HTML DEL MODAL AL CARGAR
    ══════════════════════════════════════════════════════════ */
    function inyectarModal() {
        const html = `
        <div id="premium-overlay">
            <div class="premium-box">

                <!-- Cabecera -->
                <div class="premium-header">
                    <div class="premium-badge">
                        <i class="ti ti-crown"></i> Acceso Premium
                    </div>
                    <h2 class="premium-titulo">Bienvenido al portfolio</h2>
                    <p class="premium-subtitulo">
                        Regístrate gratis y desbloquea contenido exclusivo.<br>
                        Solo necesito tu nombre y correo.
                    </p>
                </div>

                <!-- Beneficios -->
                <div class="premium-beneficios">
                    <div class="beneficio-item">
                        <i class="ti ti-file-download"></i>
                        Descargar mi CV / portafolio en PDF
                    </div>
                    <div class="beneficio-item">
                        <i class="ti ti-mail-forward"></i>
                        Formulario de contacto prioritario directo
                    </div>
                </div>

                <!-- Formulario -->
                <div class="premium-form">
                    <div class="premium-input-wrap">
                        <i class="ti ti-user"></i>
                        <input
                            class="premium-input"
                            id="pr-nombre"
                            type="text"
                            placeholder="Tu nombre completo"
                            autocomplete="name"
                        />
                    </div>
                    <div class="premium-input-wrap">
                        <i class="ti ti-mail"></i>
                        <input
                            class="premium-input"
                            id="pr-correo"
                            type="email"
                            placeholder="Tu correo electrónico"
                            autocomplete="email"
                        />
                    </div>
                    <span class="premium-error" id="pr-error">Por favor completa todos los campos correctamente.</span>

                    <button class="btn-premium" id="btn-registrar">
                        <i class="ti ti-crown"></i>
                        Registrarme y acceder
                    </button>

                    <div class="premium-sep">o</div>

                    <button class="btn-guest" id="btn-guest">
                        <i class="ti ti-eye"></i>
                        Continuar sin registrarme
                    </button>
                </div>

            </div>
        </div>

        <!-- Barra de usuario (aparece en navbar cuando está logueado) -->
        <div id="premium-user-bar" title="Cerrar sesión">
            <div class="user-avatar" id="user-avatar-inicial"></div>
            <span class="user-name" id="user-name-label"></span>
            <span class="premium-tag"><i class="ti ti-crown"></i> Premium</span>
        </div>

        <!-- Toast de bienvenida -->
        <div id="premium-toast">
            <i class="ti ti-sparkles"></i>
            <span id="toast-msg"></span>
        </div>`;

        document.body.insertAdjacentHTML('afterbegin', html);
    }

    /* ══════════════════════════════════════════════════════════
       2. INYECTAR SECCIÓN PREMIUM EN EL CONTACTO
    ══════════════════════════════════════════════════════════ */
    function inyectarSeccionPremium() {
        const contactoSection = document.getElementById('contacto');
        if (!contactoSection) return;

        const wrapper = contactoSection.querySelector('.contact-wrapper');
        if (!wrapper) return;

        const seccion = document.createElement('div');
        seccion.id = 'seccion-premium';
        seccion.innerHTML = `
            <div class="premium-zona">
                <p class="premium-zona-titulo">
                    <i class="ti ti-crown"></i>
                    Beneficios exclusivos para ti
                </p>

                <!-- Descargar CV -->
                <div>
                    <p style="font-size:13px;color:#8a8fa8;margin-bottom:12px;">
                        Descarga mi CV y portafolio completo en PDF:
                    </p>
                    <!-- ✏️ Cambia el href por la ruta real de tu PDF cuando lo tengas -->
                    <a href="cv/cv-fredy_fabricio.pdf" download class="btn-cv">
                        <i class="ti ti-file-download"></i>
                        Descargar CV (PDF)
                    </a>
                    <p style="font-size:11px;color:#5a5f78;margin-top:8px;">
                        <!-- ✏️ Actualiza esto cuando subas tu PDF -->
                        Próximamente disponible · Avísame y te lo envío por correo
                    </p>
                </div>

                <!-- Formulario prioritario -->
                <div>
                    <p class="premium-zona-titulo" style="font-size:14px;margin-bottom:12px;">
                        <i class="ti ti-mail-forward"></i>
                        Contacto prioritario
                    </p>
                    <div class="contacto-premium-form">
                        <textarea
                            id="pr-mensaje"
                            placeholder="Cuéntame sobre tu proyecto o propuesta..."
                        ></textarea>
                        <button class="btn-enviar-contacto" id="btn-enviar-premium">
                            <i class="ti ti-send"></i>
                            Enviar mensaje prioritario
                        </button>
                        <span class="contacto-enviado" id="contacto-ok">
                            <i class="ti ti-circle-check"></i>
                            ¡Mensaje enviado! Te respondo pronto.
                        </span>
                    </div>
                </div>
            </div>`;

        wrapper.appendChild(seccion);
    }

    /* ══════════════════════════════════════════════════════════
       3. MOSTRAR / OCULTAR SEGÚN SESIÓN
    ══════════════════════════════════════════════════════════ */
    function mostrarEstadoPremium(usuario) {
        const userBar    = document.getElementById('premium-user-bar');
        const nameLabel  = document.getElementById('user-name-label');
        const avatarEl   = document.getElementById('user-avatar-inicial');
        const secPremium = document.getElementById('seccion-premium');

        if (usuario) {
            // Mostrar barra de usuario
            nameLabel.textContent  = usuario.nombre.split(' ')[0]; // solo primer nombre
            avatarEl.textContent   = usuario.nombre.charAt(0).toUpperCase();
            userBar.style.display  = 'flex';

            // Mostrar sección premium
            if (secPremium) secPremium.classList.add('visible');
        } else {
            userBar.style.display  = 'none';
            if (secPremium) secPremium.classList.remove('visible');
        }
    }

    /* ══════════════════════════════════════════════════════════
       4. TOAST DE BIENVENIDA
    ══════════════════════════════════════════════════════════ */
    function mostrarToast(msg) {
        const toast = document.getElementById('premium-toast');
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 3500);
    }

    /* ══════════════════════════════════════════════════════════
       5. VALIDAR CORREO
    ══════════════════════════════════════════════════════════ */
    function esCorreoValido(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    /* ══════════════════════════════════════════════════════════
       6. CERRAR MODAL
    ══════════════════════════════════════════════════════════ */
    function cerrarModal() {
        document.getElementById('premium-overlay').classList.remove('activo');
        document.body.style.overflow = '';
    }

    /* ══════════════════════════════════════════════════════════
       7. LÓGICA DE EVENTOS
    ══════════════════════════════════════════════════════════ */
    function iniciarEventos() {

        /* Registrar */
        document.getElementById('btn-registrar').addEventListener('click', () => {
            const nombre = document.getElementById('pr-nombre').value.trim();
            const correo = document.getElementById('pr-correo').value.trim();
            const error  = document.getElementById('pr-error');

            if (!nombre || !esCorreoValido(correo)) {
                error.classList.add('visible');
                return;
            }
            error.classList.remove('visible');

            const usuario = { nombre, correo, premium: true };
            localStorage.setItem(LS_KEY, JSON.stringify(usuario));

            cerrarModal();
            mostrarEstadoPremium(usuario);
            mostrarToast(`¡Bienvenido, ${nombre.split(' ')[0]}! Ya tienes acceso premium 🎉`);
        });

        /* Enter en los inputs también registra */
        ['pr-nombre', 'pr-correo'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', e => {
                if (e.key === 'Enter') document.getElementById('btn-registrar').click();
            });
        });

        /* Continuar sin registro */
        document.getElementById('btn-guest').addEventListener('click', () => {
            cerrarModal();
            mostrarToast('Navegando como visitante — puedes registrarte cuando quieras.');
        });

        /* Barra de usuario → cerrar sesión al hacer clic */
        document.getElementById('premium-user-bar').addEventListener('click', () => {
            if (confirm('¿Cerrar sesión?')) {
                localStorage.removeItem(LS_KEY);
                mostrarEstadoPremium(null);
                mostrarToast('Sesión cerrada correctamente.');
            }
        });

        /* Formulario contacto prioritario */
        const btnEnviar = document.getElementById('btn-enviar-premium');
        if (btnEnviar) {
            btnEnviar.addEventListener('click', () => {
                const msg = document.getElementById('pr-mensaje').value.trim();
                if (!msg) return;

                const usuario = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
                /* ✏️ Aquí puedes integrar un servicio como Formspree o EmailJS.
                   Por ahora abre el cliente de correo con el mensaje pre-relleno. */
                const subject = encodeURIComponent(`Contacto prioritario de ${usuario.nombre || 'usuario premium'}`);
                const body    = encodeURIComponent(`De: ${usuario.nombre} (${usuario.correo})\n\n${msg}`);
                window.location.href = `mailto:fredyfabriciohernandezmartiez@gmail.com?subject=${subject}&body=${body}`;

                document.getElementById('contacto-ok').classList.add('visible');
                document.getElementById('pr-mensaje').value = '';
            });
        }
    }

    /* ══════════════════════════════════════════════════════════
       8. INICIALIZACIÓN
    ══════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', () => {
        inyectarModal();
        inyectarSeccionPremium();
        iniciarEventos();

        const usuarioGuardado = JSON.parse(localStorage.getItem(LS_KEY) || 'null');

        if (usuarioGuardado) {
            /* Ya está registrado → no mostrar modal, restaurar sesión */
            mostrarEstadoPremium(usuarioGuardado);
            mostrarToast(`¡Hola de nuevo, ${usuarioGuardado.nombre.split(' ')[0]}! 👋`);
        } else {
            /* Primera visita o sin sesión → mostrar modal tras 800ms */
            setTimeout(() => {
                document.getElementById('premium-overlay').classList.add('activo');
                document.body.style.overflow = 'hidden';
            }, 800);
        }
    });

})();
