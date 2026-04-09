let rolSeleccionado = 'usuario';

  function selectRole(el, role) {
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    rolSeleccionado = role;
  }

function ingresar() {
  const correo = document.querySelector('input[type="email"]').value.trim();
  const clave  = document.querySelector('input[type="password"]').value.trim();

  const usuarios = [
    { correo: 'usuario@eam.edu.co', clave: '1234', rol: 'usuario' },
    { correo: 'admin@eam.edu.co',   clave: '1234', rol: 'admin'   },
  ];

  const match = usuarios.find(u => u.correo === correo && u.clave === clave);

  if (!match) {
    alert('Credenciales incorrectas. Intente de nuevo.');
    return;
  }

  localStorage.setItem('hv_usuario', JSON.stringify(match));

  window.location.href = match.rol === 'admin' ? 'admin.html' : '../html/datos-personales.html';
}