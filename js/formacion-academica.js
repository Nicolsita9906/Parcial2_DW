const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
document.getElementById('header-usuario').textContent = u.correo || '';