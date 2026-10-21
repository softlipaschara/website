document.querySelectorAll<HTMLAnchorElement>('a[data-back-button]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
});
