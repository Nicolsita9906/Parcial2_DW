// ── Arreglos predefinidos ──
const distritosMilitares = [
  { valor: 'DM01', texto: 'D.M. 01 — Bogotá' },
  { valor: 'DM02', texto: 'D.M. 02 — Medellín' },
  { valor: 'DM03', texto: 'D.M. 03 — Cali' },
  { valor: 'DM04', texto: 'D.M. 04 — Barranquilla' },
  { valor: 'DM05', texto: 'D.M. 05 — Manizales' },
  { valor: 'DM06', texto: 'D.M. 06 — Armenia' },
  { valor: 'DM07', texto: 'D.M. 07 — Pereira' },
  { valor: 'DM08', texto: 'D.M. 08 — Bucaramanga' },
  { valor: 'DM09', texto: 'D.M. 09 — Ibagué' },
  { valor: 'DM10', texto: 'D.M. 10 — Neiva' },
];

const departamentosColombia = [
  'Antioquia','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas',
  'Caquetá','Cauca','Cesar','Córdoba','Cundinamarca','Huila','La Guajira',
  'Magdalena','Meta','Nariño','Norte de Santander','Quindío','Risaralda',
  'Santander','Sucre','Tolima','Valle del Cauca'
];

const municipiosPorDepto = {
  'Quindío':       ['Armenia','Buenavista','Calarcá','Circasia','Córdoba','Filandia','Génova','La Tebaida','Montenegro','Pijao','Quimbaya','Salento'],
  'Antioquia':     ['Medellín','Bello','Itagüí','Envigado','Apartadó','Turbo','Rionegro','Caucasia'],
  'Bogotá D.C.':   ['Bogotá'],
  'Valle del Cauca':['Cali','Buenaventura','Palmira','Tuluá','Buga','Cartago'],
  'Risaralda':     ['Pereira','Dosquebradas','Santa Rosa de Cabal','La Virginia'],
  'Caldas':        ['Manizales','La Dorada','Riosucio','Salamina','Chinchiná'],
  'Atlántico':     ['Barranquilla','Soledad','Malambo','Sabanalarga'],
  'Santander':     ['Bucaramanga','Floridablanca','Girón','Piedecuesta'],
  'Cundinamarca':  ['Soacha','Fusagasugá','Zipaquirá','Facatativá','Chía'],
  'Huila':         ['Neiva','Pitalito','Garzón','La Plata'],
  'Nariño':        ['Pasto','Tumaco','Ipiales','Túquerres'],
  'Tolima':        ['Ibagué','Espinal','Melgar','Honda'],
  'Meta':          ['Villavicencio','Acacías','Granada','Cumaral'],
};
 
window.addEventListener('DOMContentLoaded', () => {
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  cargarDistritosMilitares();
  cargarDepartamentos();
  inicializarRadios();
  cargarDatosGuardados();
  actualizarPreview();
  document.addEventListener('input', actualizarPreview);
  document.addEventListener('change', actualizarPreview);
});

function cargarDistritosMilitares() {
  const sel = document.getElementById('distrito-militar');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccione...</option>';
  distritosMilitares.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.valor;
    opt.textContent = d.texto;
    sel.appendChild(opt);
  });
}

function cargarDepartamentos() {
  const sel = document.getElementById('depto-nacimiento');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccione...</option>';
  departamentosColombia.forEach(dep => {
    const opt = document.createElement('option');
    opt.value = dep; opt.textContent = dep;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => cargarMunicipios(sel.value));
}

function cargarMunicipios(depto) {
  const sel = document.getElementById('muni-nacimiento');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccione...</option>';
  (municipiosPorDepto[depto] || [depto]).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    sel.appendChild(opt);
  });
}

function inicializarRadios() {
  document.querySelectorAll('.radio-group').forEach(group => {
    group.querySelectorAll('.radio-opt').forEach(opt => {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        actualizarPreview();
      });
    });
  });
  document.querySelectorAll('.grado-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.grado-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

function leerRadio(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return '';
  const sel = group.querySelector('.radio-opt.selected');
  return sel ? sel.textContent.trim() : '';
}

function actualizarPreview() {
  const nombres = document.getElementById('nombres')?.value || '';
  const ap1     = document.getElementById('primer-apellido')?.value || '';
  const ap2     = document.getElementById('segundo-apellido')?.value || '';
  const doc     = document.getElementById('numero-doc')?.value || '';
  const tipoDoc = leerRadio('grupo-tipo-doc');
  const fnac    = document.getElementById('fecha-nac')?.value || '';
  const depto   = document.getElementById('depto-nacimiento')?.value || '';
  const muni    = document.getElementById('muni-nacimiento')?.value || '';
  const tel     = document.getElementById('telefono')?.value || '';

  setText('prev-nombre', [nombres, ap1, ap2].filter(Boolean).join(' ') || '—');
  setText('prev-doc',    tipoDoc && doc ? tipoDoc + ' ' + doc : '—');
  setText('prev-fnac',   fnac ? formatFecha(fnac) + (muni ? ` — ${muni}, ${depto}` : '') : '—');
  setText('prev-tel',    tel || '—');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d} / ${m} / ${y}`;
}

function cargarDatosGuardados() {
  const datos = JSON.parse(localStorage.getItem('hv_datos_personales') || 'null');
  if (!datos) return;
  setVal('numero-doc', datos.numeroDoc);
  setVal('primer-apellido', datos.primerApellido);
  setVal('segundo-apellido', datos.segundoApellido);
  setVal('nombres', datos.nombres);
  setVal('fecha-nac', datos.fechaNac);
  setVal('direccion', datos.direccion);
  setVal('telefono', datos.telefono);
  setVal('correo', datos.correo);
  setVal('numero-libreta', datos.numeroLibreta);
  if (datos.deptoNac) {
    setVal('depto-nacimiento', datos.deptoNac);
    cargarMunicipios(datos.deptoNac);
    setTimeout(() => setVal('muni-nacimiento', datos.muniNac), 60);
  }
  setTimeout(() => setVal('distrito-militar', datos.distritoMilitar), 60);
  if (datos.tipoDoc)      marcarRadio('grupo-tipo-doc', datos.tipoDoc);
  if (datos.sexo)         marcarRadio('grupo-sexo', datos.sexo);
  if (datos.nacionalidad) marcarRadio('grupo-nacionalidad', datos.nacionalidad);
  if (datos.claseLibreta) marcarRadio('grupo-clase-libreta', datos.claseLibreta);
}

function setVal(id, valor) {
  const el = document.getElementById(id);
  if (el && valor != null) el.value = valor;
}

function marcarRadio(groupId, texto) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.radio-opt').forEach(opt => {
    const coincide = opt.textContent.trim() === texto;
    opt.classList.toggle('selected', coincide);
  });
}

function guardarYContinuar() {
  let valido = true;
  document.querySelectorAll('.field.has-error').forEach(f => {
    f.classList.remove('has-error');
    const err = f.querySelector('.err');
    if (err) err.style.display = 'none';
  });

  valido = validar('numero-doc',        v => v.length >= 5,                    'Mínimo 5 caracteres')  && valido;
  valido = validar('primer-apellido',   v => v.length >= 2,                    'Campo obligatorio')     && valido;
  valido = validar('nombres',           v => v.length >= 2,                    'Campo obligatorio')     && valido;
  valido = validar('fecha-nac',         v => v !== '',                         'Seleccione fecha')      && valido;
  valido = validar('depto-nacimiento',  v => v !== '',                         'Seleccione departamento')&& valido;
  valido = validar('muni-nacimiento',   v => v !== '',                         'Seleccione municipio')  && valido;
  valido = validar('direccion',         v => v.length >= 5,                    'Campo obligatorio')     && valido;
  valido = validar('telefono',          v => /^[0-9\s\-+]{7,}$/.test(v),      'Teléfono inválido')     && valido;
  valido = validar('correo',            v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido')  && valido;

  if (!valido) {
    document.querySelector('.field.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const datos = {
    tipoDoc:         leerRadio('grupo-tipo-doc'),
    numeroDoc:       document.getElementById('numero-doc').value.trim(),
    primerApellido:  document.getElementById('primer-apellido').value.trim(),
    segundoApellido: document.getElementById('segundo-apellido')?.value.trim() || '',
    nombres:         document.getElementById('nombres').value.trim(),
    sexo:            leerRadio('grupo-sexo'),
    nacionalidad:    leerRadio('grupo-nacionalidad'),
    fechaNac:        document.getElementById('fecha-nac').value,
    deptoNac:        document.getElementById('depto-nacimiento').value,
    muniNac:         document.getElementById('muni-nacimiento').value,
    direccion:       document.getElementById('direccion').value.trim(),
    telefono:        document.getElementById('telefono').value.trim(),
    correo:          document.getElementById('correo').value.trim(),
    claseLibreta:    leerRadio('grupo-clase-libreta'),
    numeroLibreta:   document.getElementById('numero-libreta')?.value.trim() || '',
    distritoMilitar: document.getElementById('distrito-militar')?.value || '',
  };

  localStorage.setItem('hv_datos_personales', JSON.stringify(datos));

  // Actualizar estado global de la HV
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado         = hv.estado || 'diligenciada';
  hv.fechaCreacion  = hv.fechaCreacion || new Date().toISOString();
  hv.nombreCompleto = [datos.nombres, datos.primerApellido, datos.segundoApellido].filter(Boolean).join(' ');
  hv.documento      = datos.tipoDoc + ' ' + datos.numeroDoc;
  hv.correo         = datos.correo;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'formacion-academica.html';
}

function validar(id, fn, msg) {
  const el = document.getElementById(id);
  if (!el) return true;
  if (!fn(el.value.trim())) {
    const field = el.closest('.field');
    if (field) {
      field.classList.add('has-error');
      let err = field.querySelector('.err');
      if (!err) { err = document.createElement('span'); err.className = 'err'; field.appendChild(err); }
      err.textContent = msg;
      err.style.display = 'block';
    }
    return false;
  }
  return true;
}
