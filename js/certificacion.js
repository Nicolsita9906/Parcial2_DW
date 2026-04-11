window.addEventListener('DOMContentLoaded', () => {
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  cargarResumen();
}); 

function cargarResumen() {
  const hv       = JSON.parse(localStorage.getItem('hv_estado')            || '{}');
  const datos    = JSON.parse(localStorage.getItem('hv_datos_personales')  || '{}');
  const estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios')|| '[]');
  const exps     = JSON.parse(localStorage.getItem('hv_experiencia')       || '[]');
  const total    = JSON.parse(localStorage.getItem('hv_tiempo_total')      || '{}');

  // Nombre
  const nombre = [datos.nombres, datos.primerApellido, datos.segundoApellido].filter(Boolean).join(' ');
  setText('res-nombre', nombre || '—');
  setText('res-doc',    datos.tipoDoc && datos.numeroDoc ? datos.tipoDoc + ' ' + datos.numeroDoc : '—');

  // Formación
  const formTxt = estudios.length > 0
    ? estudios.map(e => (e.modalidad || '') + (e.titulo ? ' — ' + e.titulo : '')).join(' | ')
    : '—';
  setText('res-formacion', formTxt);

  // Experiencia
  setText('res-experiencia', exps.length + ' registro(s) · Total: ' + (total.texto || '—'));

  // Estado
  const estadoEl = document.getElementById('res-estado');
  if (estadoEl) {
    const est = hv.estado || 'diligenciada';
    estadoEl.textContent = est.charAt(0).toUpperCase() + est.slice(1);
    estadoEl.className = 'tag ' + est;
  }

  // Info de estado
  const fechaCreEl = document.getElementById('res-fecha-creacion');
  if (fechaCreEl && hv.fechaCreacion) {
    fechaCreEl.textContent = new Date(hv.fechaCreacion).toLocaleDateString('es-CO');
  }

  const estadoInfoEl = document.getElementById('res-estado-info');
  if (estadoInfoEl) {
    estadoInfoEl.textContent = (hv.estado || 'diligenciada').charAt(0).toUpperCase() + (hv.estado || 'diligenciada').slice(1);
    estadoInfoEl.className = 'tag ' + (hv.estado || 'diligenciada');
  }

  const revEl = document.getElementById('res-ultima-revision');
  if (revEl) {
    revEl.textContent = hv.fechaRevision
      ? new Date(hv.fechaRevision).toLocaleDateString('es-CO')
      : 'Pendiente';
  }

  const envioEl = document.getElementById('res-fecha-envio');
  if (envioEl) {
    envioEl.textContent = hv.fechaEnvio
      ? new Date(hv.fechaEnvio).toLocaleDateString('es-CO')
      : '— / — / —';
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function enviar() {
  const acepto = document.getElementById('acepto');
  if (!acepto || !acepto.checked) {
    alert('Debe aceptar la declaración juramentada antes de enviar.');
    return;
  }

  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado      = 'diligenciada';
  hv.fechaEnvio  = new Date().toISOString();
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  // Registrar en el arreglo global de HVs (para el admin)
  registrarHVEnAdmin(hv);

  alert('✅ Hoja de vida enviada correctamente. Estado: Diligenciada');
  cargarResumen();
}

function registrarHVEnAdmin(hv) {
  const datos    = JSON.parse(localStorage.getItem('hv_datos_personales')  || '{}');
  const estudios = JSON.parse(localStorage.getItem('hv_formacion_estudios')|| '[]');
  const exps     = JSON.parse(localStorage.getItem('hv_experiencia')       || '[]');
  const total    = JSON.parse(localStorage.getItem('hv_tiempo_total')      || '{}');

  let hojas = JSON.parse(localStorage.getItem('admin_hojas_de_vida') || '[]');

  const nombre = [datos.nombres, datos.primerApellido, datos.segundoApellido].filter(Boolean).join(' ');
  const docId  = datos.tipoDoc + ' ' + datos.numeroDoc;

  // Buscar si ya existe una HV con ese documento
  const idx = hojas.findIndex(h => h.documento === docId);
  const entrada = {
    id:          docId || Date.now().toString(),
    nombre:      nombre || 'Sin nombre',
    documento:   docId || '—',
    correo:      datos.correo || '—',
    estado:      hv.estado || 'diligenciada',
    fechaEnvio:  hv.fechaEnvio || new Date().toISOString(),
    formacion:   estudios.length,
    experiencias:exps.length,
    tiempoTotal: total.texto || '—',
    datosCompletos: {
      datosPersonales: datos,
      estudios,
      exps,
      tiempoTotal: total,
    }
  };

  if (idx >= 0) hojas[idx] = entrada;
  else hojas.push(entrada);

  localStorage.setItem('admin_hojas_de_vida', JSON.stringify(hojas));
}
