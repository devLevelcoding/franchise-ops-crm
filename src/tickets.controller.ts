import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('shopId') shopId?: string,
    @Query('status') status?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (shopId) where.shopId = +shopId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }, include: { shop: true },
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Post()
  create(@Body() body: any) {
    const { shopId, title, body: text, priority, category, status } = body;
    return this.prisma.ticket.create({
      data: { shopId: +shopId, title, body: text, priority, category, status },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'body', 'response', 'priority', 'category', 'status']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    return this.prisma.ticket.update({ where: { id: +id }, data });
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.prisma.ticket.update({ where: { id: +id }, data: { status: 'closed', closedAt: new Date() } });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.ticket.delete({ where: { id: +id } });
  }
}
