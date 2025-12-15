import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      await this.transporter.sendMail({
        from: `"${this.configService.get(
          'FROM_NAME',
        )}" <${this.configService.get('FROM_EMAIL')}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Email sending failed', error);
      throw error;
    }
  }
}
