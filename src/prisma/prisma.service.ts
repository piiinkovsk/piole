import { INestApplication, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }
  
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.warn('Failed to connect to database, running in no-db mode');
      this.logger.warn(error.message);
    }
  }
  
  // For Prisma 5.0.0+, we need to handle shutdown differently
  async enableShutdownHooks(app: INestApplication) {
    // Use process events instead of Prisma's beforeExit
    process.on('beforeExit', async () => {
      try {
        await app.close();
      } catch (error) {
        this.logger.error('Error during app shutdown', error);
      }
    });
  }
}
