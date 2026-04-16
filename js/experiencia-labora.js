/**
 * @file experiencia-laboral.js
 * @description Lógica del formulario "Experiencia Laboral" (paso 3 de la HV).
 *
 * Responsabilidades:
 *  - Renderizar dinámicamente tarjetas de experiencia (una por empleo).
 *  - Cargar experiencias previas desde localStorage al iniciar.
 *  - Garantizar al menos una tarjeta vacía si no hay datos guardados.
 *  - Mostrar vista previa en tiempo real de los dos primeros registros.
 *  - Validar campos obligatorios y guardar antes de avanzar al siguiente paso.
 *
 * Claves localStorage utilizadas:
 *  - `hv_usuario`     → sesión activa (lectura)
 *  - `hv_experiencia` → arreglo de experiencias laborales (lectura/escritura)
 *  - `hv_estado`      → estado global de la HV (lectura/escritura)
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipos de entidad disponibles para los botones radio de cada tarjeta.
 * @type {string[]}
 */
const tiposEntidad = ['Pública', 'Privada', 'Mixta'];

/**
 * Departamentos de Colombia disponibles en el selector de ubicación de la entidad.
 * @type {string[]}
 */
const departamentosExp = [
  'Antioquia','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas',
  'Cundinamarca','Huila','La Guajira','Meta','Nariño','Norte de Santander',
  'Quindío','Risaralda','Santander','Tolima','Valle del Cauca'
];

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO EN MEMORIA
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Array<Object>} Experiencias cargadas/editadas en la sesión actual */
let experiencias = [];

/** @type {number} Contador para asignar índices únicos a cada tarjeta generada */
let contExp = 0;

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Mostrar correo del usuario en el encabezado
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  // Cargar experiencias guardadas
  experiencias = JSON.parse(localStorage.getItem('hv_experiencia') || '[]');

  // Limpiar el contenedor y re-renderizar las tarjetas guardadas
  const cont = document.getElementById('exp-container');
  if (cont) cont.innerHTML = '';
  experiencias.forEach(e => agregarExpDesdeObjeto(e));

  // Si no hay experiencias, mostrar una tarjeta vacía de inicio
  if (experiencias.length === 0) addExperiencia();

  actualizarPreview();

  // Actualizar preview en tiempo real
  document.addEventListener('input',  actualizarPreview);
  document.addEventListener('change', actualizarPreview);
});

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR / RENDERIZAR TARJETAS DE EXPERIENCIA
// ─────────────────────────────────────────────────────────────────────────────

/** Agrega una tarjeta de experiencia vacía al contenedor (desde el botón "+ Agregar"). */
function addExperiencia() {
  const idx  = contExp++;
  const cont = document.getElementById('exp-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLExp(idx, null); // null → tarjeta vacía
  cont.appendChild(div);
  inicializarRadiosEnCard(div);
  renumerarExp();
}

/**
 * Agrega una tarjeta de experiencia pre-rellenada con datos guardados.
 *
 * @param {Object} obj - Objeto de experiencia con todos sus campos.
 */
function agregarExpDesdeObjeto(obj) {
  const idx  = contExp++;
  const cont = document.getElementById('exp-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLExp(idx, obj);
  cont.appendChild(div);
  inicializarRadiosEnCard(div);
  renumerarExp();
}

/**
 * Genera el HTML interno de una tarjeta de experiencia laboral.
 *
 * @param {number}      idx - Índice único para nombres de campos.
 * @param {Object|null} obj - Datos guardados para precargar, o null para tarjeta vacía.
 * @returns {string} HTML de la tarjeta.
 */
function crearHTMLExp(idx, obj) {
  // Generar <option> para el selector de departamento
  const opcsDepto = departamentosExp.map(d =>
    `<option ${obj && obj.depto === d ? 'selected' : ''}>${d}</option>`
  ).join('');

  return `
  <div class="subcard-header">
    <div class="subcard-title">Experiencia</div>
    <button class="btn btn-danger"
      onclick="this.closest('.subcard').remove(); renumerarExp(); actualizarPreview()">
      Eliminar
    </button>
  </div>
  <div class="form-grid">
    <div class="field span2">
      <label>Empresa o entidad <span class="req">*</span></label>
      <input type="text" class="exp-empresa" placeholder="Nombre de la empresa"
             value="${obj ? obj.empresa : ''}">
      <span class="err">Campo obligatorio</span>
    </div>

    <div class="field">
      <label>Tipo <span class="req">*</span></label>
      <div class="radio-group exp-tipo">
        <label class="radio-opt ${obj && obj.tipo === 'Pública'  ? 'selected' : ''}"><input type="radio"> Pública</label>
        <label class="radio-opt ${obj && obj.tipo === 'Privada'  ? 'selected' : ''}"><input type="radio"> Privada</label>
        <label class="radio-opt ${obj && obj.tipo === 'Mixta'    ? 'selected' : ''}"><input type="radio"> Mixta</label>
      </div>
    </div>

    <div class="field">
      <label>Departamento</label>
      <select class="exp-depto">
        <option value="">Seleccione...</option>${opcsDepto}
      </select>
    </div>

    <div class="field">
      <label>Municipio</label>
      <input type="text" class="exp-municipio" placeholder="Ciudad"
             value="${obj ? obj.municipio : ''}">
    </div>

    <div class="field span2">
      <label>Cargo o contrato <span class="req">*</span></label>
      <input type="text" class="exp-cargo" placeholder="Ej: Desarrollador Web"
             value="${obj ? obj.cargo : ''}">
      <span class="err">Campo obligatorio</span>
    </div>

    <div class="field">
      <label>Dependencia / Área</label>
      <input type="text" class="exp-dependencia" placeholder="Área o departamento"
             value="${obj ? obj.dependencia : ''}">
    </div>

    <div class="field">
      <label>Correo entidad</label>
      <input type="email" class="exp-correo" placeholder="contacto@empresa.com"
             value="${obj ? obj.correoEntidad : ''}">
    </div>

    <div class="field">
      <label>Teléfono</label>
      <input type="tel" class="exp-tel" placeholder="Ej: 606 000 0000"
             value="${obj ? obj.telefono : ''}">
    </div>

    <div class="field">
      <label>Dirección</label>
      <input type="text" class="exp-dir" placeholder="Dirección de la entidad"
             value="${obj ? obj.direccion : ''}">
    </div>

    <div class="field">
      <label>Fecha de ingreso <span class="req">*</span></label>
      <input type="date" class="exp-ingreso" value="${obj ? obj.fechaIngreso : ''}">
      <span class="err">Campo obligatorio</span>
    </div>

    <div class="field">
      <label>Fecha de retiro</label>
      <input type="date" class="exp-retiro" value="${obj ? obj.fechaRetiro : ''}">
      <span class="hint">Dejar vacío si es el empleo actual</span>
    </div>
  </div>`;
}

/**
 * Inicializa los botones radio personalizados (.radio-opt) dentro de una tarjeta.
 * Garantiza comportamiento de selección exclusiva dentro del mismo grupo.
 *
 * @param {HTMLElement} card - Tarjeta .subcard recién insertada en el DOM.
 */
function inicializarRadiosEnCard(card) {
  card.querySelectorAll('.radio-group').forEach(group => {
    group.querySelectorAll('.radio-opt').forEach(opt => {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        actualizarPreview();
      });
    });
  });
}

/**
 * Renumera los títulos de las tarjetas de experiencia:
 *  - La primera siempre es "Empleo actual / más reciente".
 *  - Las siguientes son "Empleo anterior 1", "Empleo anterior 2", etc.
 */
function renumerarExp() {
  document.querySelectorAll('#exp-container .subcard').forEach((sc, i) => {
    const t = sc.querySelector('.subcard-title');
    if (t) t.textContent = i === 0 ? 'Empleo actual / más reciente' : 'Empleo anterior ' + i;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA DE DATOS DEL DOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recorre todas las tarjetas de experiencia y retorna un arreglo de objetos.
 *
 * @returns {Array<{empresa, tipo, depto, municipio, cargo, dependencia, correoEntidad, telefono, direccion, fechaIngreso, fechaRetiro}>}
 */
function leerExperiencias() {
  const res = [];
  document.querySelectorAll('#exp-container .subcard').forEach(sc => {
    const tipoSel = sc.querySelector('.exp-tipo .radio-opt.selected');
    res.push({
      empresa:       sc.querySelector('.exp-empresa')?.value.trim()     || '',
      tipo:          tipoSel ? tipoSel.textContent.trim()               : '',
      depto:         sc.querySelector('.exp-depto')?.value              || '',
      municipio:     sc.querySelector('.exp-municipio')?.value.trim()   || '',
      cargo:         sc.querySelector('.exp-cargo')?.value.trim()       || '',
      dependencia:   sc.querySelector('.exp-dependencia')?.value.trim() || '',
      correoEntidad: sc.querySelector('.exp-correo')?.value.trim()      || '',
      telefono:      sc.querySelector('.exp-tel')?.value.trim()         || '',
      direccion:     sc.querySelector('.exp-dir')?.value.trim()         || '',
      fechaIngreso:  sc.querySelector('.exp-ingreso')?.value            || '',
      fechaRetiro:   sc.querySelector('.exp-retiro')?.value             || '',
    });
  });
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el panel de vista previa mostrando los dos primeros empleos.
 * El primero en #prev-exp1, el segundo (si existe) en #prev-exp2.
 */
function actualizarPreview() {
  const exps = leerExperiencias();
  const el1  = document.getElementById('prev-exp1');
  const el2  = document.getElementById('prev-exp2');

  if (el1) {
    el1.textContent = exps[0]
      ? (exps[0].cargo   || '—') + ' — ' +
        (exps[0].empresa || '—') +
        (exps[0].tipo    ? ' (' + exps[0].tipo + ')' : '')
      : '—';
  }

  if (el2) {
    el2.textContent = exps[1]
      ? (exps[1].cargo   || '—') + ' — ' + (exps[1].empresa || '—')
      : exps.length > 1 ? '—' : 'Sin registro adicional';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida los campos obligatorios de cada tarjeta, guarda las experiencias
 * en localStorage y navega a `tiempo-experiencia.html`.
 *
 * Campos obligatorios por tarjeta:
 *  - Empresa (no vacío)
 *  - Cargo (no vacío)
 *  - Fecha de ingreso (no vacía)
 */
function guardarYContinuar() {
  let valido = true;

  // Limpiar errores previos
  document.querySelectorAll('.field.has-error').forEach(f => {
    f.classList.remove('has-error');
    const e = f.querySelector('.err');
    if (e) e.style.display = 'none';
  });

  // Validar cada tarjeta de experiencia
  document.querySelectorAll('#exp-container .subcard').forEach(sc => {
    const empresa = sc.querySelector('.exp-empresa');
    const cargo   = sc.querySelector('.exp-cargo');
    const ingreso = sc.querySelector('.exp-ingreso');
    if (empresa && !empresa.value.trim()) { mostrarErr(empresa, 'Campo obligatorio'); valido = false; }
    if (cargo   && !cargo.value.trim())   { mostrarErr(cargo,   'Campo obligatorio'); valido = false; }
    if (ingreso && !ingreso.value)        { mostrarErr(ingreso, 'Seleccione fecha');  valido = false; }
  });

  if (!valido) {
    document.querySelector('.field.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  experiencias = leerExperiencias();
  localStorage.setItem('hv_experiencia', JSON.stringify(experiencias));

  // Actualizar estado global de la HV
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado       = hv.estado || 'diligenciada';
  hv.experiencias = experiencias.length;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'tiempo-experiencia.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Muestra un mensaje de error junto a un campo del formulario.
 *
 * @param {HTMLElement} el  - Input/select que falló la validación.
 * @param {string}      msg - Mensaje de error.
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
