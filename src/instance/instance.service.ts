import { Injectable } from '@nestjs/common';
import { getDistPath, getInstanceDirPath, getInstancePath, getNginxDirPath, setConstantDirs } from 'libs/path';
import { checkDistFile, initDir, mkdir, moveDistFile } from 'libs/file';
import { getPort, listAllPort, mkNginxFile, rmNginxFile } from 'libs/nginx';
import { formatSampleResults, getAvailablePort, removeFile } from 'libs/utils';
import { checkPortOpen, reloadNginx } from 'libs/exec';
import { getErrorReturn, getSuccessReturn } from '../../libs/utils';

@Injectable()
export class InstanceService {
  constructor(
  ) {}
  init(dirs) {
    setConstantDirs(dirs)
    return new Promise((res) => {
      initDir().then(resp => {
        res(resp)
      })
    })
  }
  async createInstance(name: string, apiUrl: string, port: number) {
    const checkDistResult = await checkDistFile()
    if (!checkDistResult.ok) {
      return checkDistResult
    }
    let ports = [], nginxPort;
    const portsListResult = await listAllPort()
    if (portsListResult.ok && portsListResult.data) {
      ports = portsListResult.data
    }
    if (!!port) {
      const portOpenResult = await checkPortOpen(port)
      if (ports.includes(port) || (portOpenResult.ok && portOpenResult?.data?.open !== false)) {
        return getErrorReturn('该端口已被占用')
      }
      nginxPort = port
    } else {
      const portResult = await getAvailablePort((ports.pop()?.port || 10000) + 1);
      if (portResult.ok) {
        nginxPort = portResult.data.port
      } else {
        return portResult
      }
    }
    const results = await Promise.all([
      this.transDistFile(name),
      mkNginxFile(nginxPort, apiUrl, name)
    ])
    if (formatSampleResults(results).ok) {
      return getSuccessReturn({port: nginxPort})
    }
  }
  async removeInstance(name: string) {
    const results = await Promise.all([
      removeFile(getInstancePath(name)),
      rmNginxFile(name)
    ])
    
    return formatSampleResults(results)
  }
  async updateInstance(name: string) {
    const checkDistResult = await checkDistFile()
    if (!checkDistResult.ok) {
      return checkDistResult
    }
    const result = await this.transDistFile(name)
    return result
  }
  async updateApi(name: string, apiUrl: string) {
    const port = getPort(name);
    const result = await mkNginxFile(port, apiUrl, name)
    return result
  }
  listInstance() {

  }
  async removeAll() {
    const results = await Promise.all([
      removeFile(getInstanceDirPath()),
      removeFile(getNginxDirPath()),
    ])
    await initDir();
    reloadNginx()
    return formatSampleResults(results)
  }
  async transDistFile(name: string) {
    await removeFile(getInstancePath(name));
    const result = await moveDistFile(name)
    mkdir(getDistPath())
    return result
  }
  async checkPort(port: number) {
    const portOpenResult = await checkPortOpen(port)
    if (portOpenResult.ok && portOpenResult?.data?.open === false) {
      return getSuccessReturn({available: true})
    } else {
      return getSuccessReturn({available: false})
    }
  }
}
