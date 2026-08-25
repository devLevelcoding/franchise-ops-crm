import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('tasks')
export class TasksController {
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
      this.prisma.task.findMany({
        where, skip, take, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }], include: { shop: true },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Post()
  create(@Body() body: any) {
    const { shopId, title, description, dueDate, status } = body;
    return this.prisma.task.create({
      data: {
        shopId: +shopId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'description', 'status']) if (body[key] !== undefined) data[key] = body[key];
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    return this.prisma.task.update({ where: { id: +id }, data });
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.prisma.task.update({ where: { id: +id }, data: { status: 'done' } });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.task.delete({ where: { id: +id } });
  }
}
