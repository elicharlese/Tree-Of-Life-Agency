import nodemailer from 'nodemailer';
import { logger } from '../middleware/logging';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
const templates: Record<string, (data: any) => EmailTemplate> = {
  'password-reset': (data) => ({
    subject: 'Tree of Life Agency - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .warning { background: #fef3cd; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tree of Life Agency</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${data.firstName},</p>
              <p>We received a request to reset your password for your Tree of Life Agency account. If you made this request, click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              <p>This link will expire in ${data.expiresIn}.</p>
              <div class="warning">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              <p>For security reasons, this link can only be used once and will expire automatically.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Tree of Life Agency. Please do not reply to this email.</p>
              <p>If you have any questions, contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Tree of Life Agency - Password Reset Request
      
      Hello ${data.firstName},
      
      We received a request to reset your password for your Tree of Life Agency account.
      
      If you made this request, visit this link to reset your password:
      ${data.resetUrl}
      
      This link will expire in ${data.expiresIn}.
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      For security reasons, this link can only be used once and will expire automatically.
      
      This is an automated message from Tree of Life Agency. Please do not reply to this email.
    `,
  }),

  'password-reset-confirmation': (data) => ({
    subject: 'Tree of Life Agency - Password Reset Successful',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tree of Life Agency</h1>
            </div>
            <div class="content">
              <h2>Password Reset Successful</h2>
              <p>Hello ${data.firstName},</p>
              <div class="success">
                <strong>Success!</strong> Your password has been successfully reset.
              </div>
              <p>Your password was changed on ${data.resetTime}.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a unique, strong password</li>
                <li>Enabling two-factor authentication</li>
                <li>Not sharing your login credentials</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from Tree of Life Agency. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Tree of Life Agency - Password Reset Successful
      
      Hello ${data.firstName},
      
      Your password has been successfully reset on ${data.resetTime}.
      
      If you didn't make this change, please contact our support team immediately.
      
      For your security, we recommend:
      - Using a unique, strong password
      - Enabling two-factor authentication
      - Not sharing your login credentials
      
      This is an automated message from Tree of Life Agency. Please do not reply to this email.
    `,
  }),

  'password-change-confirmation': (data) => ({
    subject: 'Tree of Life Agency - Password Changed',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .info { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tree of Life Agency</h1>
            </div>
            <div class="content">
              <h2>Password Changed</h2>
              <p>Hello ${data.firstName},</p>
              <div class="info">
                <strong>Security Notice:</strong> Your account password has been changed.
              </div>
              <p>Your password was changed on ${data.changeTime}.</p>
              <p>If you didn't make this change, please contact our support team immediately and consider:</p>
              <ul>
                <li>Changing your password again</li>
                <li>Reviewing your account activity</li>
                <li>Enabling two-factor authentication</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from Tree of Life Agency. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Tree of Life Agency - Password Changed
      
      Hello ${data.firstName},
      
      Your account password has been changed on ${data.changeTime}.
      
      If you didn't make this change, please contact our support team immediately and consider:
      - Changing your password again
      - Reviewing your account activity
      - Enabling two-factor authentication
      
      This is an automated message from Tree of Life Agency. Please do not reply to this email.
    `,
  }),

  'invitation': (data) => ({
    subject: `You're invited to join Tree of Life Agency as ${data.role}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to Tree of Life Agency</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .highlight { background: #fef3cd; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tree of Life Agency</h1>
              <p>You're Invited!</p>
            </div>
            <div class="content">
              <h2>Welcome to Tree of Life Agency</h2>
              <p>Hello,</p>
              <p>${data.inviterName} has invited you to join Tree of Life Agency as a <strong>${data.role}</strong>.</p>
              ${data.message ? `<div class="highlight"><p><strong>Personal Message:</strong></p><p>${data.message}</p></div>` : ''}
              <p>Click the button below to accept your invitation and create your account:</p>
              <p style="text-align: center;">
                <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
              </p>
              <p>This invitation will expire on ${data.expiresAt}.</p>
              <p>As a ${data.role}, you'll have access to:</p>
              <ul>
                ${data.permissions.map((permission: string) => `<li>${permission}</li>`).join('')}
              </ul>
            </div>
            <div class="footer">
              <p>This invitation was sent by ${data.inviterName} (${data.inviterEmail})</p>
              <p>If you have any questions, please contact them directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Tree of Life Agency - You're Invited!
      
      Hello,
      
      ${data.inviterName} has invited you to join Tree of Life Agency as a ${data.role}.
      
      ${data.message ? `Personal Message: ${data.message}` : ''}
      
      Click this link to accept your invitation and create your account:
      ${data.invitationUrl}
      
      This invitation will expire on ${data.expiresAt}.
      
      As a ${data.role}, you'll have access to:
      ${data.permissions.map((permission: string) => `- ${permission}`).join('\n')}
      
      This invitation was sent by ${data.inviterName} (${data.inviterEmail})
      If you have any questions, please contact them directly.
    `,
  }),
};

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.RESEND_API_KEY) {
    // Use Resend
    return nodemailer.createTransporter({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  } else if (process.env.EMAIL_SMTP_HOST) {
    // Use custom SMTP
    return nodemailer.createTransporter({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
      secure: process.env.EMAIL_SMTP_PORT === '465',
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });
  } else {
    // Development mode - use Ethereal
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

// Send email function
export const sendEmail = async (emailData: EmailData): Promise<void> => {
  try {
    const { to, template, data } = emailData;

    // Get template
    const templateFunc = templates[template];
    if (!templateFunc) {
      throw new Error(`Email template '${template}' not found`);
    }

    const emailTemplate = templateFunc(data);
    const transporter = createTransporter();

    // Send email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@treeoflifeagency.com',
      to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    logger.info('Email sent successfully', {
      to,
      template,
      messageId: info.messageId,
    });

    // Log preview URL in development
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info('Email preview URL', { previewUrl });
      }
    }
  } catch (error) {
    logger.error('Failed to send email', {
      error,
      to: emailData.to,
      template: emailData.template,
    });
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails: EmailData[]): Promise<void> => {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  const failed = results.filter(result => result.status === 'rejected');
  if (failed.length > 0) {
    logger.error('Some bulk emails failed to send', {
      totalEmails: emails.length,
      failedCount: failed.length,
      failures: failed.map(f => (f as PromiseRejectedResult).reason),
    });
  }

  logger.info('Bulk email sending completed', {
    totalEmails: emails.length,
    successCount: results.length - failed.length,
    failedCount: failed.length,
  });
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed', { error });
    return false;
  }
};
