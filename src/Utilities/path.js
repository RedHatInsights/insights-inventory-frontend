function getBaseName(pathname) {
  let release = '/';
  const pathName = pathname.split('/');

  pathName.shift();

  return `${release}`;
}

function resolveRelPath(path = '') {
  return `${path.length > 0 ? `/${path}` : ''}`;
}

export { getBaseName, resolveRelPath };
