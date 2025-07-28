const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendPasswordResetEmail(to, resetToken, userId) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${userId}/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Password Reset - AlgoJudgeX',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #161A30; color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #00FFC6; font-size: 24px; font-weight: bold; }
            .content { background-color: #1E1E2E; padding: 30px; border-radius: 10px; }
            .button { 
              display: inline-block; 
              background-color: #00FFC6; 
              color: #000000; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧠 AlgoJudgeX</div>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your AlgoJudgeX account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetURL}" class="button">Reset Password</a>
              </p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>Best regards,<br>The AlgoJudgeX Team</p>
            </div>
            <div class="footer">
              <p>© 2025 AlgoJudgeX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(to, username) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Welcome to AlgoJudgeX!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #161A30; color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #00FFC6; font-size: 24px; font-weight: bold; }
            .content { background-color: #1E1E2E; padding: 30px; border-radius: 10px; }
            .button { 
              display: inline-block; 
              background-color: #00FFC6; 
              color: #000000; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧠 AlgoJudgeX</div>
            </div>
            <div class="content">
              <h2>Welcome to AlgoJudgeX, ${username}! 🎉</h2>
              <p>Thank you for joining our AI-powered coding platform!</p>
              <p>With AlgoJudgeX, you can:</p>
              <ul>
                <li>🧠 Get AI-powered code analysis and hints</li>
                <li>💻 Solve coding problems with instant feedback</li>
                <li>📊 Track your progress with detailed analytics</li>
                <li>🏆 Participate in coding contests</li>
                <li>📈 Visualize your coding activity with heatmaps</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Start Coding Now</a>
              </p>
              <p>Happy coding!</p>
              <p>The AlgoJudgeX Team</p>
            </div>
            <div class="footer">
              <p>© 2025 AlgoJudgeX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
