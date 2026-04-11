
let filtroActual = 'todas';
let hvSeleccionada = null;

window.addEventListener('DOMContentLoaded', () => {
    const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
    if (!u.correo || u.rol !== 'admin') {
        window.location.href = '../index.html';
        return;
    }
    const headerEl = document.getElementById('header-usuario');
    if (headerEl) headerEl.textContent = u.correo;

    // Combinar demo + las reales enviadas
    const reales = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');
    reales.forEach(r => {
        if (!hvsDemo.find(d => d.id === r.id)) hvsDemo.push(r);
        else {
            const idx = hvsDemo.findIndex(d => d.id === r.id);
            hvsDemo[idx] = r;
        }
    });

    renderTabla();
    renderSidebar();
});

function renderSidebar() {
    const items = [
        { id: 'todas',        label: 'Todas las HV' },
        { id: 'diligenciada', label: 'Diligenciadas' },
        { id: 'aceptada',     label: 'Aceptadas' },
        { id: 'rechazada',    label: 'Rechazadas' },
    ];
    const cont = document.getElementById('sidebar-filtros');
    if (!cont) return;
    cont.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'sidebar-item' + (filtroActual === item.id ? ' active' : '');
        div.textContent = item.label;
        div.onclick = () => { filtroActual = item.id; renderTabla(); renderSidebar(); };
        cont.appendChild(div);
    });
}

function renderTabla() {
    const lista = filtroActual === 'todas'
        ? hvsDemo
        : hvsDemo.filter(h => h.estado === filtroActual);

    const tbody = document.getElementById('tabla-hvs');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">No hay hojas de vida con este filtro.</td></tr>';
        return;
    }

    lista.forEach(hv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${hv.nombre}</td>
      <td>${hv.documento}</td>
      <td>${hv.correo || '—'}</td>
      <td>${formatFecha(hv.fechaEnvio)}</td>
      <td><span class="tag ${hv.estado}">${cap(hv.estado)}</span></td>
      <td><button class="btn btn-secondary" style="font-size:12px;padding:5px 12px;" onclick="cargarHV('${hv.id}')">Ver / Editar</button></td>`;
        tbody.appendChild(tr);
    });
}

function cargarHV(id) {
    hvSeleccionada = hvsDemo.find(h => h.id === id);
    if (!hvSeleccionada) return;

    const panel = document.getElementById('panel-detalle');
    if (panel) panel.style.display = 'block';

    setText('det-nombre',   hvSeleccionada.nombre);
    setText('det-doc',      hvSeleccionada.documento);
    setText('det-correo',   hvSeleccionada.correo || '—');
    setText('det-formacion',hvSeleccionada.formacion + ' estudio(s)');
    setText('det-exp',      hvSeleccionada.experiencias + ' experiencia(s) · ' + (hvSeleccionada.tiempoTotal || '—'));
    setText('det-fecha',    formatFecha(hvSeleccionada.fechaEnvio));

    const estadoEl = document.getElementById('det-estado');
    if (estadoEl) {
        estadoEl.textContent = cap(hvSeleccionada.estado);
        estadoEl.className   = 'tag ' + hvSeleccionada.estado;
    }

    const sel = document.getElementById('nuevo-estado');
    if (sel) sel.value = hvSeleccionada.estado;

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cambiarEstado() {
    if (!hvSeleccionada) return;
    const nuevoEstado = document.getElementById('nuevo-estado')?.value;
    if (!nuevoEstado) return;

    hvSeleccionada.estado        = nuevoEstado;
    hvSeleccionada.fechaRevision = new Date().toISOString();

    // Persistir cambio
    const reales = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');
    const idx = reales.findIndex(r => r.id === hvSeleccionada.id);
    if (idx >= 0) { reales[idx].estado = nuevoEstado; reales[idx].fechaRevision = hvSeleccionada.fechaRevision; }
    localStorage.setItem('admin_hojas_de_vida', JSON.stringify(reales));

    // Si la HV es del usuario logueado, actualizar también su estado
    const hvEstado = JSON.parse(localStorage.getItem('hv_estado') || '{}');
    const datosUsu = JSON.parse(localStorage.getItem('hv_datos_personales') || '{}');
    const docUsu   = datosUsu.tipoDoc + ' ' + datosUsu.numeroDoc;
    if (docUsu.trim() === hvSeleccionada.documento.trim()) {
        hvEstado.estado        = nuevoEstado;
        hvEstado.fechaRevision = hvSeleccionada.fechaRevision;
        localStorage.setItem('hv_estado', JSON.stringify(hvEstado));
    }

    const estadoEl = document.getElementById('det-estado');
    if (estadoEl) { estadoEl.textContent = cap(nuevoEstado); estadoEl.className = 'tag ' + nuevoEstado; }

    renderTabla();
    alert('Estado actualizado a: ' + cap(nuevoEstado));
}

function salir() {
    localStorage.removeItem('hv_usuario');
    window.location.href = '../index.html';
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function formatFecha(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric' });
}
