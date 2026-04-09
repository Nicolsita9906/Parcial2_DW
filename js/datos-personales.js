document.querySelectorAll('.radio-opt').forEach(opt => {
    opt.addEventListener('click', function() {
      const group = this.closest('.radio-group');
      group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
    });
});

const u = JSON.parse(localStorage.getItem('hv_usuario') || '{}');
document.getElementById('header-usuario').textContent = u.correo || '';