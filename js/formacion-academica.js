/**
 * @file formacion-academica.js
 * @description Lógica del formulario "Formación Académica" (paso 2 de la HV).
 *
 * Responsabilidades:
 *  - Gestionar el registro de formación básica (grado de escolaridad + título).
 *  - Permitir agregar/eliminar dinámicamente registros de estudios superiores.
 *  - Permitir agregar/eliminar dinámicamente registros de idiomas con niveles.
 *  - Mostrar una vista previa en tiempo real.
 *  - Validar y persistir todos los datos antes de avanzar al siguiente paso.
 *
 * Claves localStorage utilizadas:
 *  - `hv_usuario`             → sesión activa (lectura)
 *  - `hv_formacion_basica`    → datos de educación básica (lectura/escritura)
 *  - `hv_formacion_estudios`  → arreglo de estudios superiores (lectura/escritura)
 *  - `hv_formacion_idiomas`   → arreglo de idiomas (lectura/escritura)
 *  - `hv_estado`              → estado global de la HV (lectura/escritura)
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modalidades de estudio superior disponibles en el selector.
 * @type {Array<{valor: string, texto: string}>}
 */
const modalidades = [
  { valor: 'TC',  texto: 'TC — Técnica' },
  { valor: 'TL',  texto: 'TL — Tecnológica' },
  { valor: 'UN',  texto: 'UN — Universitaria' },
  { valor: 'ES',  texto: 'ES — Especialización' },
  { valor: 'MG',  texto: 'MG — Maestría / Magíster' },
  { valor: 'DOC', texto: 'DOC — Doctorado / PhD' },
];

/**
 * Idiomas disponibles en el selector de idiomas.
 * @type {string[]}
 */
const idiomasDisponibles = [
  'Inglés','Francés','Alemán','Portugués','Italiano',
  'Mandarin','Japonés','Árabe','Otro'
];

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO EN MEMORIA
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Array<Object>} Registros de estudios superiores cargados/editados */
let estudios = [];

/** @type {Array<Object>} Registros de idiomas cargados/editados */
let idiomas  = [];

/** @type {number} Contador para generar índices únicos de tarjetas de estudio */
let contEstudio = 0;

/** @type {number} Contador para generar índices únicos de tarjetas de idioma */
let contIdioma  = 0;

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Mostrar correo del usuario en el encabezado
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  // Cargar datos previos desde localStorage
  estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios') || '[]');
  idiomas  = JSON.parse(localStorage.getItem('hv_formacion_idiomas')  || '[]');

  // Restaurar educación básica si ya fue guardada
  const basica = JSON.parse(localStorage.getItem('hv_formacion_basica') || 'null');
  if (basica) {
    setVal('titulo-basica', basica.titulo);
    setVal('fecha-basica',  basica.fecha);
    marcarGrado(basica.grado);
  }

  // Renderizar tarjetas guardadas (limpiar contenedor primero para evitar duplicados)
  const cont = document.getElementById('estudios-container');
  if (cont) cont.innerHTML = '';
  estudios.forEach((e, i) => agregarEstudioDesdeObjeto(e, i));

  const contId = document.getElementById('idiomas-container');
  if (contId) contId.innerHTML = '';
  idiomas.forEach((id, i) => agregarIdiomaDesdeObjeto(id, i));

  // Si no hay registros guardados, insertar una tarjeta vacía para guiar al usuario
  if (estudios.length === 0) addEstudio();
  if (idiomas.length  === 0) addIdioma();

  inicializarGradosBtns();
  actualizarPreview();

  // Preview en tiempo real
  document.addEventListener('input',  actualizarPreview);
  document.addEventListener('change', actualizarPreview);
});

// ─────────────────────────────────────────────────────────────────────────────
// GRADO DE EDUCACIÓN BÁSICA
// ─────────────────────────────────────────────────────────────────────────────

/** Registra los listeners de los botones de grado (.grado-btn) para selección exclusiva. */
function inicializarGradosBtns() {
  document.querySelectorAll('.grado-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.grado-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

/**
 * Marca como seleccionado el botón de grado cuyo texto coincida con `grado`.
 *
 * @param {string} grado - Texto del grado a seleccionar (ej: 'Bachillerato').
 */
function marcarGrado(grado) {
  document.querySelectorAll('.grado-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === grado);
  });
}

/**
 * Lee el grado actualmente seleccionado.
 *
 * @returns {string} Texto del grado seleccionado, o cadena vacía si ninguno.
 */
function leerGrado() {
  const sel = document.querySelector('.grado-btn.selected');
  return sel ? sel.textContent.trim() : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETAS DE ESTUDIOS SUPERIORES
// ─────────────────────────────────────────────────────────────────────────────

/** Agrega una tarjeta de estudio vacía al contenedor (llamado desde el botón "+ Agregar"). */
function addEstudio() {
  const idx  = contEstudio++;
  const cont = document.getElementById('estudios-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className  = 'subcard';
  div.dataset.idx = idx;
  div.innerHTML  = crearHTMLEstudio(idx, null); // null → tarjeta vacía
  cont.appendChild(div);
  inicializarNivelBtnsEnCard(div);
  renumerarEstudios();
}

/**
 * Agrega una tarjeta de estudio pre-rellenada con datos guardados.
 *
 * @param {Object} obj - Objeto de estudio con campos: modalidad, semestres, graduado, titulo, fecha, tarjeta.
 * @param {number} i   - Índice original (no usado actualmente, se renumera al final).
 */
function agregarEstudioDesdeObjeto(obj, i) {
  const idx  = contEstudio++;
  const cont = document.getElementById('estudios-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className   = 'subcard';
  div.dataset.idx = idx;
  div.innerHTML   = crearHTMLEstudio(idx, obj);
  cont.appendChild(div);
  inicializarNivelBtnsEnCard(div);
  renumerarEstudios();
}

/**
 * Genera el HTML interno de una tarjeta de estudio superior.
 *
 * @param {number}      idx - Índice único de la tarjeta (para atributos `name` de radios).
 * @param {Object|null} obj - Datos a precargar, o null para tarjeta vacía.
 * @returns {string} HTML de la tarjeta.
 */
function crearHTMLEstudio(idx, obj) {
  // Generar <option> para el selector de modalidad, marcando el guardado si existe
  const opcsModal = modalidades.map(m =>
    `<option value="${m.valor}" ${obj && obj.modalidad === m.valor ? 'selected' : ''}>${m.texto}</option>`
  ).join('');

  return `
  <div class="subcard-header">
    <div class="subcard-title">Estudio</div>
    <button class="btn btn-danger" onclick="eliminarEstudio(this)">Eliminar</button>
  </div>
  <div class="form-grid three">
    <div class="field">
      <label>Modalidad <span class="req">*</span></label>
      <select class="est-modalidad">
        <option value="">Seleccione...</option>${opcsModal}
      </select>
      <span class="err">Campo obligatorio</span>
    </div>
    <div class="field">
      <label>N° semestres aprobados</label>
      <input type="number" class="est-semestres" placeholder="Ej: 10" min="1" max="20" value="${obj ? obj.semestres : ''}">
    </div>
    <div class="field">
      <label>¿Graduado? <span class="req">*</span></label>
      <div class="radio-group est-graduado">
        <label class="radio-opt"><input type="radio" name="graduado-${idx}"> Sí</label>
        <label class="radio-opt"><input type="radio" name="graduado-${idx}"> No</label>
      </div>
    </div>
    <div class="field span2">
      <label>Nombre del programa / título <span class="req">*</span></label>
      <input type="text" class="est-titulo" placeholder="Ej: Ingeniería de Sistemas" value="${obj ? obj.titulo : ''}">
      <span class="err">Campo obligatorio</span>
    </div>
    <div class="field">
      <label>Mes y año de terminación</label>
      <input type="month" class="est-fecha" value="${obj ? obj.fecha : ''}">
    </div>
    <div class="field">
      <label>N° tarjeta profesional</label>
      <input type="text" class="est-tarjeta" placeholder="Si aplica" value="${obj ? obj.tarjeta : ''}">
    </div>
  </div>`;
}

/**
 * Elimina la tarjeta de estudio que contiene el botón "Eliminar" presionado.
 *
 * @param {HTMLElement} btn - El botón "Eliminar" dentro de la tarjeta.
 */
function eliminarEstudio(btn) {
  btn.closest('.subcard').remove();
  renumerarEstudios();
}

/** Renumera las tarjetas de estudio como "Estudio 1", "Estudio 2", etc. */
function renumerarEstudios() {
  document.querySelectorAll('#estudios-container .subcard').forEach((sc, i) => {
    const t = sc.querySelector('.subcard-title');
    if (t) t.textContent = 'Estudio ' + (i + 1);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETAS DE IDIOMAS
// ─────────────────────────────────────────────────────────────────────────────

/** Agrega una tarjeta de idioma vacía al contenedor. */
function addIdioma() {
  const idx  = contIdioma++;
  const cont = document.getElementById('idiomas-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLIdioma(idx, null);
  cont.appendChild(div);
  inicializarNivelBtnsEnCard(div);
  renumerarIdiomas();
}

/**
 * Agrega una tarjeta de idioma pre-rellenada con datos guardados.
 *
 * @param {Object} obj - Objeto idioma: {nombre, habla, lee, escribe}.
 * @param {number} i   - Índice original (no usado; se renumera).
 */
function agregarIdiomaDesdeObjeto(obj, i) {
  const idx  = contIdioma++;
  const cont = document.getElementById('idiomas-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLIdioma(idx, obj);
  cont.appendChild(div);
  inicializarNivelBtnsEnCard(div);
  renumerarIdiomas();
}

/**
 * Genera el HTML de una tarjeta de idioma con tres niveles (habla, lee, escribe).
 * Cada nivel usa botones `.nivel-btn` con opciones: Regular, Bien, Muy Bien.
 *
 * @param {number}      idx - Índice único de la tarjeta.
 * @param {Object|null} obj - Datos guardados, o null para tarjeta vacía.
 * @returns {string} HTML de la tarjeta.
 */
function crearHTMLIdioma(idx, obj) {
  const opcsIdioma = idiomasDisponibles.map(id =>
    `<option ${obj && obj.nombre === id ? 'selected' : ''}>${id}</option>`
  ).join('');

  const niveles = ['Regular', 'Bien', 'Muy Bien'];

  /**
   * Genera la sección de nivel (habla / lee / escribe) para un idioma.
   * @param {string} tipo    - Etiqueta visible (ej: 'Lo habla').
   * @param {string} guardado - Nivel guardado previamente (para marcar como seleccionado).
   * @returns {string} HTML del bloque de niveles.
   */
  const crearNivel = (tipo, guardado) => `
    <div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px;font-weight:600;">${tipo.toUpperCase()}</div>
      <div class="nivel-opts">
        ${niveles.map(n => `<div class="nivel-btn ${guardado === n ? 'sel' : ''}">${n}</div>`).join('')}
      </div>
    </div>`;

  return `
  <div class="subcard-header">
    <div class="subcard-title">Idioma</div>
    <button class="btn btn-danger" onclick="this.closest('.subcard').remove(); renumerarIdiomas()">Eliminar</button>
  </div>
  <div class="field" style="margin-bottom:10px;">
    <label>Idioma</label>
    <select class="idioma-nombre" style="max-width:200px;">${opcsIdioma}</select>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
    ${crearNivel('Lo habla',   obj ? obj.habla   : '')}
    ${crearNivel('Lo lee',     obj ? obj.lee     : '')}
    ${crearNivel('Lo escribe', obj ? obj.escribe : '')}
  </div>`;
}

/** Renumera las tarjetas de idioma como "Idioma 1", "Idioma 2", etc. */
function renumerarIdiomas() {
  document.querySelectorAll('#idiomas-container .subcard').forEach((sc, i) => {
    const t = sc.querySelector('.subcard-title');
    if (t) t.textContent = 'Idioma ' + (i + 1);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN DE CONTROLES DENTRO DE TARJETAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicializa los botones radio (.radio-opt) y los botones de nivel (.nivel-btn)
 * dentro de una tarjeta recién creada.
 *
 * Debe llamarse cada vez que se agrega una nueva tarjeta al DOM.
 *
 * @param {HTMLElement} card - Elemento .subcard recién insertado.
 */
function inicializarNivelBtnsEnCard(card) {
  // Grupos radio (ej: "¿Graduado?")
  card.querySelectorAll('.radio-group').forEach(group => {
    group.querySelectorAll('.radio-opt').forEach(opt => {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  });

  // Botones de nivel de idioma (Regular / Bien / Muy Bien)
  card.querySelectorAll('.nivel-opts').forEach(opts => {
    opts.querySelectorAll('.nivel-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        opts.querySelectorAll('.nivel-btn').forEach(b => b.classList.remove('sel'));
        this.classList.add('sel');
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA DE DATOS DEL DOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recorre todas las tarjetas de estudio del DOM y retorna un arreglo de objetos.
 *
 * @returns {Array<{modalidad, semestres, graduado, titulo, fecha, tarjeta}>}
 */
function leerEstudios() {
  const resultado = [];
  document.querySelectorAll('#estudios-container .subcard').forEach(sc => {
    resultado.push({
      modalidad: sc.querySelector('.est-modalidad')?.value || '',
      semestres: sc.querySelector('.est-semestres')?.value || '',
      graduado:  sc.querySelector('.est-graduado .radio-opt.selected')?.textContent.trim() || '',
      titulo:    sc.querySelector('.est-titulo')?.value.trim() || '',
      fecha:     sc.querySelector('.est-fecha')?.value || '',
      tarjeta:   sc.querySelector('.est-tarjeta')?.value.trim() || '',
    });
  });
  return resultado;
}

/**
 * Recorre todas las tarjetas de idioma del DOM y retorna un arreglo de objetos.
 *
 * @returns {Array<{nombre, habla, lee, escribe}>}
 */
function leerIdiomas() {
  const resultado = [];
  document.querySelectorAll('#idiomas-container .subcard').forEach(sc => {
    const niveles   = sc.querySelectorAll('.nivel-opts');
    const leerNivel = (opts) => opts?.querySelector('.nivel-btn.sel')?.textContent.trim() || '';
    resultado.push({
      nombre:  sc.querySelector('.idioma-nombre')?.value || '',
      habla:   leerNivel(niveles[0]),
      lee:     leerNivel(niveles[1]),
      escribe: leerNivel(niveles[2]),
    });
  });
  return resultado;
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el panel de vista previa con los datos actuales del formulario.
 * Muestra grado básico, lista de estudios y lista de idiomas en formato compacto.
 */
function actualizarPreview() {
  const grado    = leerGrado();
  const titulo   = document.getElementById('titulo-basica')?.value || '';
  const estudArr = leerEstudios();
  const idioArr  = leerIdiomas();

  setText('prev-grado',
    grado ? grado + (titulo ? ' — ' + titulo : '') : '—');

  setText('prev-estudios',
    estudArr.length > 0
      ? estudArr.map(e => (e.modalidad || '?') + (e.titulo ? ' — ' + e.titulo : '')).join(' | ')
      : '—');

  setText('prev-idiomas',
    idioArr.length > 0
      ? idioArr.map(i => i.nombre + (i.habla ? ': H' + i.habla : '')).join(' | ')
      : '—');
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida que cada estudio tenga modalidad y título, luego guarda toda la
 * formación académica en localStorage y navega a `experiencia-laboral.html`.
 */
function guardarYContinuar() {
  let valido = true;

  // Validar campos obligatorios en cada tarjeta de estudio
  document.querySelectorAll('#estudios-container .subcard').forEach(sc => {
    const modal = sc.querySelector('.est-modalidad');
    const tit   = sc.querySelector('.est-titulo');
    if (modal && !modal.value)       { mostrarErr(modal, 'Seleccione modalidad'); valido = false; }
    if (tit   && !tit.value.trim())  { mostrarErr(tit,   'Campo obligatorio');    valido = false; }
  });

  if (!valido) {
    document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Construir objeto de formación básica
  const basica = {
    grado:  leerGrado(),
    titulo: document.getElementById('titulo-basica')?.value.trim() || '',
    fecha:  document.getElementById('fecha-basica')?.value || '',
  };

  estudios = leerEstudios();
  idiomas  = leerIdiomas();

  // Persistir en localStorage
  localStorage.setItem('hv_formacion_basica',   JSON.stringify(basica));
  localStorage.setItem('hv_formacion_estudios', JSON.stringify(estudios));
  localStorage.setItem('hv_formacion_idiomas',  JSON.stringify(idiomas));

  // Actualizar estado global de la HV
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado    = hv.estado || 'diligenciada';
  hv.formacion = estudios.length;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'experiencia-laboral.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/** @see datos-personales.js → setText */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** @see datos-personales.js → setVal */
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val != null) el.value = val;
}

/**
 * Muestra un mensaje de error junto a un campo de formulario.
 *
 * @param {HTMLElement} el  - El input/select que falló la validación.
 * @param {string}      msg - Mensaje de error a mostrar.
 */
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
  err.textContent   = msg;
  err.style.display = 'block';
}
