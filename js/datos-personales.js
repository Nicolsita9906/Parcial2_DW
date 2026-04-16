/**
 * @file datos-personales.js
 * @description Lógica del formulario "Datos Personales" (paso 1 de la HV).
 *
 * Responsabilidades:
 *  - Poblar dinámicamente los selectores de distritos militares, departamentos y municipios.
 *  - Manejar los grupos de botones radio personalizados (tipo doc, sexo, nacionalidad, libreta).
 *  - Mostrar una vista previa en tiempo real con los datos ingresados.
 *  - Validar el formulario antes de guardar.
 *  - Persistir los datos en localStorage (`hv_datos_personales`) y avanzar al siguiente paso.
 *
 * Claves localStorage utilizadas:
 *  - `hv_usuario`          → sesión activa (lectura)
 *  - `hv_datos_personales` → datos del formulario (lectura/escritura)
 *  - `hv_estado`           → estado global de la HV (lectura/escritura)
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Distritos militares de Colombia disponibles para el selector.
 * @type {Array<{valor: string, texto: string}>}
 */
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

/**
 * Departamentos de Colombia disponibles en el selector de lugar de nacimiento.
 * @type {string[]}
 */
const departamentosColombia = [
  'Antioquia','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas',
  'Caquetá','Cauca','Cesar','Córdoba','Cundinamarca','Huila','La Guajira',
  'Magdalena','Meta','Nariño','Norte de Santander','Quindío','Risaralda',
  'Santander','Sucre','Tolima','Valle del Cauca'
];

/**
 * Municipios agrupados por departamento.
 * Si el departamento seleccionado no está en este mapa, se usa el nombre
 * del departamento como único municipio disponible.
 * @type {Object.<string, string[]>}
 */
const municipiosPorDepto = {
  'Quindío':        ['Armenia','Buenavista','Calarcá','Circasia','Córdoba','Filandia','Génova','La Tebaida','Montenegro','Pijao','Quimbaya','Salento'],
  'Antioquia':      ['Medellín','Bello','Itagüí','Envigado','Apartadó','Turbo','Rionegro','Caucasia'],
  'Bogotá D.C.':    ['Bogotá'],
  'Valle del Cauca':['Cali','Buenaventura','Palmira','Tuluá','Buga','Cartago'],
  'Risaralda':      ['Pereira','Dosquebradas','Santa Rosa de Cabal','La Virginia'],
  'Caldas':         ['Manizales','La Dorada','Riosucio','Salamina','Chinchiná'],
  'Atlántico':      ['Barranquilla','Soledad','Malambo','Sabanalarga'],
  'Santander':      ['Bucaramanga','Floridablanca','Girón','Piedecuesta'],
  'Cundinamarca':   ['Soacha','Fusagasugá','Zipaquirá','Facatativá','Chía'],
  'Huila':          ['Neiva','Pitalito','Garzón','La Plata'],
  'Nariño':         ['Pasto','Tumaco','Ipiales','Túquerres'],
  'Tolima':         ['Ibagué','Espinal','Melgar','Honda'],
  'Meta':           ['Villavicencio','Acacías','Granada','Cumaral'],
};

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Mostrar el correo del usuario logueado en el encabezado
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  cargarDistritosMilitares();   // Poblar <select> de distritos
  cargarDepartamentos();        // Poblar <select> de departamentos (municipios se cargan al elegir)
  inicializarRadios();          // Activar botones radio personalizados y grado de escolaridad
  cargarDatosGuardados();       // Si ya hay datos en localStorage, pre-rellenar el form
  actualizarPreview();          // Mostrar vista previa inicial

  // Actualizar la vista previa en tiempo real ante cualquier cambio de input
  document.addEventListener('input',  actualizarPreview);
  document.addEventListener('change', actualizarPreview);
});

// ─────────────────────────────────────────────────────────────────────────────
// CARGA DE SELECTORES DINÁMICOS
// ─────────────────────────────────────────────────────────────────────────────

/** Llena el <select id="distrito-militar"> con los datos de `distritosMilitares`. */
function cargarDistritosMilitares() {
  const sel = document.getElementById('distrito-militar');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccione...</option>';
  distritosMilitares.forEach(d => {
    const opt = document.createElement('option');
    opt.value       = d.valor;
    opt.textContent = d.texto;
    sel.appendChild(opt);
  });
}

/** Llena el <select id="depto-nacimiento"> y registra el listener para cargar municipios. */
function cargarDepartamentos() {
  const sel = document.getElementById('depto-nacimiento');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccione...</option>';
  departamentosColombia.forEach(dep => {
    const opt = document.createElement('option');
    opt.value = dep; opt.textContent = dep;
    sel.appendChild(opt);
  });
  // Cuando cambia el departamento, recargar la lista de municipios
  sel.addEventListener('change', () => cargarMunicipios(sel.value));
}

/**
 * Llena el <select id="muni-nacimiento"> según el departamento elegido.
 * Si el departamento no tiene municipios definidos, usa el nombre del depto como opción única.
 *
 * @param {string} depto - Nombre del departamento seleccionado.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// RADIOS PERSONALIZADOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicializa los grupos de botones radio visuales (.radio-opt) y los botones
 * de grado de escolaridad (.grado-btn).
 *
 * En lugar de usar <input type="radio"> nativos, la UI usa divs con clase
 * `.radio-opt`; este método agrega los event listeners para que al hacer
 * clic en uno se desmarquen los demás del mismo grupo.
 */
function inicializarRadios() {
  // Grupos radio (tipo documento, sexo, nacionalidad, clase libreta)
  document.querySelectorAll('.radio-group').forEach(group => {
    group.querySelectorAll('.radio-opt').forEach(opt => {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        actualizarPreview();
      });
    });
  });

  // Botones de grado de escolaridad básica (primaria, bachillerato, etc.)
  document.querySelectorAll('.grado-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.grado-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

/**
 * Lee el texto del `.radio-opt.selected` dentro de un grupo radio.
 *
 * @param {string} groupId - ID del elemento contenedor del grupo radio.
 * @returns {string} Texto de la opción seleccionada, o cadena vacía si ninguna lo está.
 */
function leerRadio(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return '';
  const sel = group.querySelector('.radio-opt.selected');
  return sel ? sel.textContent.trim() : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lee los campos más visibles del formulario y los muestra en el panel de
 * vista previa lateral (#prev-nombre, #prev-doc, #prev-fnac, #prev-tel).
 * Se invoca ante cualquier evento `input` o `change` en el documento.
 */
function actualizarPreview() {
  const nombres = document.getElementById('nombres')?.value         || '';
  const ap1     = document.getElementById('primer-apellido')?.value  || '';
  const ap2     = document.getElementById('segundo-apellido')?.value || '';
  const doc     = document.getElementById('numero-doc')?.value       || '';
  const tipoDoc = leerRadio('grupo-tipo-doc');
  const fnac    = document.getElementById('fecha-nac')?.value        || '';
  const depto   = document.getElementById('depto-nacimiento')?.value || '';
  const muni    = document.getElementById('muni-nacimiento')?.value  || '';
  const tel     = document.getElementById('telefono')?.value         || '';

  setText('prev-nombre', [nombres, ap1, ap2].filter(Boolean).join(' ') || '—');
  setText('prev-doc',    tipoDoc && doc ? tipoDoc + ' ' + doc : '—');
  setText('prev-fnac',   fnac
    ? formatFecha(fnac) + (muni ? ` — ${muni}, ${depto}` : '')
    : '—');
  setText('prev-tel', tel || '—');
}

// ─────────────────────────────────────────────────────────────────────────────
// CARGA DE DATOS GUARDADOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Si existe `hv_datos_personales` en localStorage, pre-rellena todos los
 * campos del formulario. Los selectores de departamento/municipio y distrito
 * militar necesitan un pequeño retraso (`setTimeout`) porque sus opciones
 * se generan dinámicamente justo antes.
 */
function cargarDatosGuardados() {
  const datos = JSON.parse(localStorage.getItem('hv_datos_personales') || 'null');
  if (!datos) return;

  // Campos de texto simples
  setVal('numero-doc',       datos.numeroDoc);
  setVal('primer-apellido',  datos.primerApellido);
  setVal('segundo-apellido', datos.segundoApellido);
  setVal('nombres',          datos.nombres);
  setVal('fecha-nac',        datos.fechaNac);
  setVal('direccion',        datos.direccion);
  setVal('telefono',         datos.telefono);
  setVal('correo',           datos.correo);
  setVal('numero-libreta',   datos.numeroLibreta);

  // Departamento → municipio (cargar municipios primero, luego seleccionar)
  if (datos.deptoNac) {
    setVal('depto-nacimiento', datos.deptoNac);
    cargarMunicipios(datos.deptoNac);
    // Esperar a que el DOM refleje las nuevas opciones del municipio
    setTimeout(() => setVal('muni-nacimiento', datos.muniNac), 60);
  }

  // Distrito militar (espera a que el select se haya poblado)
  setTimeout(() => setVal('distrito-militar', datos.distritoMilitar), 60);

  // Botones radio: marcar la opción guardada en cada grupo
  if (datos.tipoDoc)      marcarRadio('grupo-tipo-doc',      datos.tipoDoc);
  if (datos.sexo)         marcarRadio('grupo-sexo',          datos.sexo);
  if (datos.nacionalidad) marcarRadio('grupo-nacionalidad',  datos.nacionalidad);
  if (datos.claseLibreta) marcarRadio('grupo-clase-libreta', datos.claseLibreta);
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida el formulario, guarda los datos en localStorage y navega al
 * siguiente paso: `formacion-academica.html`.
 *
 * Validaciones aplicadas:
 *  - Número de documento: mínimo 5 caracteres.
 *  - Primer apellido y nombres: mínimo 2 caracteres.
 *  - Fecha de nacimiento, departamento y municipio: obligatorios.
 *  - Dirección: mínimo 5 caracteres.
 *  - Teléfono: formato numérico válido (7+ dígitos, admite espacios, guiones y +).
 *  - Correo: formato email válido.
 */
function guardarYContinuar() {
  let valido = true;

  // Limpiar errores previos
  document.querySelectorAll('.field.has-error').forEach(f => {
    f.classList.remove('has-error');
    const err = f.querySelector('.err');
    if (err) err.style.display = 'none';
  });

  // Ejecutar validaciones (operador && cortocircuita si ya hay error, pero igual se valida todo)
  valido = validar('numero-doc',       v => v.length >= 5,                         'Mínimo 5 caracteres')      && valido;
  valido = validar('primer-apellido',  v => v.length >= 2,                         'Campo obligatorio')        && valido;
  valido = validar('nombres',          v => v.length >= 2,                         'Campo obligatorio')        && valido;
  valido = validar('fecha-nac',        v => v !== '',                              'Seleccione fecha')         && valido;
  valido = validar('depto-nacimiento', v => v !== '',                              'Seleccione departamento')  && valido;
  valido = validar('muni-nacimiento',  v => v !== '',                              'Seleccione municipio')     && valido;
  valido = validar('direccion',        v => v.length >= 5,                         'Campo obligatorio')        && valido;
  valido = validar('telefono',         v => /^[0-9\s\-+]{7,}$/.test(v),           'Teléfono inválido')        && valido;
  valido = validar('correo',           v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido')          && valido;

  if (!valido) {
    // Hacer scroll hasta el primer campo con error
    document.querySelector('.field.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Construir objeto con todos los datos del formulario
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

  // Actualizar (o crear) el objeto de estado global de la HV
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado         = hv.estado || 'diligenciada';
  hv.fechaCreacion  = hv.fechaCreacion || new Date().toISOString(); // Solo se asigna la primera vez
  hv.nombreCompleto = [datos.nombres, datos.primerApellido, datos.segundoApellido].filter(Boolean).join(' ');
  hv.documento      = datos.tipoDoc + ' ' + datos.numeroDoc;
  hv.correo         = datos.correo;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'formacion-academica.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escribe `val` en el `textContent` del elemento con el id dado.
 * No lanza error si el elemento no existe.
 *
 * @param {string} id  - ID del elemento en el DOM.
 * @param {string} val - Texto a mostrar.
 */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Asigna un valor al `value` de un input/select por su ID.
 * No actúa si el elemento no existe o el valor es null/undefined.
 *
 * @param {string} id    - ID del elemento input/select.
 * @param {*}      valor - Valor a asignar.
 */
function setVal(id, valor) {
  const el = document.getElementById(id);
  if (el && valor != null) el.value = valor;
}

/**
 * Marca como `.selected` el `.radio-opt` cuyo texto coincida con `texto`
 * dentro del grupo identificado por `groupId`. Desmarca los demás.
 *
 * @param {string} groupId - ID del contenedor del grupo radio.
 * @param {string} texto   - Texto exacto de la opción a seleccionar.
 */
function marcarRadio(groupId, texto) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.radio-opt').forEach(opt => {
    const coincide = opt.textContent.trim() === texto;
    opt.classList.toggle('selected', coincide);
  });
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato legible DD / MM / YYYY.
 *
 * @param {string} f - Fecha en formato YYYY-MM-DD.
 * @returns {string} Fecha formateada o '—' si el input está vacío.
 */
function formatFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d} / ${m} / ${y}`;
}

/**
 * Valida un campo del formulario aplicando una función de prueba.
 * Si la validación falla, marca el campo con `.has-error` y muestra el mensaje.
 *
 * @param {string}   id  - ID del campo a validar.
 * @param {Function} fn  - Función que recibe el valor del campo y retorna boolean.
 * @param {string}   msg - Mensaje de error a mostrar si la validación falla.
 * @returns {boolean} `true` si el campo es válido, `false` si no lo es.
 */
function validar(id, fn, msg) {
  const el = document.getElementById(id);
  if (!el) return true; // Si el campo no existe, se considera válido
  if (!fn(el.value.trim())) {
    const field = el.closest('.field');
    if (field) {
      field.classList.add('has-error');
      let err = field.querySelector('.err');
      if (!err) {
        err = document.createElement('span');
        err.className = 'err';
        field.appendChild(err);
      }
      err.textContent    = msg;
      err.style.display  = 'block';
    }
    return false;
  }
  return true;
}
