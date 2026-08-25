import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('inspections')
export class InspectionsController {
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
      this.prisma.inspection.findMany({
        where, skip, take, orderBy: { scheduledAt: 'desc' }, include: { shop: true },
      }),
      this.prisma.inspection.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Post()
  create(@Body() body: any) {
    const { shopId, type, inspectorName, scheduledAt, status, notes } = body;
    return this.prisma.inspection.create({
      data: {
        shopId: +shopId,
        type,
        inspectorName,
        scheduledAt: new Date(scheduledAt),
        status,
        notes,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['type', 'inspectorName', 'status', 'notes']) if (body[key] !== undefined) data[key] = body[key];
    if (body.scheduledAt !== undefined) data.scheduledAt = new Date(body.scheduledAt);
    if (body.score !== undefined) data.score = body.score === '' ? null : Number(body.score);
    return this.prisma.inspection.update({ where: { id: +id }, data });
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() body: any) {
    const score = body?.score !== undefined && body?.score !== '' ? Number(body.score) : undefined;
    return this.prisma.inspection.update({
      where: { id: +id },
      data: { status: 'completed', completedAt: new Date(), score },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.inspection.delete({ where: { id: +id } });
  }
}
