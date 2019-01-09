export default name => name.replace(/[^a-z0-9]/g, (s) => {
  const c = s.charCodeAt(0);
  if (c >= 65 && c <= 90) return s.toLowerCase();
  return '-';
});
