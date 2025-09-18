import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Ensure at least one content type is provided
    const emailData: any = {
      from: options.from || process.env.FROM_EMAIL || 'noreply@treeoflifeagency.com',
      to: options.to,
      subject: options.subject,
    };

    if (options.html) {
      emailData.html = options.html;
    }
    if (options.text) {
      emailData.text = options.text;
    }

    // If neither html nor text is provided, use text as fallback
    if (!options.html && !options.text) {
      emailData.text = options.subject;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcomeEmail: (userName: string) => ({
    subject: 'Welcome to Tree of Life Agency',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Tree of Life Agency!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining Tree of Life Agency. We're excited to help you with your development projects.</p>
        <p>Your account has been created successfully. You can now access your dashboard and start exploring our services.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Tree of Life Agency Team</p>
      </div>
    `,
    text: `Welcome to Tree of Life Agency! Hello ${userName}, thank you for joining us. Your account has been created successfully.`
  }),

  passwordResetEmail: (resetToken: string, resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>You requested a password reset for your Tree of Life Agency account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Reset Token: ${resetToken}</p>
      </div>
    `,
    text: `Password reset requested. Use this link: ${resetUrl} or token: ${resetToken}`
  }),

  projectStatusUpdate: (projectName: string, status: string, clientName: string) => ({
    subject: `Project Update: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Project Status Update</h1>
        <p>Hello ${clientName},</p>
        <p>We have an update on your project: <strong>${projectName}</strong></p>
        <p>Current Status: <strong style="color: #059669;">${status}</strong></p>
        <p>You can view detailed progress in your client dashboard.</p>
        <p>Thank you for choosing Tree of Life Agency.</p>
        <p>Best regards,<br>Your Project Team</p>
      </div>
    `,
    text: `Project Update: ${projectName} is now ${status}. Hello ${clientName}, check your dashboard for details.`
  }),

  orderConfirmation: (orderNumber: string, clientName: string, projectName: string, amount: number) => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmation</h1>
        <p>Hello ${clientName},</p>
        <p>Thank you for your order! We've received your request and are preparing to get started.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
        </div>
        <p>We'll be in touch soon to discuss project details and timeline.</p>
        <p>Best regards,<br>The Tree of Life Agency Team</p>
      </div>
    `,
    text: `Order Confirmation ${orderNumber}: ${projectName} for $${amount}. Hello ${clientName}, we'll be in touch soon.`
  })
};
