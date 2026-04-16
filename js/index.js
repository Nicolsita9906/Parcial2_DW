/**
 * @file index.js
 * @description Lógica de la pantalla de inicio de sesión.
 *
 * Responsabilidades:
 *  - Gestionar la selección de rol (usuario / admin) mediante las pestañas de la UI.
 *  - Validar las credenciales ingresadas contra una lista de usuarios en memoria.
 *  - Redirigir al panel correcto según el rol autenticado.
 *  - Persistir la sesión activa en localStorage bajo la clave `hv_usuario`.
 *
 * Flujo principal:
 *  Usuario elige rol → ingresa correo + clave → ingresar() → redirección
 */

/** @type {'usuario'|'admin'} Rol actualmente seleccionado en las pestañas de la UI */
let rolSeleccionado = 'usuario';

/**
 * Activa la pestaña de rol seleccionada y actualiza `rolSeleccionado`.
 *
 * Se llama directamente desde el atributo `onclick` de cada `.role-tab` en el HTML.
 *
 * @param {HTMLElement} el   - Elemento DOM de la pestaña que fue clickeada.
 * @param {'usuario'|'admin'} role - Identificador del rol asociado a esa pestaña.
 */
function selectRole(el, role) {
  // Quitar la clase activa de TODAS las pestañas antes de marcar la nueva
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  rolSeleccionado = role;
}

/**
 * Valida las credenciales del formulario y, si son correctas, inicia sesión.
 *
 * Pasos internos:
 *  1. Lee correo y contraseña del formulario.
 *  2. Busca coincidencia en el arreglo de usuarios predefinidos.
 *  3. Si no hay coincidencia → muestra alerta de error.
 *  4. Si hay coincidencia → guarda el usuario en localStorage y redirige.
 *
 * Rutas de redirección:
 *  - Rol `admin`   → `../html/admin.html`
 *  - Rol `usuario` → `../html/datos-personales.html`
 *
 *   Las credenciales están hardcodeadas en el cliente (solo para prototipo).
 *     En producción deberían validarse contra un servidor seguro.
 */
function ingresar() {
  const correo = document.querySelector('input[type="email"]').value.trim();
  const clave  = document.querySelector('input[type="password"]').value.trim();

  /**
   * Lista de usuarios válidos del sistema (credenciales de prueba).
   * @type {Array<{correo: string, clave: string, rol: 'usuario'|'admin'}>}
   */
  const usuarios = [
    { correo: 'usuario@eam.edu.co', clave: '1234', rol: 'usuario' },
    { correo: 'admin@eam.edu.co',   clave: '1234', rol: 'admin'   },
  ];

  // Buscar un usuario cuyo correo Y clave coincidan exactamente
  const match = usuarios.find(u => u.correo === correo && u.clave === clave);

  if (!match) {
    alert('Credenciales incorrectas. Intente de nuevo.');
    return;
  }

  // Persistir sesión: otros módulos leen esta clave para saber quién está logueado
  localStorage.setItem('hv_usuario', JSON.stringify(match));

  // Redirigir según rol
  window.location.href = match.rol === 'admin'
    ? '../html/admin.html'
    : '../html/datos-personales.html';
}
