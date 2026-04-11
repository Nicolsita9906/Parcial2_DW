// ── Arreglos predefinidos ──
const tiposEntidad = ['Pública', 'Privada', 'Mixta'];
const departamentosExp = [
  'Antioquia','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas',
  'Cundinamarca','Huila','La Guajira','Meta','Nariño','Norte de Santander',
  'Quindío','Risaralda','Santander','Tolima','Valle del Cauca'
];
 
let experiencias = [];
let contExp = 0;

window.addEventListener('DOMContentLoaded', () => {
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  experiencias = JSON.parse(localStorage.getItem('hv_experiencia') || '[]');
  const cont = document.getElementById('exp-container');
  if (cont) cont.innerHTML = '';
  experiencias.forEach(e => agregarExpDesdeObjeto(e));
  if (experiencias.length === 0) addExperiencia();

  actualizarPreview();
  document.addEventListener('input', actualizarPreview);
  document.addEventListener('change', actualizarPreview);
});

function addExperiencia() {
  const idx = contExp++;
  const cont = document.getElementById('exp-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLExp(idx, null);
  cont.appendChild(div);
  inicializarRadiosEnCard(div);
  renumerarExp();
}

function agregarExpDesdeObjeto(obj) {
  const idx = contExp++;
  const cont = document.getElementById('exp-container');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'subcard';
  div.innerHTML = crearHTMLExp(idx, obj);
  cont.appendChild(div);
  inicializarRadiosEnCard(div);
  renumerarExp();
}

function crearHTMLExp(idx, obj) {
  const opcsDepto = departamentosExp.map(d =>
    `<option ${obj && obj.depto === d ? 'selected' : ''}>${d}</option>`
  ).join('');

  return `
  <div class="subcard-header">
    <div class="subcard-title">Experiencia</div>
    <button class="btn btn-danger" onclick="this.closest('.subcard').remove(); renumerarExp(); actualizarPreview()">Eliminar</button>
  </div>
  <div class="form-grid">
    <div class="field span2">
      <label>Empresa o entidad <span class="req">*</span></label>
      <input type="text" class="exp-empresa" placeholder="Nombre de la empresa" value="${obj ? obj.empresa : ''}">
      <span class="err">Campo obligatorio</span>
    </div>
    <div class="field">
      <label>Tipo <span class="req">*</span></label>
      <div class="radio-group exp-tipo">
        <label class="radio-opt ${obj && obj.tipo === 'Pública' ? 'selected' : ''}"><input type="radio"> Pública</label>
        <label class="radio-opt ${obj && obj.tipo === 'Privada' ? 'selected' : ''}"><input type="radio"> Privada</label>
        <label class="radio-opt ${obj && obj.tipo === 'Mixta'   ? 'selected' : ''}"><input type="radio"> Mixta</label>
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
      <input type="text" class="exp-municipio" placeholder="Ciudad" value="${obj ? obj.municipio : ''}">
    </div>
    <div class="field span2">
      <label>Cargo o contrato <span class="req">*</span></label>
      <input type="text" class="exp-cargo" placeholder="Ej: Desarrollador Web" value="${obj ? obj.cargo : ''}">
      <span class="err">Campo obligatorio</span>
    </div>
    <div class="field">
      <label>Dependencia / Área</label>
      <input type="text" class="exp-dependencia" placeholder="Área o departamento" value="${obj ? obj.dependencia : ''}">
    </div>
    <div class="field">
      <label>Correo entidad</label>
      <input type="email" class="exp-correo" placeholder="contacto@empresa.com" value="${obj ? obj.correoEntidad : ''}">
    </div>
    <div class="field">
      <label>Teléfono</label>
      <input type="tel" class="exp-tel" placeholder="Ej: 606 000 0000" value="${obj ? obj.telefono : ''}">
    </div>
    <div class="field">
      <label>Dirección</label>
      <input type="text" class="exp-dir" placeholder="Dirección de la entidad" value="${obj ? obj.direccion : ''}">
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

function renumerarExp() {
  document.querySelectorAll('#exp-container .subcard').forEach((sc, i) => {
    const t = sc.querySelector('.subcard-title');
    if (t) t.textContent = i === 0 ? 'Empleo actual / más reciente' : 'Empleo anterior ' + i;
  });
}

function leerExperiencias() {
  const res = [];
  document.querySelectorAll('#exp-container .subcard').forEach(sc => {
    const tipoSel = sc.querySelector('.exp-tipo .radio-opt.selected');
    res.push({
      empresa:       sc.querySelector('.exp-empresa')?.value.trim() || '',
      tipo:          tipoSel ? tipoSel.textContent.trim() : '',
      depto:         sc.querySelector('.exp-depto')?.value || '',
      municipio:     sc.querySelector('.exp-municipio')?.value.trim() || '',
      cargo:         sc.querySelector('.exp-cargo')?.value.trim() || '',
      dependencia:   sc.querySelector('.exp-dependencia')?.value.trim() || '',
      correoEntidad: sc.querySelector('.exp-correo')?.value.trim() || '',
      telefono:      sc.querySelector('.exp-tel')?.value.trim() || '',
      direccion:     sc.querySelector('.exp-dir')?.value.trim() || '',
      fechaIngreso:  sc.querySelector('.exp-ingreso')?.value || '',
      fechaRetiro:   sc.querySelector('.exp-retiro')?.value || '',
    });
  });
  return res;
}

function actualizarPreview() {
  const exps = leerExperiencias();
  const el1 = document.getElementById('prev-exp1');
  const el2 = document.getElementById('prev-exp2');
  if (el1) el1.textContent = exps[0]
    ? (exps[0].cargo || '—') + ' — ' + (exps[0].empresa || '—') + (exps[0].tipo ? ' (' + exps[0].tipo + ')' : '')
    : '—';
  if (el2) el2.textContent = exps[1]
    ? (exps[1].cargo || '—') + ' — ' + (exps[1].empresa || '—')
    : exps.length > 1 ? '—' : 'Sin registro adicional';
}

function guardarYContinuar() {
  let valido = true;
  document.querySelectorAll('.field.has-error').forEach(f => {
    f.classList.remove('has-error');
    const e = f.querySelector('.err'); if (e) e.style.display = 'none';
  });

  document.querySelectorAll('#exp-container .subcard').forEach(sc => {
    const empresa = sc.querySelector('.exp-empresa');
    const cargo   = sc.querySelector('.exp-cargo');
    const ingreso = sc.querySelector('.exp-ingreso');
    if (empresa && !empresa.value.trim()) { mostrarErr(empresa, 'Campo obligatorio'); valido = false; }
    if (cargo && !cargo.value.trim())     { mostrarErr(cargo,   'Campo obligatorio'); valido = false; }
    if (ingreso && !ingreso.value)        { mostrarErr(ingreso, 'Seleccione fecha');  valido = false; }
  });

  if (!valido) {
    document.querySelector('.field.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  experiencias = leerExperiencias();
  localStorage.setItem('hv_experiencia', JSON.stringify(experiencias));

  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado = hv.estado || 'diligenciada';
  hv.experiencias = experiencias.length;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'tiempo-experiencia.html';
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
