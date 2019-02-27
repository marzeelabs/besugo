export default (path) => {
  path = path.trim();

  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1);
  }

  return path;
};
