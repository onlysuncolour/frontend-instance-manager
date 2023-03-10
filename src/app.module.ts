import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstanceModule } from './instance/instance.module';

@Module({
  imports: [InstanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
