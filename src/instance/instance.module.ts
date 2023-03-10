import { Module } from '@nestjs/common';
import { InstanceController } from './instance.controller';
import { InstanceService } from './instance.service';

@Module({
  imports: [],
  controllers: [InstanceController],
  providers: [InstanceService],
})
export class InstanceModule {}
