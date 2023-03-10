const path = require('path');

const DIST = 'dist', INSTANCES = 'instances', NGINX = 'nginx.instance.conf';

const dirInfo = {
  root: '../',
  dist: `../${DIST}`,
  instances: `../${INSTANCES}`,
  nginx: `../${NGINX}`,
}

export function getPathByRootPath(_path):string {
  return path.resolve(getRootPath(), _path)
}

export function setConstantDirs({
  baseDir=null,
  distDir=null,
  instanceDir=null,
  nginxDir=null
}) {
  if (baseDir) {
    dirInfo.root = baseDir
    dirInfo.dist = path.resolve(baseDir, DIST)
    dirInfo.instances = path.resolve(baseDir, INSTANCES)
    dirInfo.nginx = path.resolve(baseDir, NGINX)
  }
  if (distDir) {
    dirInfo.dist = distDir
  }
  if (instanceDir) {
    dirInfo.instances = instanceDir
  }
  if (nginxDir) {
    dirInfo.nginx = nginxDir
  }
}

export function getRootPath() {
  return dirInfo.root
}

export function getDistPath() {
  return dirInfo.dist
}

export function getInstanceDirPath() {
  return dirInfo.instances
}

export function getNginxDirPath() {
  return dirInfo.nginx
}

export function getInstancePath(name) {
  return path.resolve(getInstanceDirPath(), name)
}

export function getNginxPath(name, full = false) {
  return path.resolve(getNginxDirPath(), `${name}${!full && '.conf'}`)
}
