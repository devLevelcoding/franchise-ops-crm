import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { city: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.shop.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.shop.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.shop.findUnique({
      where: { id: +id },
      include: { inspections: true, tasks: true, tickets: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { name, code, address, city, phone, status, notes } = body;
    return this.prisma.shop.create({
      data: { name, code, address, city, phone, status, notes },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const allowed = ['name', 'code', 'address', 'city', 'phone', 'status', 'notes'];
    const data: any = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];
    return this.prisma.shop.update({ where: { id: +id }, data });
  }

  // Opening/Closing in the source platform are full standalone pipeline
  // models (30+ fields each: owner contacts, financial/juridical review,
  // promise + rent contracts, payment schedules...) sized for a real-estate
  // team onboarding dozens of locations a year. A 2-10 location chain just
  // needs "this shop is opening" / "this shop is closing" as a status plus a
  // checklist — see Task below — so that's what this collapses to.
  @Post(':id/open')
  markOpen(@Param('id') id: string) {
    return this.prisma.shop.update({ where: { id: +id }, data: { status: 'active', openedAt: new Date() } });
  }

  @Post(':id/close')
  markClosed(@Param('id') id: string) {
    return this.prisma.shop.update({ where: { id: +id }, data: { status: 'closed', closedAt: new Date() } });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.shop.update({ where: { id: +id }, data: { deletedAt: new Date() } });
  }
}
