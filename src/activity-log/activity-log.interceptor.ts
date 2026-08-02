import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // 👈 Tambahkan catchError
import { ActivityLogService } from './activity-log.service';
import { LOG_ACTIVITY_KEY } from './log-activity.decorator';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private activityLogService: ActivityLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(
      LOG_ACTIVITY_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse(); // 👈 Ambil object response

    const { method, originalUrl, body } = request;
    const ipAddress = request.headers['x-forwarded-for'] || request.ip;
    const userId = request.user?.sub;

    // Bersihkan data sensitif
    const safeBody = { ...body };
    delete safeBody.password;

    return next.handle().pipe(
      // 👇 Berjalan jika request SUKSES (2xx)
      tap(() => {
        this.activityLogService.logAction({
          userId,
          action,
          method,
          url: originalUrl,
          details: safeBody,
          ipAddress,
          statusCode: response.statusCode, // Ambil status code sukses
        });
      }),
      // 👇 Berjalan jika request GAGAL / ERROR (4xx, 5xx)
      catchError((error) => {
        // Dapatkan status code dari error (jika bukan HttpException, set 500)
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        this.activityLogService.logAction({
          userId,
          action: `${action}_FAILED`, // Opsional: Tambahkan penanda gagal
          method,
          url: originalUrl,
          details: { ...safeBody, error: error.message }, // Simpan pesan error
          ipAddress,
          statusCode,
        });

        // Lempar kembali error-nya agar tidak mengganggu flow NestJS
        return throwError(() => error);
      }),
    );
  }
}