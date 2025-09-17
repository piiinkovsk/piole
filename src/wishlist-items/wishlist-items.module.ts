import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WishlistItemsService } from './wishlist-items.service';
import { WishlistItemsController } from './wishlist-items.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WishlistItemsController],
  providers: [WishlistItemsService],
  exports: [WishlistItemsService],
})
export class WishlistItemsModule {}
