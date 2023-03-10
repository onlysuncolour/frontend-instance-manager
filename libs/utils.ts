import { checkPortOpen } from 'libs/exec';
import { checkFileExist } from './file';
import { getInstancePath, getNginxPath } from './path';
const fse = require('fs-extra')

export type TErrorMsg = NodeJS.ErrnoException | string;
export type TSuccessReturn<T=any> = {
  ok: true,
  data?: T
}
export type TErrorReturn = {
  ok: false,
  msg: TErrorMsg
}

export function getSuccessReturn<T>(data?:T): TSuccessReturn<T> {
  return {ok: true, data}
}

export function getErrorReturn(info: string | NodeJS.ErrnoException): TErrorReturn {
  const msg = typeof info === 'string' ? info : `${info?.name}\n${info?.message}`
  return {ok: false, msg}
}

export function getCallbackReturn(error): (TSuccessReturn | TErrorReturn) {
  if (error) {
    return getErrorReturn(error)
  }
  return getSuccessReturn()
}

export async function removeFile(_path) {
  try {
    await fse.remove(_path)
    return getSuccessReturn()
  } catch (error) {
    return getErrorReturn(error)
  }
}

export function moveFile(from, target):Promise<TSuccessReturn | TErrorReturn> {
  return new Promise(res => {
    fse.move(from, target, err => {
      res(getCallbackReturn(err))
    });
  })
}

export function formatSampleResults(results:(TSuccessReturn | TErrorReturn)[]):(TSuccessReturn | TErrorReturn) {
  const err = results?.find(r => !r.ok)
  if (err) {
    return err
  }
  return getSuccessReturn()
}

export async function getAvailablePort(port) {
  let i = 0
  while (i < 1000) {
    const portOpenResult = await checkPortOpen(port);
    if (portOpenResult.ok && portOpenResult?.data?.open === false) {
      return getSuccessReturn({port})
    }
    port ++;
    i++;
  }
  return getErrorReturn("暂无可用端口")
}

export function checkInput(query = {}) {
  const keys = Object.keys(query).map(key => !query[key]);
  if (keys.length > 0) {
    return getSuccessReturn()
  }
  return getErrorReturn(`${keys.join(',')}字段不能为空`)
}

export async function checkNameIntegrity (name: string) {
  if (!name) {
    return getErrorReturn('name is empty')
  }
  return formatSampleResults(await Promise.all([
    checkFileExist(getInstancePath(name)),
    checkFileExist(getNginxPath(name))
  ]))
}