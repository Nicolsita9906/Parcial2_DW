// ─────────────────────────────────────────────
// ARREGLOS PREDEFINIDOS
// ─────────────────────────────────────────────

// Lista de modalidades académicas disponibles
// Se usa para llenar el <select> en cada estudio
const modalidades = [
    { valor: 'TC',  texto: 'TC — Técnica' },
    { valor: 'TL',  texto: 'TL — Tecnológica' },
    { valor: 'UN',  texto: 'UN — Universitaria' },
    { valor: 'ES',  texto: 'ES — Especialización' },
    { valor: 'MG',  texto: 'MG — Maestría / Magíster' },
    { valor: 'DOC', texto: 'DOC — Doctorado / PhD' },
];

// Lista de idiomas disponibles para seleccionar
const idiomasDisponibles = [
    'Inglés','Francés','Alemán','Portugués',
    'Italiano','Mandarin','Japonés','Árabe','Otro'
];


// ─────────────────────────────────────────────
// ESTADO EN MEMORIA (variables globales)
// ─────────────────────────────────────────────

// Guarda los estudios actuales en memoria
let estudios = [];

// Guarda los idiomas actuales en memoria
let idiomas  = [];

// Contadores para numerar dinámicamente estudios e idiomas
let contEstudio = 0;
let contIdioma  = 0;


// ─────────────────────────────────────────────
// EVENTO PRINCIPAL AL CARGAR LA PÁGINA
// ─────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {

    // Obtener usuario guardado en localStorage
    const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');

    // Mostrar correo en el header
    const headerEl = document.getElementById('header-usuario');
    if (headerEl) headerEl.textContent = u.correo || '';

    // ── Cargar datos guardados ──

    // Estudios guardados
    estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios') || '[]');

    // Idiomas guardados
    idiomas  = JSON.parse(localStorage.getItem('hv_formacion_idiomas')  || '[]');


    // ── Cargar educación básica ──
    const basica = JSON.parse(localStorage.getItem('hv_formacion_basica') || 'null');

    if (basica) {
        // Rellenar campos
        setVal('titulo-basica', basica.titulo);
        setVal('fecha-basica', basica.fecha);

        // Marcar el grado seleccionado
        marcarGrado(basica.grado);
    }


    // ── Renderizar estudios guardados ──
    const cont = document.getElementById('estudios-container');
    if (cont) cont.innerHTML = '';

    estudios.forEach((e, i) => agregarEstudioDesdeObjeto(e, i));


    // ── Renderizar idiomas guardados ──
    const contId = document.getElementById('idiomas-container');
    if (contId) contId.innerHTML = '';

    idiomas.forEach((id, i) => agregarIdiomaDesdeObjeto(id, i));


    // ── Si no hay datos, crear uno por defecto ──
    if (estudios.length === 0) addEstudio();
    if (idiomas.length === 0)  addIdioma();


    // Inicializar eventos de botones de grado
    inicializarGradosBtns();

    // Actualizar vista previa inicial
    actualizarPreview();

    // Escuchar cambios en toda la página
    document.addEventListener('input', actualizarPreview);
    document.addEventListener('change', actualizarPreview);
});


// ─────────────────────────────────────────────
// MANEJO DE GRADOS
// ─────────────────────────────────────────────

// Activa selección de botones de grado
function inicializarGradosBtns() {
    document.querySelectorAll('.grado-btn').forEach(btn => {
        btn.addEventListener('click', function () {

            // Quitar selección a todos
            document.querySelectorAll('.grado-btn')
                .forEach(b => b.classList.remove('selected'));

            // Marcar el seleccionado
            this.classList.add('selected');
        });
    });
}

// Marca un grado específico (usado al cargar datos)
function marcarGrado(grado) {
    document.querySelectorAll('.grado-btn').forEach(btn => {
        btn.classList.toggle('selected',
            btn.textContent.trim() === grado
        );
    });
}

// Devuelve el grado seleccionado
function leerGrado() {
    const sel = document.querySelector('.grado-btn.selected');
    return sel ? sel.textContent.trim() : '';
}


// ─────────────────────────────────────────────
// CREACIÓN DE ESTUDIOS
// ─────────────────────────────────────────────

// Agregar estudio vacío
function addEstudio() {

    const idx = contEstudio++;

    const cont = document.getElementById('estudios-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'subcard';
    div.dataset.idx = idx;

    // Insertar HTML generado
    div.innerHTML = crearHTMLEstudio(idx, null);

    cont.appendChild(div);

    // Activar eventos dentro del nuevo elemento
    inicializarNivelBtnsEnCard(div);

    // Renumerar estudios
    renumerarEstudios();
}


// Agregar estudio desde datos guardados
function agregarEstudioDesdeObjeto(obj, i) {

    const idx = contEstudio++;

    const cont = document.getElementById('estudios-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'subcard';
    div.dataset.idx = idx;

    div.innerHTML = crearHTMLEstudio(idx, obj);

    cont.appendChild(div);

    inicializarNivelBtnsEnCard(div);

    renumerarEstudios();
}


// Genera el HTML de un estudio
function crearHTMLEstudio(idx, obj) {

    // Crear opciones del select
    const opcsModal = modalidades.map(m =>
        `<option value="${m.valor}"
        ${obj && obj.modalidad === m.valor ? 'selected' : ''}>
        ${m.texto}</option>`
    ).join('');

    return `
    <!-- Aquí se construye todo el formulario dinámico -->
    `;
}


// Eliminar estudio
function eliminarEstudio(btn) {
    btn.closest('.subcard').remove();
    renumerarEstudios();
}


// Renumerar estudios (Estudio 1, 2, 3...)
function renumerarEstudios() {
    document.querySelectorAll('#estudios-container .subcard')
        .forEach((sc, i) => {
            const t = sc.querySelector('.subcard-title');
            if (t) t.textContent = 'Estudio ' + (i + 1);
        });
}


// ─────────────────────────────────────────────
// EVENTOS INTERNOS (botones dinámicos)
// ─────────────────────────────────────────────

function inicializarNivelBtnsEnCard(card) {

    // Radios (Sí / No)
    card.querySelectorAll('.radio-group').forEach(group => {
        group.querySelectorAll('.radio-opt').forEach(opt => {

            opt.addEventListener('click', function () {

                group.querySelectorAll('.radio-opt')
                    .forEach(o => o.classList.remove('selected'));

                this.classList.add('selected');
            });
        });
    });

    // Botones de nivel (idiomas)
    card.querySelectorAll('.nivel-opts').forEach(opts => {
        opts.querySelectorAll('.nivel-btn').forEach(btn => {

            btn.addEventListener('click', function () {

                opts.querySelectorAll('.nivel-btn')
                    .forEach(b => b.classList.remove('sel'));

                this.classList.add('sel');
            });
        });
    });
}


// ─────────────────────────────────────────────
// CREACIÓN DE IDIOMAS
// ─────────────────────────────────────────────

function addIdioma() {

    const idx = contIdioma++;

    const cont = document.getElementById('idiomas-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'subcard';

    div.innerHTML = crearHTMLIdioma(idx, null);

    cont.appendChild(div);

    inicializarNivelBtnsEnCard(div);

    renumerarIdiomas();
}


// Leer datos desde el DOM (estudios)
function leerEstudios() {

    const resultado = [];

    document.querySelectorAll('#estudios-container .subcard')
        .forEach(sc => {

            resultado.push({
                modalidad: sc.querySelector('.est-modalidad')?.value || '',
                semestres: sc.querySelector('.est-semestres')?.value || '',
                graduado:  sc.querySelector('.radio-opt.selected')?.textContent.trim() || '',
                titulo:    sc.querySelector('.est-titulo')?.value.trim() || '',
                fecha:     sc.querySelector('.est-fecha')?.value || '',
                tarjeta:   sc.querySelector('.est-tarjeta')?.value.trim() || '',
            });
        });

    return resultado;
}


// ─────────────────────────────────────────────
// VISTA PREVIA
// ─────────────────────────────────────────────

function actualizarPreview() {

    const grado  = leerGrado();
    const titulo = document.getElementById('titulo-basica')?.value || '';

    // Mostrar datos en pantalla
    setText('prev-grado',
        grado ? grado + (titulo ? ' — ' + titulo : '') : '—'
    );
}


// Función auxiliar para escribir texto
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}


// ─────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────

function guardarYContinuar() {

    let valido = true;

    // Validación básica
    document.querySelectorAll('#estudios-container .subcard')
        .forEach(sc => {

            const modal = sc.querySelector('.est-modalidad');
            const tit   = sc.querySelector('.est-titulo');

            if (modal && !modal.value) {
                mostrarErr(modal, 'Seleccione modalidad');
                valido = false;
            }

            if (tit && !tit.value.trim()) {
                mostrarErr(tit, 'Campo obligatorio');
                valido = false;
            }
        });

    if (!valido) return;


    // Guardar datos en localStorage
    const basica = {
        grado:  leerGrado(),
        titulo: document.getElementById('titulo-basica')?.value.trim() || '',
        fecha:  document.getElementById('fecha-basica')?.value || '',
    };

    localStorage.setItem('hv_formacion_basica', JSON.stringify(basica));

    // Redirigir a la siguiente página
    window.location.href = 'experiencia-laboral.html';
}


// Mostrar errores en el formulario
function mostrarErr(el, msg) {

    const field = el.closest('.field');
    if (!field) return;

    field.classList.add('has-error');

    let err = field.querySelector('.err');

    if (!err) {
        err = document.createElement('span');
        err.className = 'err';
        field.appendChild(err);
    }

    err.textContent = msg;
    err.style.display = 'block';
}