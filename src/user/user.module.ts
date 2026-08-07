import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
