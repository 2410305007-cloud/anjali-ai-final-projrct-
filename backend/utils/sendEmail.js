// sendEmail.js – simple wrapper using Nodemailer
const transporter = require('../config/email');

// Basic HTML email templates
const welcomeEmail = (name) => `
  <h2>Welcome to IronForge Athletics, ${name}!</h2>
  <p>We're thrilled to have you on board. Explore our premium gym gear and start forging your strength.</p>
`;

const passwordResetEmail = (name, resetUrl) => `
  <h2>Hello ${name},</h2>
  <p>You requested a password reset. Click the link below to set a new password:</p>
  <a href=\"${resetUrl}\">${resetUrl}</a>
  <p>This link will expire in 1 hour.</p>
`;

const orderConfirmationEmail = (name, orderId, total, items) => {
  const list = items.map(i => `<li>${i.name} x${i.quantity} – $${i.price}</li>`).join('');
  return `
    <h2>Hi ${name},</h2>
    <p>Thank you for your order <strong>#${orderId}</strong>. Here are your order details:</p>
    <ul>${list}</ul>
    <p><strong>Total: $${total}</strong></p>
    <p>We will ship your items soon. Thank you for choosing IronForge Athletics!</p>
  `;
};

const shippingUpdateEmail = (name, orderId, trackingUrl) => `
  <h2>Hi ${name},</h2>
  <p>Your order <strong>#${orderId}</strong> has shipped.</p>
  <p>Track your package here: <a href=\"${trackingUrl}\">${trackingUrl}</a></p>
  <p>Thank you for shopping with us!</p>
`;

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, welcomeEmail, passwordResetEmail, orderConfirmationEmail, shippingUpdateEmail };
