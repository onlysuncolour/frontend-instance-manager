# Frontend instance manager

## 预备工作

* 制定相应的目录结构，包括 flow打包文件目录 dist，所有前端实例文件夹 instances，nginx实例文件夹 nginx.instance.conf
* 将nginx实例文件夹目录放到 nginx.conf下
* 部署此项目到目标服务器
* 按照下述文档 调用接口即可。

## 接口

### /instance/init
#### alert!!
本接口基本上每个环境仅需要调用一次，除非后续更换目录接口
#### request body
```json
{
  "rootDir": "string, 所有文件夹的默认根目录",
  "distDir": "string, flow打包文件目录，指定后此项将忽略默认根目录",
  "instanceDir": "string, 前端实例文件夹目录，指定后此项将忽略默认根目录",
  "nginxDir": "string, nginx实例文件夹目录，指定后此项将忽略默认根目录",
}
```
#### 接口说明
调用后，生成所有目标文件夹

### /instance/create
#### request body
```json
{
  "name": "string, 实例名，唯一",
  "api": "string, 后端接口url",
  "port": "number, 端口号",
}
```
### response
```JSON
{
  "ok": "boolean, ok为true时表示成功",
  "msg": "string, ok为false时的错误信息",
  "data": {
    "port": "number, 端口号，port不传时会自动生成一个端口"
  } 
}
```
#### 接口说明
调用之后
1. 检查端口
2. 检查dist文件夹是否有前端制品
3. 生成前端实例文件夹
4. 将前端制品move到前端实例文件夹
5. 生成nginx文件

### update-dist
#### request body
```json
{
  "name": "string, 实例名，唯一"
}
```
#### 接口说明
1. 检查dist文件夹是否有前端制品
2. 将前端制品move到前端实例文件夹

### update-api
#### request body
```json
{
  "name": "string, 实例名，唯一",
  "api": "string, 后端接口url"
}
```
#### 接口说明
1. 生成nginx文件

### remove
#### request body
```json
{
  "name": "string, 实例名，唯一"
}
```
#### 接口说明
1. 移除指定实例的所有文件

### remove-all
#### request body
```json
{
}
```
#### 接口说明
1. 移除所有文件
### list-port
#### response
```json
{
  "ok": "boolean",
  "data": [
    {
      "name": "string",
      "port": "number"
    }
  ]
}
```
#### 接口说明
1. 返回instance name 和 port的map数据
### check-port
#### request query
```json
{
  "port": "number"
}
```
#### response
```json
{
  "ok": "boolean",
  "data": [
    {
      "available": "boolean",
      "stdout": "lsof -i:port stdout"
    }
  ]
}
```
#### 接口说明
1. 返回指定port是否可用
