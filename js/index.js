let rolSeleccionado = 'usuario';

  function selectRole(el, role) {
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    rolSeleccionado = role;
  }

  function ingresar() {
    if (rolSeleccionado === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = './html/datos-personales.html';
    }
  }