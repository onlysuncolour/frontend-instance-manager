import { readFile, readdir } from "node:fs/promises";
import { writeFile } from "./file"
import { getSuccessReturn, getErrorReturn, TSuccessReturn, TErrorReturn, removeFile } from './utils';
import { getNginxPath } from 'libs/path';
import { getNginxDirPath, getInstancePath } from './path';
import { reloadNginx } from "./exec";

export type TPortInfo = {
  port: number,
  name: string
}
interface TPortListSuccessReturn extends TSuccessReturn {
  data: TPortInfo[]
};

const template = 
` server {
      listen @@port@@;
      
      location /api {
          proxy_set_header Host $http_host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
          proxy_connect_timeout 900s;
          proxy_send_timeout 900s;
          proxy_read_timeout 900s;
          proxy_pass @@api@@;
      }
  
      location /alive {
              proxy_set_header Host $http_host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
              proxy_connect_timeout 900s;
              proxy_send_timeout 900s;
              proxy_read_timeout 900s;
              proxy_pass @@api@@;
      }
  }
`

export async function mkNginxFile(port, apiUrl, name): Promise<any> {
  const distPath = getInstancePath(name)
  let nginxConfig = 
    template
      .split('@@port@@').join(port)
      .split('@@api@@').join(apiUrl)
      .split('@@distPath@@').join(distPath);
  const path = getNginxPath(name);
  const result = await writeFile(path, nginxConfig)
  if (result.ok) {
    reloadNginx()
  }
  return result
}

export async function rmNginxFile(name) {
  const result = await removeFile(getInstancePath(name));
  reloadNginx()
  return result
}

export async function getPort(filename) {
  const fileContent = await readFile(getNginxPath(filename), 'utf8')
  return getPortFromContent(fileContent)
}

export async function listAllPort():Promise<(TPortListSuccessReturn | TErrorReturn)> {
  try {
    const files = await readdir(getNginxDirPath());
    const promises = files.map(filename => {
      return readFile(getNginxPath(filename, true), 'utf8')
    })
    const fileContents = await Promise.all(promises)
    const result:TPortInfo[] = fileContents.map((content, i) => {
      return {port: getPortFromContent(content), name: files[i]}
    })
    return getSuccessReturn(result) as TPortListSuccessReturn
  } catch (error) {
    return getErrorReturn(error)
  }
}

function getPortFromContent(content: string) {
  const port = content?.split('listen')?.[1]?.split(';')[0]?.trim()
  if (port) {
    return parseInt(port)
  }
  return null
}
