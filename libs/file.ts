import {readdir, writeFile as fsWriteFile, access } from "fs/promises";
import { mkdir as fsMkdir } from 'node:fs';
import { formatSampleResults, getCallbackReturn, moveFile, getErrorReturn, getSuccessReturn, TSuccessReturn, TErrorReturn } from './utils';
import { getDistPath, getInstanceDirPath, getInstancePath, getNginxDirPath } from './path';

type TMkdir = TSuccessReturn | TErrorReturn;
export function mkdir (url):Promise<TMkdir> {
  return new Promise((res) => {
    fsMkdir(url, { recursive: true }, err=> {
      res(getCallbackReturn(err))
    })
  })
}

export async function initDir() {
  try {
    const results = await Promise.all([
      mkdir(getDistPath()),
      mkdir(getInstanceDirPath()),
      mkdir(getNginxDirPath()),
    ])
    return formatSampleResults(results)
  } catch (error) {
    return getErrorReturn(error)
  }
}

export async function listDistDir() {
  try {
    const files = await readdir(getDistPath())
    return getSuccessReturn(files)
  } catch (error) {
    return getErrorReturn(error)
  }
}

export async function checkFileExist(path: string) {
  try {
    const result = await access(path)
    return getSuccessReturn(result)
  } catch (error) {
    return getErrorReturn(error)
  }
}

export async function writeFile(filename, data) {
  try {
    await fsWriteFile(filename, data);
    return getSuccessReturn()
  } catch (error) {
    return getErrorReturn(error)
  }
}

// 检查dist文件是否存在
export async function checkDistFile() {
  const distDirInfo = await listDistDir()
  if (!distDirInfo.ok) {
    return getErrorReturn('创建失败，请重新init或检查dist文件夹')
  }
  if (distDirInfo.data.length === 0) {
    return getErrorReturn('创建失败，dist文件夹为空')
  }
  return getSuccessReturn()
}

export async function moveDistFile(name) {
  return await moveFile(
    `${getDistPath()}/`,
    `${getInstancePath(name)}/`
  )
}