import { TErrorReturn, TSuccessReturn, getErrorReturn, getSuccessReturn } from "./utils";

const { exec } = require("child_process");

export async function reloadNginx() {
  await new Promise(res => {
    exec("nginx -s reload", (error, stdout, stderr) => {
      if (error) {
        res(getErrorReturn(error))
        return
      }
      if (stderr) {
        res(getErrorReturn(stderr))
        return
      }
      res(getSuccessReturn({stdout: stdout}))
    })
  })
}

interface TPortOpenSuccessReturn extends TSuccessReturn {
  data?: {
    open?: boolean;
    stdout?: string;
  }
};

export async function checkPortOpen(port: number):Promise<TPortOpenSuccessReturn | TErrorReturn> {
  const result:(TPortOpenSuccessReturn | TErrorReturn) = await new Promise(res => {
    // exec(`lsof -i -P -n | grep LISTEN`, (error, stdout, stderr) => {
    exec(`lsof -i:${port}`, (error, stdout, stderr) => {
      console.log({
        error, stdout, stderr
      })
      if (error) {
        if (error?.message?.includes('Command failed') && stdout === '') {
          return res(getSuccessReturn({open: false, stdout: stdout}))
        }
        return res(getErrorReturn(error))
      }
      if (stderr) {
        return res(getErrorReturn(stderr))
      }
      res(getSuccessReturn({stdout: stdout, open: true}))
    })
  })
  return result
}