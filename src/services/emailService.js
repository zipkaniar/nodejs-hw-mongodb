import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  JWT_SECRET,
  APP_DOMAIN,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendResetEmail = async (userEmail) => {
  try {
    const token = jwt.sign({ email: userEmail }, JWT_SECRET, {
      expiresIn: '5m',
    });

    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Şifre Sıfırlama" <${SMTP_FROM}>`,
      to: userEmail,
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <p>Merhaba,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
        <p>Bu bağlantı 5 dakika içinde geçerliliğini yitirecektir.</p>
        <p>Eğer bu talebi siz oluşturmadıysanız, lütfen bu e-postayı göz ardı edin.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    };
  } catch (error) {
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};
