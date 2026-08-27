import { Body, Controller, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RolesGuard } from 'src/auth/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ActivityLogInterceptor } from 'src/activity-log/activity-log.interceptor';
import { LogActivity } from 'src/activity-log/log-activity.decorator';
import { CreateQrisDto } from './dto/create-qris.dto';

@Controller('payment')
@UseInterceptors(ActivityLogInterceptor)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @LogActivity('Get History Payment')
    async getPaymentHistory(@Req() req: any) {
        const userId = req.user.sub;
        return this.paymentService.getPaymentHistory(userId);
    }

    @Post('qris')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @LogActivity('Create QRIS Transaction')
    async createQrisTransaction(@Body() createQrisDto: CreateQrisDto, @Req() req: any) {
        // Ambil userId dari token JWT yang memanggil endpoint ini
        const userId = req.user.sub;
        const method = createQrisDto.method;
        
        if (method == 'qris') return this.paymentService.generateQrisTransaction(userId, createQrisDto);
    }

    @Get('status/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async checkPaymentStatus(@Param('orderId') orderId: string) {
        return this.paymentService.getPaymentStatus(orderId);
    }

    @Post('notification')
    async handlerPaymentNotification(@Body() notificationData: any) {
        return this.paymentService.handlePaymentNotification(notificationData);
    }
}
