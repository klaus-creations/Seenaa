import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(private readonly mailService: MailService) {}

  @Post('/send-email')
  async sendEmail(
    @Body()
    body: {
      to: string;
      subject: string;
      message: string;
    },
  ) {
    const { to, subject, message } = body;

    await this.mailService.sendEmail(
      to,
      subject,
      `
        <h2>${subject}</h2>
        <p>${message}</p>
      `,
      message, // text version
    );

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }
}
