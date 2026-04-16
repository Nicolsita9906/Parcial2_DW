/**
 * @file tiempo-experiencia.js
 * @description Lógica del formulario "Tiempo de Experiencia" (paso 4 de la HV).
 *
 * Responsabilidades:
 *  - Mostrar filas de entrada (años/meses) por cada tipo de ocupación.
 *  - Calcular el tiempo total de experiencia sumando todos los registros.
 *  - Mantener sincronización bidireccional entre el DOM y el arreglo en memoria.
 *  - Actualizar una vista previa en tiempo real.
 *  - Persistir los datos y avanzar al paso de certificación.
 *
 * Claves localStorage utilizadas:
 *  - `hv_usuario`      → sesión activa (lectura)
 *  - `hv_tiempo_exp`   → arreglo de registros de tiempo por tipo (lectura/escritura)
 *  - `hv_tiempo_total` → objeto {anios, meses, texto} con el total (escritura)
 *  - `hv_estado`       → estado global de la HV (lectura/escritura)
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipos de ocupación que aparecen como filas en el formulario.
 * Su orden debe coincidir con el orden de los `.total-row` en el HTML.
 * @type {Array<{id: string, label: string}>}
 */
const tiposOcupacion = [
  { id: 'publico',       label: 'Servidor público' },
  { id: 'privado',       label: 'Empleado del sector privado' },
  { id: 'independiente', label: 'Trabajador independiente' },
  { id: 'docente',       label: 'Docente' },
  { id: 'otro',          label: 'Otro' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO EN MEMORIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Arreglo en memoria con un registro por cada tipo de ocupación.
 * Cada elemento tiene: { id, label, anios, meses }
 * @type {Array<{id: string, label: string, anios: number, meses: number}>}
 */
let registrosTiempo = [];

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Mostrar correo del usuario en el encabezado
  const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
  const headerEl = document.getElementById('header-usuario');
  if (headerEl) headerEl.textContent = u.correo || '';

  // Intentar cargar registros previamente guardados
  registrosTiempo = JSON.parse(localStorage.getItem('hv_tiempo_exp') || '[]');

  if (registrosTiempo.length > 0) {
    // Si hay datos guardados, volcarlos en los inputs del DOM
    registrosTiempo.forEach(r => setInputTiempo(r.id, r.anios, r.meses));
  } else {
    // Si no hay datos guardados, leer los valores iniciales del HTML
    // (pueden estar pre-llenados con ceros u otros valores por defecto)
    sincronizarRegistrosDesdeDOM();
  }

  calcTotal();
  actualizarPreview();

  // Sincronizar, recalcular y actualizar preview ante cualquier cambio de input
  document.addEventListener('input', () => {
    sincronizarRegistrosDesdeDOM();
    calcTotal();
    actualizarPreview();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MANIPULACIÓN DEL DOM ↔ ESTADO EN MEMORIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escribe los valores de años y meses en los inputs de la fila correspondiente
 * al tipo de ocupación identificado por `id`.
 *
 * Busca la fila mediante el atributo `data-id` del elemento `.total-row`.
 *
 * @param {string} id    - Identificador del tipo de ocupación (ej: 'publico').
 * @param {number} anios - Años a escribir en el primer input.
 * @param {number} meses - Meses a escribir en el segundo input.
 */
function setInputTiempo(id, anios, meses) {
  const fila = document.querySelector(`.total-row[data-id="${id}"]`);
  if (!fila) return;
  const inputs = fila.querySelectorAll('input[type="number"]');
  if (inputs[0]) inputs[0].value = anios;
  if (inputs[1]) inputs[1].value = meses;
}

/**
 * Recorre todas las filas `.total-row` del DOM y reconstruye `registrosTiempo`
 * en memoria con los valores actuales de los inputs.
 *
 * Debe llamarse cada vez que el usuario modifica algún input para mantener
 * el estado en memoria actualizado.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// CÁLCULO DE TOTALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Suma el tiempo de todas las filas (años * 12 + meses) y muestra el total
 * en el elemento #total-exp.
 *
 * @returns {{anios: number, meses: number, texto: string}}
 *   Objeto con el total descompuesto y formateado para guardar en localStorage.
 */
function calcTotal() {
  let totalMeses = 0;

  // Acumular meses de cada fila
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

// ─────────────────────────────────────────────────────────────────────────────
// VISTA PREVIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el panel de vista previa lateral con los valores de las tres
 * primeras filas (público, privado, independiente) y el total general.
 *
 * IDs esperados en el HTML:
 *  - #prev-publico, #prev-privado, #prev-indep → una línea por tipo
 *  - #prev-total → tiempo total formateado
 */
function actualizarPreview() {
  const filas = document.querySelectorAll('.total-row');

  // Mostrar las primeras 3 filas en la preview (orden: público, privado, independiente)
  ['prev-publico', 'prev-privado', 'prev-indep'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el || !filas[i]) return;
    const inputs = filas[i].querySelectorAll('input[type="number"]');
    const a = parseInt(inputs[0]?.value) || 0;
    const m = parseInt(inputs[1]?.value) || 0;
    el.textContent = `${a} año${a !== 1 ? 's' : ''}, ${m} mes${m !== 1 ? 'es' : ''}`;
  });

  // Mostrar el total
  const total  = calcTotal();
  const elTotal = document.getElementById('prev-total');
  if (elTotal) elTotal.textContent = total.texto;
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR Y CONTINUAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sincroniza el estado desde el DOM, calcula el total y persiste todo en
 * localStorage. Luego navega a `certificacion.html`.
 *
 * Datos guardados:
 *  - `hv_tiempo_exp`   → arreglo con todos los registros (id, label, anios, meses)
 *  - `hv_tiempo_total` → objeto {anios, meses, texto}
 *  - `hv_estado`       → actualizado con el texto del tiempo total
 */
function guardarYContinuar() {
  sincronizarRegistrosDesdeDOM();
  const total = calcTotal();

  localStorage.setItem('hv_tiempo_exp',   JSON.stringify(registrosTiempo));
  localStorage.setItem('hv_tiempo_total', JSON.stringify(total));

  // Reflejar el tiempo total en el estado global de la HV
  const hv = JSON.parse(localStorage.getItem('hv_estado') || '{}');
  hv.estado      = hv.estado || 'diligenciada';
  hv.tiempoTotal = total.texto;
  localStorage.setItem('hv_estado', JSON.stringify(hv));

  window.location.href = 'certificacion.html';
}
