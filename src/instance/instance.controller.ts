import { Body, Controller, Get, Post, Query, Req, Put, Delete } from '@nestjs/common';
import { Request } from 'express';
import { InstanceService } from './instance.service';
import { checkInput, checkNameIntegrity, formatSampleResults } from 'libs/utils';
import { checkFileExist } from 'libs/file';
import { getDistPath } from '../../libs/path';


@Controller('/instance')
export class InstanceController {
  constructor(
    private readonly instanceService: InstanceService,
  ) {}

  @Get('/init')
  async init(@Req() req: Request, @Query() query , @Body() body) {
    const baseDir = query.rootDir,
      distDir = query.distDir,
      instanceDir = query.instanceDir,
      nginxDir = query.nginxDir;
    const initResult = await this.instanceService.init({baseDir, distDir, instanceDir, nginxDir})
    return initResult
  }

  @Get('/create')
  async create(@Req() req: Request, @Query() query , @Body() body) {
    const name = query.name,
      api = query.api,
      port = query.port;

    const validateResult = checkInput({name, api, port})
    if (!validateResult.ok) {
      return validateResult
    }
    return this.instanceService.createInstance(name, api, port)
  }

  @Get('update-dist')
  async updateDist(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    const name = query.name

    const validateResult = formatSampleResults(await Promise.all([checkInput({name}), checkNameIntegrity(name)]))
    if (!validateResult.ok) {
      return validateResult
    }
    
    return await this.instanceService.updateInstance(name)
  }
  
  @Get('update-api')
  async updateApi(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    const name = query.name,
    api = query.api
    
    const validateResult = formatSampleResults(await Promise.all([checkInput({name, api}), checkNameIntegrity(name)]))
    if (!validateResult.ok) {
      return validateResult
    }

    return await this.instanceService.updateApi(name, api)
  }
  @Get('remove')
  async remove(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    const name = query.name;

    const validateResult = checkInput({name})
    if (!validateResult.ok) {
      return validateResult
    }

    return await this.instanceService.removeInstance(name)
  }
  @Get('remove-all')
  async removeAll(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    return await this.instanceService.removeAll()
  }
  @Get('list-port')
  async listPorts(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    return { ok: true }
  }
  @Get('check-port')
  async checkPort(@Req() req: Request, @Query() query , @Body() body): Promise<any> {
    const port = query.port

    const validateResult = checkInput({port})
    if (!validateResult.ok) {
      return validateResult
    }

    return this.instanceService.checkPort(port)
  }

  @Get('test') 
  async test() {
    const result = await checkFileExist(getDistPath()+'/jmeter.log')
    return result
  }
}
