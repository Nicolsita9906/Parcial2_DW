// ── Arreglos predefinidos ──
const modalidades = [
    { valor: 'TC',  texto: 'TC — Técnica' },
    { valor: 'TL',  texto: 'TL — Tecnológica' },
    { valor: 'TE',  texto: 'TE — Tecnológica Especializada' },
    { valor: 'UN',  texto: 'UN — Universitaria' },
    { valor: 'ES',  texto: 'ES — Especialización' },
    { valor: 'MG',  texto: 'MG — Maestría / Magíster' },
    { valor: 'DOC', texto: 'DOC — Doctorado / PhD' },
];

const idiomasDisponibles = ['Inglés','Francés','Alemán','Portugués','Italiano','Mandarin','Japonés','Árabe','Otro'];

// ── Estado en memoria ──
let estudios = [];
let idiomas  = [];
let contEstudio = 0;
let contIdioma  = 0;

window.addEventListener('DOMContentLoaded', () => {
    const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
    const headerEl = document.getElementById('header-usuario');
    if (headerEl) headerEl.textContent = u.correo || '';

    // Cargar datos guardados
    estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios') || '[]');
    idiomas  = JSON.parse(localStorage.getItem('hv_formacion_idiomas')  || '[]');

    // Cargar educación básica guardada
    const basica = JSON.parse(localStorage.getItem('hv_formacion_basica') || 'null');
    if (basica) {
        setVal('titulo-basica', basica.titulo);
        setVal('fecha-basica', basica.fecha);
        marcarGrado(basica.grado);
    }

    // Renderizar estudios e idiomas guardados
    const cont = document.getElementById('estudios-container');
    if (cont) cont.innerHTML = '';
    estudios.forEach((e, i) => agregarEstudioDesdeObjeto(e, i));

    const contId = document.getElementById('idiomas-container');
    if (contId) contId.innerHTML = '';
    idiomas.forEach((id, i) => agregarIdiomaDesdeObjeto(id, i));

    // Si no hay estudios, agregar uno vacío
    if (estudios.length === 0) addEstudio();
    if (idiomas.length === 0)  addIdioma();

    inicializarGradosBtns();
    actualizarPreview();
    document.addEventListener('input', actualizarPreview);
    document.addEventListener('change', actualizarPreview);
});

// ── Grados ──
function inicializarGradosBtns() {
    document.querySelectorAll('.grado-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.grado-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function marcarGrado(grado) {
    document.querySelectorAll('.grado-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === grado);
    });
}

function leerGrado() {
    const sel = document.querySelector('.grado-btn.selected');
    return sel ? sel.textContent.trim() : '';
}

// ── Agregar estudio (botón) ──
function addEstudio() {
    const idx = contEstudio++;
    const cont = document.getElementById('estudios-container');
    if (!cont) return;
    const div = document.createElement('div');
    div.className = 'subcard';
    div.dataset.idx = idx;
    div.innerHTML = crearHTMLEstudio(idx, null);
    cont.appendChild(div);
    inicializarNivelBtnsEnCard(div);
    renumerarEstudios();
}

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

function crearHTMLEstudio(idx, obj) {
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
        <label class="radio-opt ${obj && obj.graduado === 'Sí' ? 'selected' : ''}"><input type="radio"> Sí</label>
        <label class="radio-opt ${obj && obj.graduado === 'No' ? 'selected' : (!obj ? '' : '')}"><input type="radio"> No</label>
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

function eliminarEstudio(btn) {
    btn.closest('.subcard').remove();
    renumerarEstudios();
}

function renumerarEstudios() {
    document.querySelectorAll('#estudios-container .subcard').forEach((sc, i) => {
        const t = sc.querySelector('.subcard-title');
        if (t) t.textContent = 'Estudio ' + (i + 1);
    });
}

function inicializarNivelBtnsEnCard(card) {
    card.querySelectorAll('.radio-group').forEach(group => {
        group.querySelectorAll('.radio-opt').forEach(opt => {
            opt.addEventListener('click', function () {
                group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    });
    card.querySelectorAll('.nivel-opts').forEach(opts => {
        opts.querySelectorAll('.nivel-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                opts.querySelectorAll('.nivel-btn').forEach(b => b.classList.remove('sel'));
                this.classList.add('sel');
            });
        });
    });
}

// ── Agregar idioma ──
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

function agregarIdiomaDesdeObjeto(obj, i) {
    const idx = contIdioma++;
    const cont = document.getElementById('idiomas-container');
    if (!cont) return;
    const div = document.createElement('div');
    div.className = 'subcard';
    div.innerHTML = crearHTMLIdioma(idx, obj);
    cont.appendChild(div);
    inicializarNivelBtnsEnCard(div);
    renumerarIdiomas();
}

function crearHTMLIdioma(idx, obj) {
    const opcsIdioma = idiomasDisponibles.map(id =>
        `<option ${obj && obj.nombre === id ? 'selected' : ''}>${id}</option>`
    ).join('');

    const niveles = ['R', 'B', 'MB'];
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
    <select class="idioma-nombre" style="max-width:200px;">
      ${opcsIdioma}
    </select>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
    ${crearNivel('Lo habla',   obj ? obj.habla   : '')}
    ${crearNivel('Lo lee',     obj ? obj.lee     : '')}
    ${crearNivel('Lo escribe', obj ? obj.escribe : '')}
  </div>`;
}

function renumerarIdiomas() {
    document.querySelectorAll('#idiomas-container .subcard').forEach((sc, i) => {
        const t = sc.querySelector('.subcard-title');
        if (t) t.textContent = 'Idioma ' + (i + 1);
    });
}

// ── Leer datos del DOM ──
function leerEstudios() {
    const resultado = [];
    document.querySelectorAll('#estudios-container .subcard').forEach(sc => {
        resultado.push({
            modalidad:  sc.querySelector('.est-modalidad')?.value || '',
            semestres:  sc.querySelector('.est-semestres')?.value || '',
            graduado:   sc.querySelector('.est-graduado .radio-opt.selected')?.textContent.trim() || '',
            titulo:     sc.querySelector('.est-titulo')?.value.trim() || '',
            fecha:      sc.querySelector('.est-fecha')?.value || '',
            tarjeta:    sc.querySelector('.est-tarjeta')?.value.trim() || '',
        });
    });
    return resultado;
}

function leerIdiomas() {
    const resultado = [];
    document.querySelectorAll('#idiomas-container .subcard').forEach(sc => {
        const niveles = sc.querySelectorAll('.nivel-opts');
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

// ── Vista previa ──
function actualizarPreview() {
    const grado    = leerGrado();
    const titulo   = document.getElementById('titulo-basica')?.value || '';
    const estudArr = leerEstudios();
    const idioArr  = leerIdiomas();

    setText('prev-grado',   grado ? grado + (titulo ? ' — ' + titulo : '') : '—');
    setText('prev-estudios', estudArr.length > 0
        ? estudArr.map(e => (e.modalidad || '?') + (e.titulo ? ' — ' + e.titulo : '')).join(' | ')
        : '—');
    setText('prev-idiomas', idioArr.length > 0
        ? idioArr.map(i => i.nombre + (i.habla ? ': H' + i.habla : '')).join(' | ')
        : '—');
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val != null) el.value = val;
}

// ── Guardar y continuar ──
function guardarYContinuar() {
    let valido = true;

    // Validar al menos un estudio con título y modalidad
    document.querySelectorAll('#estudios-container .subcard').forEach(sc => {
        const modal = sc.querySelector('.est-modalidad');
        const tit   = sc.querySelector('.est-titulo');
        if (modal && !modal.value) { mostrarErr(modal, 'Seleccione modalidad'); valido = false; }
        if (tit && !tit.value.trim()) { mostrarErr(tit, 'Campo obligatorio'); valido = false; }
    });

    if (!valido) {
        document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const grado = leerGrado();
    const basica = {
        grado:  grado,
        titulo: document.getElementById('titulo-basica')?.value.trim() || '',
        fecha:  document.getElementById('fecha-basica')?.value || '',
    };

    estudios = leerEstudios();
    idiomas  = leerIdiomas();

    localStorage.setItem('hv_formacion_basica',   JSON.stringify(basica));
    localStorage.setItem('hv_formacion_estudios', JSON.stringify(estudios));
    localStorage.setItem('hv_formacion_idiomas',  JSON.stringify(idiomas));

    // Actualizar estado HV
    const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
    hv.estado = hv.estado || 'diligenciada';
    hv.formacion = estudios.length;
    localStorage.setItem('hv_estado', JSON.stringify(hv));

    window.location.href = 'experiencia-laboral.html';
}

function mostrarErr(el, msg) {
    const field = el.closest('.field');
    if (!field) return;
    field.classList.add('has-error');
    let err = field.querySelector('.err');
    if (!err) { err = document.createElement('span'); err.className = 'err'; field.appendChild(err); }
    err.textContent = msg;
    err.style.display = 'block';
}
