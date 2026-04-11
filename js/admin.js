// ── admin.js — Panel de administración ──
// Todos los datos provienen exclusivamente de localStorage (admin_hojas_de_vida)
// Cada entrada fue registrada por certificacion.js al momento de enviar la HV.

let filtroActual   = 'todas';
let hvSeleccionada = null;
let listaHVs       = [];

// ─────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión de admin
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

// ─────────────────────────────────────────
// LEER / GUARDAR DATOS DEL LOCALSTORAGE
// ─────────────────────────────────────────
function cargarHVsDesdeStorage() {
    listaHVs = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');
}

function guardarHVsEnStorage() {
    localStorage.setItem('admin_hojas_de_vida', JSON.stringify(listaHVs));
}

// ─────────────────────────────────────────
// SIDEBAR — FILTROS CON CONTEOS REALES
// ─────────────────────────────────────────
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
        const count = f.id === 'todas'
            ? listaHVs.length
            : listaHVs.filter(h => h.estado === f.id).length;

        const div = document.createElement('div');
        div.className = 'sidebar-item' + (filtroActual === f.id ? ' active' : '');
        div.textContent = `${f.label} (${count})`;
        div.onclick = () => {
            filtroActual = f.id;
            renderSidebar();
            renderTabla();
            const panel = document.getElementById('panel-detalle');
            if (panel) panel.style.display = 'none';
            hvSeleccionada = null;
        };
        cont.appendChild(div);
    });
}

// ─────────────────────────────────────────
// TABLA PRINCIPAL
// ─────────────────────────────────────────
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
      <td><strong>${hv.nombre || '—'}</strong></td>
      <td>${hv.documento || '—'}</td>
      <td>${hv.correo || '—'}</td>
      <td>${formatFecha(hv.fechaEnvio)}</td>
      <td><span class="tag ${hv.estado}">${cap(hv.estado)}</span></td>
      <td>
        <button class="btn btn-secondary" style="font-size:12px;padding:5px 12px;"
          onclick="abrirDetalle('${hv.id}')">Ver / Editar</button>
      </td>`;
        tbody.appendChild(tr);
    });
}

// ─────────────────────────────────────────
// PANEL DETALLE — datos reales del usuario
// ─────────────────────────────────────────
function abrirDetalle(id) {
    hvSeleccionada = listaHVs.find(h => h.id === id);
    if (!hvSeleccionada) return;

    const panel = document.getElementById('panel-detalle');
    if (!panel) return;
    panel.style.display = 'block';

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

    // ── Formación ──
    const estudios = dc.estudios        || [];
    const idiomas  = dc.idiomas         || [];
    const basica   = dc.formacionBasica || {};

    const formacionTxt = estudios.length > 0
        ? estudios.map(e => {
            const partes = [e.modalidad, e.titulo].filter(Boolean).join(' — ');
            const extra  = [
                e.graduado ? `Graduado: ${e.graduado}` : '',
                e.fecha    ? `Fin: ${e.fecha}` : ''
            ].filter(Boolean).join(' | ');
            return partes + (extra ? ` (${extra})` : '');
        }).join('<br>')
        : '—';

    const idiomasTxt = idiomas.length > 0
        ? idiomas.map(i =>
            `${i.nombre}: Habla ${i.habla||'—'} / Lee ${i.lee||'—'} / Escribe ${i.escribe||'—'}`
        ).join('<br>')
        : '—';

    // ── Experiencia ──
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

    // ── Inyectar contenido en el form-grid ──
    const contenido = panel.querySelector('.form-grid');
    if (contenido) {
        contenido.innerHTML = `
      <div class="preview-row"><span class="k">Nombre:</span><span class="v">${nombreCompleto}</span></div>
      <div class="preview-row"><span class="k">Documento:</span><span class="v">${documento}</span></div>
      <div class="preview-row"><span class="k">Correo:</span><span class="v">${correo}</span></div>
      <div class="preview-row"><span class="k">Teléfono:</span><span class="v">${telefono}</span></div>
      <div class="preview-row"><span class="k">Fecha nacimiento:</span><span class="v">${fechaNac}</span></div>
      <div class="preview-row"><span class="k">Lugar nacimiento:</span><span class="v">${lugarNac}</span></div>
      <div class="preview-row"><span class="k">Dirección:</span><span class="v">${direccion}</span></div>
      <div class="preview-row"><span class="k">Sexo:</span><span class="v">${sexo}</span></div>
      <div class="preview-row"><span class="k">Nacionalidad:</span><span class="v">${nac}</span></div>
      <div class="preview-row"><span class="k">Libreta militar:</span><span class="v">${libreta}</span></div>

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

      <div class="preview-row" style="grid-column:span 2;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
        <span class="k" style="min-width:160px;">Experiencia laboral:</span>
        <span class="v">${expTxt}</span>
      </div>
      <div class="preview-row" style="grid-column:span 2;">
        <span class="k">Tiempo total:</span>
        <span class="v" style="color:var(--c2);font-weight:700;">${tiempoTotal}</span>
      </div>

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

    // Selector de estado
    const sel = document.getElementById('nuevo-estado');
    if (sel) sel.value = hvSeleccionada.estado;

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────
// CAMBIAR ESTADO
// ─────────────────────────────────────────
function cambiarEstado() {
    if (!hvSeleccionada) return;
    const nuevoEstado = document.getElementById('nuevo-estado')?.value;
    if (!nuevoEstado) return;

    hvSeleccionada.estado        = nuevoEstado;
    hvSeleccionada.fechaRevision = new Date().toISOString();

    const idx = listaHVs.findIndex(h => h.id === hvSeleccionada.id);
    if (idx >= 0) {
        listaHVs[idx].estado        = nuevoEstado;
        listaHVs[idx].fechaRevision = hvSeleccionada.fechaRevision;
    }
    guardarHVsEnStorage();

    // Si corresponde al usuario actualmente logueado, actualizar hv_estado
    const hvEstado = JSON.parse(localStorage.getItem('hv_estado') || '{}');
    if (hvEstado.documento === hvSeleccionada.documento) {
        hvEstado.estado        = nuevoEstado;
        hvEstado.fechaRevision = hvSeleccionada.fechaRevision;
        localStorage.setItem('hv_estado', JSON.stringify(hvEstado));
    }

    // Refrescar badge de estado en el panel
    const estadoEl = document.getElementById('det-estado');
    if (estadoEl) {
        estadoEl.textContent = cap(nuevoEstado);
        estadoEl.className   = 'tag ' + nuevoEstado;
    }

    renderSidebar();
    renderTabla();
    alert(`Estado actualizado a: ${cap(nuevoEstado)}`);
}

// ─────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────
function salir() {
    localStorage.removeItem('hv_usuario');
    window.location.href = '../index.html';
}

// ─────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────
function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function formatFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}