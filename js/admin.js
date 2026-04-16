/**
 * @file admin.js
 * @description Panel de administración de hojas de vida.
 *
 * Responsabilidades:
 *  - Verificar que el usuario logueado tiene rol 'admin'; si no, redirige al login.
 *  - Leer el arreglo `admin_hojas_de_vida` del localStorage (escrito por certificacion.js).
 *  - Renderizar la tabla de HVs con soporte de filtros por estado.
 *  - Mostrar el sidebar con conteos reales por estado.
 *  - Abrir un panel de detalle con todos los datos de una HV al hacer clic en "Ver / Editar".
 *  - Permitir cambiar el estado de una HV (diligenciada → aceptada / rechazada / etc.)
 *    y sincronizar el cambio tanto en `admin_hojas_de_vida` como en `hv_estado`.
 *
 * Claves localStorage utilizadas:
 *  - `hv_usuario`           → sesión activa (lectura + verificación de rol)
 *  - `admin_hojas_de_vida`  → arreglo maestro de HVs (lectura/escritura)
 *  - `hv_estado`            → estado de la HV del usuario logueado (escritura al cambiar estado)
 */

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO DEL MÓDULO
// ─────────────────────────────────────────────────────────────────────────────

/** @type {'todas'|'diligenciada'|'aceptada'|'rechazada'} Filtro activo en el sidebar */
let filtroActual   = 'todas';

/** @type {Object|null} HV actualmente abierta en el panel de detalle */
let hvSeleccionada = null;

/** @type {Array<Object>} Copia en memoria del arreglo del localStorage */
let listaHVs       = [];

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Verificar que hay una sesión de admin activa; si no, redirigir al login
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  if (!u.correo || u.rol !== 'admin') {
    window.location.href = '../index.html';
    return;
  }

  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo;

  cargarHVsDesdeStorage();
  renderSidebar();
  renderTabla();
});

// ─────────────────────────────────────────────────────────────────────────────
// LEER / GUARDAR DATOS DEL LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────

/** Carga el arreglo de HVs desde localStorage a `listaHVs`. */
function cargarHVsDesdeStorage() {
  listaHVs = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');
}

/** Persiste `listaHVs` en localStorage (se llama después de cualquier modificación). */
function guardarHVsEnStorage() {
  localStorage.setItem('admin_hojas_de_vida', JSON.stringify(listaHVs));
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — FILTROS CON CONTEOS REALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renderiza el sidebar de filtros con el conteo real de HVs por estado.
 *
 * Al hacer clic en un filtro:
 *  - Se actualiza `filtroActual`.
 *  - Se re-renderiza el sidebar (para actualizar el ítem activo).
 *  - Se re-renderiza la tabla.
 *  - Se cierra el panel de detalle si estaba abierto.
 */
function renderSidebar() {
  const filtros = [
    { id: 'todas',        label: 'Todas las HV' },
    { id: 'diligenciada', label: 'Diligenciadas' },
    { id: 'aceptada',     label: 'Aceptadas' },
    { id: 'rechazada',    label: 'Rechazadas' },
  ];

  const cont = document.getElementById('sidebar-filtros');
  if (!cont) return;
  cont.innerHTML = '';

  filtros.forEach(f => {
    // Contar las HVs que coinciden con este filtro
    const count = f.id === 'todas'
      ? listaHVs.length
      : listaHVs.filter(h => h.estado === f.id).length;

    const div = document.createElement('div');
    div.className  = 'sidebar-item' + (filtroActual === f.id ? ' active' : '');
    div.textContent = `${f.label} (${count})`;
    div.onclick = () => {
      filtroActual  = f.id;
      renderSidebar();
      renderTabla();
      // Cerrar el panel de detalle al cambiar de filtro
      const panel = document.getElementById('panel-detalle');
      if (panel) panel.style.display = 'none';
      hvSeleccionada = null;
    };
    cont.appendChild(div);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renderiza la tabla de hojas de vida según el filtro activo.
 *
 * Si no hay HVs en absoluto, muestra "Aún no se han recibido hojas de vida."
 * Si hay HVs pero ninguna coincide con el filtro, muestra mensaje alternativo.
 * Cada fila incluye un botón "Ver / Editar" que llama a `abrirDetalle(id)`.
 */
function renderTabla() {
  const lista = filtroActual === 'todas'
    ? listaHVs
    : listaHVs.filter(h => h.estado === filtroActual);

  const tbody = document.getElementById('tabla-hvs');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">
          ${listaHVs.length === 0
            ? 'Aún no se han recibido hojas de vida.'
            : 'No hay hojas de vida con este estado.'}
        </td>
      </tr>`;
    return;
  }

  lista.forEach(hv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${hv.nombre    || '—'}</strong></td>
      <td>${hv.documento || '—'}</td>
      <td>${hv.correo    || '—'}</td>
      <td>${formatFecha(hv.fechaEnvio)}</td>
      <td><span class="tag ${hv.estado}">${cap(hv.estado)}</span></td>
      <td>
        <button class="btn btn-secondary" style="font-size:12px;padding:5px 12px;"
          onclick="abrirDetalle('${hv.id}')">Ver / Editar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL DETALLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abre el panel de detalle con todos los datos de la HV identificada por `id`.
 *
 * Extrae y formatea la información desde `hv.datosCompletos` (snapshot guardado
 * al momento del envío) y la inyecta en el DOM del panel.
 *
 * Secciones mostradas:
 *  - Datos personales (nombre, documento, contacto, nacimiento, libreta militar)
 *  - Formación (básica, estudios superiores, idiomas)
 *  - Experiencia laboral (lista de empleos + tiempo total)
 *  - Estado actual con selector para cambiar
 *
 * @param {string} id - ID único de la HV (igual al campo `documento` del titular).
 */
function abrirDetalle(id) {
  hvSeleccionada = listaHVs.find(h => h.id === id);
  if (!hvSeleccionada) return;

  const panel = document.getElementById('panel-detalle');
  if (!panel) return;
  panel.style.display = 'block';

  // Destructurar datos completos del snapshot
  const dc = hvSeleccionada.datosCompletos || {};
  const dp = dc.datosPersonales || {};

  // ── Datos personales ──
  const nombreCompleto = [dp.nombres, dp.primerApellido, dp.segundoApellido]
    .filter(Boolean).join(' ') || hvSeleccionada.nombre || '—';
  const documento = dp.tipoDoc && dp.numeroDoc
    ? `${dp.tipoDoc} ${dp.numeroDoc}`
    : hvSeleccionada.documento || '—';
  const correo    = dp.correo    || hvSeleccionada.correo || '—';
  const telefono  = dp.telefono  || '—';
  const fechaNac  = dp.fechaNac  ? formatFecha(dp.fechaNac) : '—';
  const lugarNac  = [dp.muniNac, dp.deptoNac].filter(Boolean).join(', ') || '—';
  const direccion = dp.direccion || '—';
  const sexo      = dp.sexo      || '—';
  const nac       = dp.nacionalidad || '—';
  const libreta   = dp.claseLibreta
    ? `${dp.claseLibreta}${dp.numeroLibreta ? ' — N°' + dp.numeroLibreta : ''}`
    : '—';

  // ── Formación superior: texto con una línea por estudio ──
  const estudios = dc.estudios        || [];
  const idiomas  = dc.idiomas         || [];
  const basica   = dc.formacionBasica || {};

  const formacionTxt = estudios.length > 0
    ? estudios.map(e => {
        const partes = [e.modalidad, e.titulo].filter(Boolean).join(' — ');
        const extra  = [
          e.graduado ? `Graduado: ${e.graduado}` : '',
          e.fecha    ? `Fin: ${e.fecha}`          : ''
        ].filter(Boolean).join(' | ');
        return partes + (extra ? ` (${extra})` : '');
      }).join('<br>')
    : '—';

  // ── Idiomas: nivel en los tres aspectos ──
  const idiomasTxt = idiomas.length > 0
    ? idiomas.map(i =>
        `${i.nombre}: Habla ${i.habla||'—'} / Lee ${i.lee||'—'} / Escribe ${i.escribe||'—'}`
      ).join('<br>')
    : '—';

  // ── Experiencia laboral: una línea por empleo ──
  const exps = dc.exps || [];
  const expTxt = exps.length > 0
    ? exps.map(e => {
        const fechas = [e.fechaIngreso, e.fechaRetiro || 'actual'].filter(Boolean).join(' → ');
        return `${e.cargo || '—'} en ${e.empresa || '—'} (${e.tipo || '—'}) · ${fechas}`;
      }).join('<br>')
    : '—';

  // ── Tiempo total ──
  const tiempoTotal = (dc.tiempoTotal && dc.tiempoTotal.texto)
    || hvSeleccionada.tiempoTotal || '—';

  // ── Actualizar título del panel ──
  const titulo = panel.querySelector('.card-title');
  if (titulo) titulo.innerHTML = `<span class="dot"></span> Detalle — ${nombreCompleto}`;

  // ── Inyectar contenido en el grid de datos ──
  const contenido = panel.querySelector('.form-grid');
  if (contenido) {
    contenido.innerHTML = `
      <!-- DATOS PERSONALES -->
      <div class="preview-row"><span class="k">Nombre:</span>         <span class="v">${nombreCompleto}</span></div>
      <div class="preview-row"><span class="k">Documento:</span>      <span class="v">${documento}</span></div>
      <div class="preview-row"><span class="k">Correo:</span>         <span class="v">${correo}</span></div>
      <div class="preview-row"><span class="k">Teléfono:</span>       <span class="v">${telefono}</span></div>
      <div class="preview-row"><span class="k">Fecha nacimiento:</span><span class="v">${fechaNac}</span></div>
      <div class="preview-row"><span class="k">Lugar nacimiento:</span><span class="v">${lugarNac}</span></div>
      <div class="preview-row"><span class="k">Dirección:</span>      <span class="v">${direccion}</span></div>
      <div class="preview-row"><span class="k">Sexo:</span>           <span class="v">${sexo}</span></div>
      <div class="preview-row"><span class="k">Nacionalidad:</span>   <span class="v">${nac}</span></div>
      <div class="preview-row"><span class="k">Libreta militar:</span><span class="v">${libreta}</span></div>

      <!-- FORMACIÓN -->
      <div class="preview-row" style="grid-column:span 2;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
        <span class="k">Grado básica:</span>
        <span class="v">${basica.grado || '—'}${basica.titulo ? ' — ' + basica.titulo : ''}</span>
      </div>
      <div class="preview-row" style="grid-column:span 2;">
        <span class="k" style="min-width:160px;">Educación superior:</span>
        <span class="v">${formacionTxt}</span>
      </div>
      <div class="preview-row" style="grid-column:span 2;">
        <span class="k" style="min-width:160px;">Idiomas:</span>
        <span class="v">${idiomasTxt}</span>
      </div>

      <!-- EXPERIENCIA -->
      <div class="preview-row" style="grid-column:span 2;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
        <span class="k" style="min-width:160px;">Experiencia laboral:</span>
        <span class="v">${expTxt}</span>
      </div>
      <div class="preview-row" style="grid-column:span 2;">
        <span class="k">Tiempo total:</span>
        <span class="v" style="color:var(--c2);font-weight:700;">${tiempoTotal}</span>
      </div>

      <!-- ESTADO -->
      <div class="preview-row" style="grid-column:span 2;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
        <span class="k">Fecha envío:</span>
        <span class="v">${formatFecha(hvSeleccionada.fechaEnvio)}</span>
      </div>
      <div class="preview-row" style="grid-column:span 2;">
        <span class="k">Estado actual:</span>
        <span class="tag ${hvSeleccionada.estado}" id="det-estado">${cap(hvSeleccionada.estado)}</span>
      </div>
    `;
  }

  // Pre-seleccionar el estado actual en el selector de cambio de estado
  const sel = document.getElementById('nuevo-estado');
  if (sel) sel.value = hvSeleccionada.estado;

  // Desplazar la vista hasta el panel de detalle
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMBIAR ESTADO DE UNA HV
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica el nuevo estado seleccionado en el `<select id="nuevo-estado">` a la HV abierta.
 *
 * Acciones:
 *  1. Actualiza `hvSeleccionada` en memoria con el nuevo estado y fecha de revisión.
 *  2. Sincroniza el cambio en `listaHVs` y persiste en `admin_hojas_de_vida`.
 *  3. Si la HV corresponde al usuario actualmente logueado, actualiza también `hv_estado`.
 *  4. Refresca el badge de estado en el panel de detalle.
 *  5. Re-renderiza sidebar y tabla para reflejar conteos actualizados.
 */
function cambiarEstado() {
  if (!hvSeleccionada) return;
  const nuevoEstado = document.getElementById('nuevo-estado')?.value;
  if (!nuevoEstado) return;

  // Actualizar la referencia en memoria
  hvSeleccionada.estado        = nuevoEstado;
  hvSeleccionada.fechaRevision = new Date().toISOString();

  // Sincronizar con el arreglo maestro
  const idx = listaHVs.findIndex(h => h.id === hvSeleccionada.id);
  if (idx >= 0) {
    listaHVs[idx].estado        = nuevoEstado;
    listaHVs[idx].fechaRevision = hvSeleccionada.fechaRevision;
  }
  guardarHVsEnStorage();

  // Propagación al usuario: si es la HV del usuario activo, actualizar su `hv_estado`
  const hvEstado = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  if (hvEstado.documento === hvSeleccionada.documento) {
    hvEstado.estado        = nuevoEstado;
    hvEstado.fechaRevision = hvSeleccionada.fechaRevision;
    localStorage.setItem('hv_estado', JSON.stringify(hvEstado));
  }

  // Refrescar el badge de estado en el panel de detalle sin cerrarlo
  const estadoEl = document.getElementById('det-estado');
  if (estadoEl) {
    estadoEl.textContent = cap(nuevoEstado);
    estadoEl.className   = 'tag ' + nuevoEstado;
  }

  renderSidebar();
  renderTabla();
  alert(`Estado actualizado a: ${cap(nuevoEstado)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cierra la sesión del admin eliminando `hv_usuario` y redirigiendo al login.
 */
function salir() {
  localStorage.removeItem('hv_usuario');
  window.location.href = '../index.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Capitaliza la primera letra de un string.
 *
 * @param {string} s - Texto a capitalizar.
 * @returns {string} Texto con la primera letra en mayúscula.
 */
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/**
 * Formatea una fecha ISO a formato legible en español colombiano.
 * Si la cadena no es una fecha válida, la retorna tal como está.
 *
 * @param {string} iso - Fecha en formato ISO 8601 (ej: "2024-03-15T10:00:00.000Z").
 * @returns {string} Fecha formateada (ej: "15 mar 2024") o '—' si está vacía.
 */
function formatFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso; // Retornar el valor original si no es una fecha válida
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}
