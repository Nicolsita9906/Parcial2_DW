// ── Arreglos predefinidos de tipos de ocupación ──
const tiposOcupacion = [
    { id: 'publico',      label: 'Servidor público' },
    { id: 'privado',      label: 'Empleado del sector privado' },
    { id: 'independiente',label: 'Trabajador independiente' },
    { id: 'docente',      label: 'Docente' },
    { id: 'otro',         label: 'Otro' },
];

// Arreglo en memoria con los registros de tiempo
let registrosTiempo = [];

window.addEventListener('DOMContentLoaded', () => {
    const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
    const headerEl = document.getElementById('header-usuario');
    if (headerEl) headerEl.textContent = u.correo || '';

    // Cargar datos guardados
    registrosTiempo = JSON.parse(localStorage.getItem('hv_tiempo_exp') || '[]');

    // Si hay registros guardados, poblar los inputs; si no, usar los precargados del HTML
    if (registrosTiempo.length > 0) {
        registrosTiempo.forEach(r => {
            setInputTiempo(r.id, r.anios, r.meses);
        });
    } else {
        // Leer los valores iniciales del DOM y construir el arreglo
        sincronizarRegistrosDesdeDOM();
    }

    calcTotal();
    actualizarPreview();
    document.addEventListener('input', () => { sincronizarRegistrosDesdeDOM(); calcTotal(); actualizarPreview(); });
});

function setInputTiempo(id, anios, meses) {
    const fila = document.querySelector(`.total-row[data-id="${id}"]`);
    if (!fila) return;
    const inputs = fila.querySelectorAll('input[type="number"]');
    if (inputs[0]) inputs[0].value = anios;
    if (inputs[1]) inputs[1].value = meses;
}

function sincronizarRegistrosDesdeDOM() {
    registrosTiempo = [];
    document.querySelectorAll('.total-row').forEach(fila => {
        const id     = fila.dataset.id || '';
        const label  = fila.querySelector('.occupation')?.textContent.trim() || '';
        const inputs = fila.querySelectorAll('input[type="number"]');
        const anios  = parseInt(inputs[0]?.value) || 0;
        const meses  = parseInt(inputs[1]?.value) || 0;
        registrosTiempo.push({ id, label, anios, meses });
    });
}

function calcTotal() {
    let totalMeses = 0;
    document.querySelectorAll('.total-row').forEach(fila => {
        const inputs = fila.querySelectorAll('input[type="number"]');
        const a = parseInt(inputs[0]?.value) || 0;
        const m = parseInt(inputs[1]?.value) || 0;
        totalMeses += a * 12 + m;
    });
    const anios = Math.floor(totalMeses / 12);
    const meses = totalMeses % 12;
    const texto = `${anios} año${anios !== 1 ? 's' : ''}, ${meses} mes${meses !== 1 ? 'es' : ''}`;
    const el = document.getElementById('total-exp');
    if (el) el.textContent = texto;
    return { anios, meses, texto };
}

function actualizarPreview() {
    const filas = document.querySelectorAll('.total-row');
    ['prev-publico','prev-privado','prev-indep'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el || !filas[i]) return;
        const inputs = filas[i].querySelectorAll('input[type="number"]');
        const a = parseInt(inputs[0]?.value) || 0;
        const m = parseInt(inputs[1]?.value) || 0;
        el.textContent = `${a} año${a !== 1 ? 's' : ''}, ${m} mes${m !== 1 ? 'es' : ''}`;
    });
    const total = calcTotal();
    const elTotal = document.getElementById('prev-total');
    if (elTotal) elTotal.textContent = total.texto;
}

function guardarYContinuar() {
    sincronizarRegistrosDesdeDOM();
    const total = calcTotal();

    localStorage.setItem('hv_tiempo_exp', JSON.stringify(registrosTiempo));
    localStorage.setItem('hv_tiempo_total', JSON.stringify(total));

    const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
    hv.estado = hv.estado || 'diligenciada';
    hv.tiempoTotal = total.texto;
    localStorage.setItem('hv_estado', JSON.stringify(hv));

    window.location.href = 'certificacion.html';
}
