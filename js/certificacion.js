/**
 * @file certificacion.js
 * @description Lógica de la página de Certificación / Resumen (paso 5 y final de la HV).
 *
 * Responsabilidades:
 *  - Leer todos los datos almacenados en localStorage y mostrarlos como resumen.
 *  - Mostrar el estado actual de la HV (diligenciada / aceptada / rechazada).
 *  - Gestionar el envío formal de la hoja de vida (requiere aceptar declaración jurada).
 *  - Registrar la HV en el arreglo centralizado `admin_hojas_de_vida` que consume admin.js.
 *
 * Claves localStorage utilizadas (lectura):
 *  - `hv_usuario`             → sesión activa
 *  - `hv_estado`              → estado global y fechas de la HV
 *  - `hv_datos_personales`    → datos del paso 1
 *  - `hv_formacion_estudios`  → estudios superiores del paso 2
 *  - `hv_formacion_basica`    → educación básica del paso 2
 *  - `hv_formacion_idiomas`   → idiomas del paso 2
 *  - `hv_experiencia`         → experiencias laborales del paso 3
 *  - `hv_tiempo_total`        → tiempo total calculado en el paso 4
 *
 * Claves localStorage utilizadas (escritura):
 *  - `hv_estado`              → se actualiza al enviar (estado + fechaEnvio)
 *  - `admin_hojas_de_vida`    → se agrega/actualiza la entrada de esta HV
 */

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Mostrar correo del usuario en el encabezado
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  cargarResumen();
});

// ─────────────────────────────────────────────────────────────────────────────
// CARGAR RESUMEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lee todos los datos del localStorage y los muestra en la página de resumen.
 *
 * Secciones actualizadas:
 *  - Nombre completo y documento   → #res-nombre, #res-doc
 *  - Formación (estudios)          → #res-formacion
 *  - Experiencia laboral y total   → #res-experiencia
 *  - Estado actual de la HV        → #res-estado, #res-estado-info
 *  - Fechas de creación, envío y revisión
 */
function cargarResumen() {
  const hv       = JSON.parse(localStorage.getItem('hv_estado')            || '{}');
  const datos    = JSON.parse(localStorage.getItem('hv_datos_personales')  || '{}');
  const estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios')|| '[]');
  const exps     = JSON.parse(localStorage.getItem('hv_experiencia')       || '[]');
  const total    = JSON.parse(localStorage.getItem('hv_tiempo_total')      || '{}');

  // ── Nombre y documento ──
  const nombre = [datos.nombres, datos.primerApellido, datos.segundoApellido]
    .filter(Boolean).join(' ');
  setText('res-nombre', nombre || '—');
  setText('res-doc',
    datos.tipoDoc && datos.numeroDoc
      ? datos.tipoDoc + ' ' + datos.numeroDoc
      : '—');

  // ── Formación: texto compacto "modalidad — título | ..." ──
  const formTxt = estudios.length > 0
    ? estudios.map(e =>
        (e.modalidad || '') + (e.titulo ? ' — ' + e.titulo : '')
      ).join(' | ')
    : '—';
  setText('res-formacion', formTxt);

  // ── Experiencia: número de registros + tiempo total ──
  setText('res-experiencia',
    exps.length + ' registro(s) · Total: ' + (total.texto || '—'));

  // ── Estado actual (tag coloreado) ──
  const estadoEl = document.getElementById('res-estado');
  if (estadoEl) {
    const est = hv.estado || 'diligenciada';
    estadoEl.textContent = est.charAt(0).toUpperCase() + est.slice(1);
    estadoEl.className   = 'tag ' + est;
  }

  // ── Fecha de creación ──
  const fechaCreEl = document.getElementById('res-fecha-creacion');
  if (fechaCreEl && hv.fechaCreacion) {
    fechaCreEl.textContent = new Date(hv.fechaCreacion).toLocaleDateString('es-CO');
  }

  // ── Estado info (duplicado para otra sección de la UI) ──
  const estadoInfoEl = document.getElementById('res-estado-info');
  if (estadoInfoEl) {
    const est = hv.estado || 'diligenciada';
    estadoInfoEl.textContent = est.charAt(0).toUpperCase() + est.slice(1);
    estadoInfoEl.className   = 'tag ' + est;
  }

  // ── Última revisión del admin ──
  const revEl = document.getElementById('res-ultima-revision');
  if (revEl) {
    revEl.textContent = hv.fechaRevision
      ? new Date(hv.fechaRevision).toLocaleDateString('es-CO')
      : 'Pendiente';
  }

  // ── Fecha de envío ──
  const envioEl = document.getElementById('res-fecha-envio');
  if (envioEl) {
    envioEl.textContent = hv.fechaEnvio
      ? new Date(hv.fechaEnvio).toLocaleDateString('es-CO')
      : '— / — / —';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVÍO DE LA HOJA DE VIDA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envía formalmente la hoja de vida.
 *
 * Requisito: el checkbox #acepto (declaración jurada) debe estar marcado.
 *
 * Acciones al enviar:
 *  1. Actualiza `hv_estado` con estado "diligenciada" y fecha de envío.
 *  2. Llama a `registrarHVEnAdmin()` para agregar/actualizar la HV en el panel admin.
 *  3. Recarga el resumen en pantalla para reflejar los cambios.
 */
function enviar() {
  const acepto = document.getElementById('acepto');
  if (!acepto || !acepto.checked) {
    alert('Debe aceptar la declaración juramentada antes de enviar.');
    return;
  }

  // Actualizar estado y registrar fecha de envío
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado     = 'diligenciada';
  hv.fechaEnvio = new Date().toISOString();
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  // Registrar en el panel del administrador
  registrarHVEnAdmin(hv);

  alert('✅ Hoja de vida enviada correctamente. Estado: Diligenciada');
  cargarResumen(); // Actualizar la UI para mostrar la fecha de envío
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO EN EL PANEL DE ADMINISTRACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agrega o actualiza esta HV en el arreglo `admin_hojas_de_vida` del localStorage.
 *
 * El arreglo es compartido: si ya existe una entrada con el mismo documento,
 * se reemplaza (permite reenvíos); si no existe, se agrega al final.
 *
 * La entrada guarda un snapshot completo de todos los datos (`datosCompletos`)
 * para que el panel del admin no dependa de las claves individuales del usuario.
 *
 * @param {Object} hv - Objeto de estado global de la HV (de `hv_estado`).
 */
function registrarHVEnAdmin(hv) {
  // Leer todos los datos necesarios para construir la entrada del admin
  const datos    = JSON.parse(localStorage.getItem('hv_datos_personales')  || '{}');
  const estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios')|| '[]');
  const exps     = JSON.parse(localStorage.getItem('hv_experiencia')       || '[]');
  const total    = JSON.parse(localStorage.getItem('hv_tiempo_total')      || '{}');

  let hojas = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');

  const nombre = [datos.nombres, datos.primerApellido, datos.segundoApellido]
    .filter(Boolean).join(' ');
  const docId  = datos.tipoDoc + ' ' + datos.numeroDoc;

  // Buscar si ya existe una entrada para este documento
  const idx = hojas.findIndex(h => h.documento === docId);

  /**
   * Estructura de la entrada en el panel del admin.
   * `datosCompletos` es un snapshot completo para lectura offline en admin.js.
   */
  const entrada = {
    id:           docId || Date.now().toString(), // Usar documento como ID único
    nombre:       nombre || 'Sin nombre',
    documento:    docId  || '—',
    correo:       datos.correo || '—',
    estado:       hv.estado || 'diligenciada',
    fechaEnvio:   hv.fechaEnvio || new Date().toISOString(),
    formacion:    estudios.length,    // Número de estudios (para estadísticas rápidas)
    experiencias: exps.length,        // Número de empleos
    tiempoTotal:  total.texto || '—',
    datosCompletos: {
      datosPersonales: datos,
      formacionBasica: JSON.parse(localStorage.getItem('hv_formacion_basica') || '{}'),
      estudios,
      idiomas:         JSON.parse(localStorage.getItem('hv_formacion_idiomas') || '[]'),
      exps,
      tiempoTotal:     total,
    }
  };

  // Actualizar si ya existe, insertar si es nueva
  if (idx >= 0) hojas[idx] = entrada;
  else          hojas.push(entrada);

  localStorage.setItem('admin_hojas_de_vida', JSON.stringify(hojas));
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escribe `val` en el textContent del elemento con el id dado.
 *
 * @param {string} id  - ID del elemento en el DOM.
 * @param {string} val - Texto a mostrar.
 */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
