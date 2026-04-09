document.querySelectorAll('.radio-opt').forEach(opt => {
    opt.addEventListener('click', function() {
      const group = this.closest('.radio-group');
      group.querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
    });
});