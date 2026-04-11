// ─────────────────────────────────────────────
// ARREGLOS PREDEFINIDOS
// ─────────────────────────────────────────────

// Tipos de entidad (para radio buttons)
const tiposEntidad = ['Pública', 'Privada', 'Mixta'];

// Lista de departamentos disponibles (para el select)
const departamentosExp = [
    'Antioquia','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas',
    'Cundinamarca','Huila','La Guajira','Meta','Nariño','Norte de Santander',
    'Quindío','Risaralda','Santander','Tolima','Valle del Cauca'
];


// ─────────────────────────────────────────────
// ESTADO EN MEMORIA
// ─────────────────────────────────────────────

// Arreglo donde se almacenan las experiencias laborales
let experiencias = [];

// Contador para numerar dinámicamente cada experiencia
let contExp = 0;


// ─────────────────────────────────────────────
// EVENTO PRINCIPAL AL CARGAR LA PÁGINA
// ─────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {

    // Obtener usuario desde localStorage
    const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');

    // Mostrar correo del usuario en el header
    const headerEl = document.getElementById('header-usuario');
    if (headerEl) headerEl.textContent = u.correo || '';

    // Cargar experiencias guardadas
    experiencias = JSON.parse(localStorage.getItem('hv_experiencia') || '[]');

    // Limpiar contenedor
    const cont = document.getElementById('exp-container');
    if (cont) cont.innerHTML = '';

    // Renderizar experiencias guardadas
    experiencias.forEach(e => agregarExpDesdeObjeto(e));

    // Si no hay experiencias, crear una vacía
    if (experiencias.length === 0) addExperiencia();

    // Actualizar vista previa inicial
    actualizarPreview();

    // Escuchar cambios en inputs
    document.addEventListener('input', actualizarPreview);
    document.addEventListener('change', actualizarPreview);
});


// ─────────────────────────────────────────────
// CREAR EXPERIENCIA (VACÍA)
// ─────────────────────────────────────────────

function addExperiencia() {

    const idx = contExp++; // índice único

    const cont = document.getElementById('exp-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'subcard';

    // Insertar HTML dinámico
    div.innerHTML = crearHTMLExp(idx, null);

    cont.appendChild(div);

    // Activar radios dentro del card
    inicializarRadiosEnCard(div);

    // Renumerar títulos
    renumerarExp();
}


// ─────────────────────────────────────────────
// CREAR EXPERIENCIA DESDE DATOS GUARDADOS
// ─────────────────────────────────────────────

function agregarExpDesdeObjeto(obj) {

    const idx = contExp++;

    const cont = document.getElementById('exp-container');
    if (!cont) return;

    const div = document.createElement('div');
    div.className = 'subcard';

    // Generar HTML con datos ya existentes
    div.innerHTML = crearHTMLExp(idx, obj);

    cont.appendChild(div);

    inicializarRadiosEnCard(div);

    renumerarExp();
}


// ─────────────────────────────────────────────
// GENERAR HTML DE UNA EXPERIENCIA
// ─────────────────────────────────────────────

function crearHTMLExp(idx, obj) {

    // Crear opciones del select de departamentos
    const opcsDepto = departamentosExp.map(d =>
        `<option ${obj && obj.depto === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
    <!-- Card de experiencia -->
    <div class="subcard-header">
        <div class="subcard-title">Experiencia</div>

        <!-- Botón eliminar -->
        <button class="btn btn-danger"
            onclick="this.closest('.subcard').remove(); renumerarExp(); actualizarPreview()">
            Eliminar
        </button>
    </div>

    <div class="form-grid">

        <!-- Empresa -->
        <div class="field span2">
            <label>Empresa o entidad *</label>
            <input type="text" class="exp-empresa"
                value="${obj ? obj.empresa : ''}">
        </div>

        <!-- Tipo (radio) -->
        <div class="field">
            <label>Tipo *</label>
            <div class="radio-group exp-tipo">
                <label class="radio-opt ${obj && obj.tipo === 'Pública' ? 'selected' : ''}">
                    <input type="radio"> Pública
                </label>
                <label class="radio-opt ${obj && obj.tipo === 'Privada' ? 'selected' : ''}">
                    <input type="radio"> Privada
                </label>
                <label class="radio-opt ${obj && obj.tipo === 'Mixta' ? 'selected' : ''}">
                    <input type="radio"> Mixta
                </label>
            </div>
        </div>

        <!-- Departamento -->
        <div class="field">
            <label>Departamento</label>
            <select class="exp-depto">
                <option value="">Seleccione...</option>
                ${opcsDepto}
            </select>
        </div>

        <!-- Municipio -->
        <div class="field">
            <label>Municipio</label>
            <input type="text" class="exp-municipio"
                value="${obj ? obj.municipio : ''}">
        </div>

        <!-- Cargo -->
        <div class="field span2">
            <label>Cargo *</label>
            <input type="text" class="exp-cargo"
                value="${obj ? obj.cargo : ''}">
        </div>

        <!-- Fechas -->
        <div class="field">
            <label>Fecha ingreso *</label>
            <input type="date" class="exp-ingreso"
                value="${obj ? obj.fechaIngreso : ''}">
        </div>

        <div class="field">
            <label>Fecha retiro</label>
            <input type="date" class="exp-retiro"
                value="${obj ? obj.fechaRetiro : ''}">
        </div>

    </div>`;
}


// ─────────────────────────────────────────────
// EVENTOS DE RADIO BUTTONS
// ─────────────────────────────────────────────

function inicializarRadiosEnCard(card) {

    card.querySelectorAll('.radio-group').forEach(group => {

        group.querySelectorAll('.radio-opt').forEach(opt => {

            opt.addEventListener('click', function () {

                // Quitar selección a todos
                group.querySelectorAll('.radio-opt')
                    .forEach(o => o.classList.remove('selected'));

                // Marcar seleccionado
                this.classList.add('selected');

                actualizarPreview();
            });
        });
    });
}


// ─────────────────────────────────────────────
// RENUMERAR EXPERIENCIAS
// ─────────────────────────────────────────────

function renumerarExp() {

    document.querySelectorAll('#exp-container .subcard')
        .forEach((sc, i) => {

            const t = sc.querySelector('.subcard-title');

            if (t) {
                t.textContent =
                    i === 0
                        ? 'Empleo actual / más reciente'
                        : 'Empleo anterior ' + i;
            }
        });
}


// ─────────────────────────────────────────────
// LEER DATOS DEL DOM
// ─────────────────────────────────────────────

function leerExperiencias() {

    const res = [];

    document.querySelectorAll('#exp-container .subcard')
        .forEach(sc => {

            const tipoSel = sc.querySelector('.exp-tipo .radio-opt.selected');

            res.push({
                empresa: sc.querySelector('.exp-empresa')?.value.trim() || '',
                tipo: tipoSel ? tipoSel.textContent.trim() : '',
                depto: sc.querySelector('.exp-depto')?.value || '',
                municipio: sc.querySelector('.exp-municipio')?.value.trim() || '',
                cargo: sc.querySelector('.exp-cargo')?.value.trim() || '',
                fechaIngreso: sc.querySelector('.exp-ingreso')?.value || '',
                fechaRetiro: sc.querySelector('.exp-retiro')?.value || '',
            });
        });

    return res;
}


// ─────────────────────────────────────────────
// VISTA PREVIA
// ─────────────────────────────────────────────

function actualizarPreview() {

    const exps = leerExperiencias();

    const el1 = document.getElementById('prev-exp1');
    const el2 = document.getElementById('prev-exp2');

    // Primer empleo
    if (el1) {
        el1.textContent = exps[0]
            ? `${exps[0].cargo || '—'} — ${exps[0].empresa || '—'}`
            : '—';
    }

    // Segundo empleo
    if (el2) {
        el2.textContent = exps[1]
            ? `${exps[1].cargo || '—'} — ${exps[1].empresa || '—'}`
            : 'Sin registro adicional';
    }
}


// ─────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────

function guardarYContinuar() {

    let valido = true;

    // Validar campos obligatorios
    document.querySelectorAll('#exp-container .subcard')
        .forEach(sc => {

            const empresa = sc.querySelector('.exp-empresa');
            const cargo   = sc.querySelector('.exp-cargo');
            const ingreso = sc.querySelector('.exp-ingreso');

            if (!empresa.value.trim()) valido = false;
            if (!cargo.value.trim())   valido = false;
            if (!ingreso.value)        valido = false;
        });

    if (!valido) return;

    // Guardar en localStorage
    experiencias = leerExperiencias();
    localStorage.setItem('hv_experiencia', JSON.stringify(experiencias));

    // Actualizar estado general
    const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
    hv.experiencias = experiencias.length;
    localStorage.setItem('hv_estado', JSON.stringify(hv));

    // Redirigir
    window.location.href = 'tiempo-experiencia.html';
}


// ─────────────────────────────────────────────
// MOSTRAR ERRORES
// ─────────────────────────────────────────────

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