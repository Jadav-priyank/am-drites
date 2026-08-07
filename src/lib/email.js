import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST || '';
  const isGmail = host.includes('gmail');

  return nodemailer.createTransport({
    ...(isGmail
      ? { service: 'gmail' }
      : {
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
      }),
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
  });
}

export async function sendOrderCancellationEmail(order, userEmail, userName) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV EMAIL] Cancellation email for order ${order._id} to ${userEmail}`);
    return;
  }

  try {
    const transporter = createTransporter();
    const orderIdShort = `#AMD-${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}`;

    const isPrepaid = order.paymentMethod === 'UPI' || order.paymentMethod === 'CARD' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Refund Pending';
    
    const paymentNotice = isPrepaid
      ? `<div style="background:#fff8f0;border:1px solid #ffe0c0;padding:14px;border-radius:12px;margin:20px 0;text-align:left;">
          <p style="color:#d97706;font-size:13px;font-weight:bold;margin:0 0 4px;">⚠️ Refund Processing</p>
          <p style="color:#666666;font-size:13px;margin:0;">Your payment of <strong>₹${order.totalAmount}</strong> is currently being reviewed and prepared for refund to your account.</p>
         </div>`
      : `<div style="background:#f5f5f5;padding:14px;border-radius:12px;margin:20px 0;text-align:left;">
          <p style="color:#555555;font-size:13px;margin:0;">Payment Method: <strong>${order.paymentMethod}</strong> (No charge was processed).</p>
         </div>`;

    const itemsListHtml = order.items?.map(item => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#333333;font-size:13px;font-weight:bold;">${item.name} (${item.size})</td>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666666;font-size:13px;text-align:center;">Qty: ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#1a1a1a;font-size:13px;font-weight:bold;text-align:right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('') || '';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"AM DRIETS" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Order Cancelled - ${orderIdShort}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#f5f5f5 !important; font-family:Arial,sans-serif; }
  </style>
</head>
<body style="margin:0;padding:20px 0;background:#f5f5f5 !important;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0"
             style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ffe0c0;">
        <tr><td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 24px;text-align:center;">
          <h1 style="color:#ffffff !important;margin:0;font-size:26px;font-weight:900;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.88) !important;margin:6px 0 0;font-size:13px;">Nature's Goodness, Preserved</p>
        </td></tr>
        <tr><td style="background:#ffffff !important;padding:32px 24px;text-align:center;">
          <h2 style="color:#1a1a1a !important;font-size:20px;font-weight:700;margin:0 0 10px;">Order Cancellation Confirmed</h2>
          <p style="color:#555555 !important;font-size:14px;margin:0 0 16px;line-height:1.6;">
            Hi <strong style="color:#1a1a1a !important;">${userName || 'Customer'}</strong>,<br/>
            Your order <strong>${orderIdShort}</strong> has been successfully cancelled as requested.
          </p>
          
          ${paymentNotice}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
            ${itemsListHtml}
          </table>

          <div style="border-top:2px solid #f97316;padding-top:12px;margin-top:12px;text-align:right;">
            <span style="font-size:14px;font-weight:bold;color:#1a1a1a;">Total Amount: ₹${order.totalAmount}</span>
          </div>
        </td></tr>
        <tr><td style="background:#fdf3eb !important;padding:14px 24px;text-align:center;border-top:1px solid #ffe0c0;">
          <p style="color:#888888 !important;font-size:11px;margin:0;">If you have any questions, reply to this email or contact support at care@amdriets.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err) {
    console.error('Send Order Cancellation Email Error:', err);
  }
}

export async function sendRefundConfirmationEmail(order, userEmail, userName) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV EMAIL] Refund email for order ${order._id} to ${userEmail}`);
    return;
  }

  try {
    const transporter = createTransporter();
    const orderIdShort = `#AMD-${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}`;

    const refundIdHtml = order.razorpayRefundId
      ? `<p style="color:#666666;font-size:12px;margin:4px 0 0;font-family:monospace;">Refund Reference ID: <strong>${order.razorpayRefundId}</strong></p>`
      : '';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"AM DRIETS" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Refund Processed - ${orderIdShort}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#f5f5f5 !important; font-family:Arial,sans-serif; }
  </style>
</head>
<body style="margin:0;padding:20px 0;background:#f5f5f5 !important;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0"
             style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:28px 24px;text-align:center;">
          <h1 style="color:#ffffff !important;margin:0;font-size:26px;font-weight:900;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.9) !important;margin:6px 0 0;font-size:13px;">Refund Notification</p>
        </td></tr>
        <tr><td style="background:#ffffff !important;padding:32px 24px;text-align:center;">
          <div style="width:48px;height:48px;background:#ecfdf5;border-radius:50%;margin:0 auto 16px;line-height:48px;font-size:24px;color:#10b981;">✓</div>
          <h2 style="color:#1a1a1a !important;font-size:20px;font-weight:700;margin:0 0 10px;">Refund Issued</h2>
          <p style="color:#555555 !important;font-size:14px;margin:0 0 20px;line-height:1.6;">
            Hi <strong style="color:#1a1a1a !important;">${userName || 'Customer'}</strong>,<br/>
            Your refund of <strong style="color:#10b981 !important;font-size:18px;">₹${order.totalAmount}</strong> for order <strong>${orderIdShort}</strong> has been successfully processed.
          </p>
          
          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:12px;margin:16px 0;text-align:left;">
            <p style="color:#334155;font-size:13px;font-weight:bold;margin:0 0 4px;">Refund Summary</p>
            <p style="color:#666666;font-size:13px;margin:0 0 2px;">Amount: <strong>₹${order.totalAmount}</strong></p>
            <p style="color:#666666;font-size:13px;margin:0 0 2px;">Payment Method: <strong>${order.paymentMethod}</strong></p>
            ${refundIdHtml}
            <p style="color:#059669;font-size:12px;font-weight:bold;margin:8px 0 0;">⏱ Expected credit timeline: 5–7 business days to your account.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc !important;padding:14px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#888888 !important;font-size:11px;margin:0;">Thank you for shopping with AM DRIETS. For support, contact care@amdriets.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err) {
    console.error('Send Refund Confirmation Email Error:', err);
  }
}
