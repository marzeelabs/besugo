(() => {
  const form = document.querySelector('form[name="contact-form"]');
  if (form) {
    form.addEventListener('submit', () => {
      form.subject.value = form.subject.value.replace('{name}', form.name.value);
    }, true);
  }
})();
