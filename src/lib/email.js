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

function renderItemsList(items) {
  return items?.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:left;vertical-align:top;">
        <div style="font-size:14px;font-weight:700;color:#111827;line-height:1.4;">${item.name}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">Size: ${item.size || 'Standard'} &nbsp;·&nbsp; Qty: ${item.quantity}</div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:top;font-size:14px;font-weight:700;color:#111827;white-space:nowrap;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `).join('') || '';
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
      ? `<div style="background:#fff8f0;border:1px solid #ffe0c0;padding:14px 16px;border-radius:12px;margin:20px 0;text-align:left;">
          <p style="color:#d97706;font-size:13px;font-weight:bold;margin:0 0 4px;">⚠️ Refund Processing</p>
          <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.5;">Your payment of <strong>₹${order.totalAmount}</strong> is currently being reviewed and prepared for refund to your account.</p>
         </div>`
      : `<div style="background:#f9fafb;border:1px solid #f3f4f6;padding:14px 16px;border-radius:12px;margin:20px 0;text-align:left;">
          <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.5;">Payment Method: <strong>${order.paymentMethod}</strong> (No charge was processed).</p>
         </div>`;

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
  <meta name="color-scheme" content="light dark"/>
</head>
<body style="margin:0;padding:16px 8px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
        <tr><td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 20px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:13px;">Nature's Goodness, Preserved</p>
        </td></tr>
        <tr><td style="padding:28px 20px;text-align:center;">
          <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 10px;">Order Cancellation Confirmed</h2>
          <p style="color:#4b5563;font-size:14px;margin:0 0 16px;line-height:1.6;">
            Hi <strong style="color:#111827;">${userName || 'Customer'}</strong>,<br/>
            Your order <strong>${orderIdShort}</strong> has been successfully cancelled.
          </p>
          
          ${paymentNotice}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
            ${renderItemsList(order.items)}
          </table>

          <div style="border-top:2px solid #f97316;padding-top:14px;margin-top:14px;text-align:right;">
            <span style="font-size:15px;font-weight:800;color:#111827;">Total Amount: ₹${order.totalAmount}</span>
          </div>
        </td></tr>
        <tr><td style="background:#fef3c7;padding:14px 20px;text-align:center;border-top:1px solid #fde68a;">
          <p style="color:#92400e;font-size:12px;margin:0;line-height:1.5;">Questions? Contact customer care at <strong>care@amdriets.com</strong></p>
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
      ? `<p style="color:#6b7280;font-size:12px;margin:6px 0 0;font-family:monospace;">Refund Ref ID: <strong>${order.razorpayRefundId}</strong></p>`
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
  <meta name="color-scheme" content="light dark"/>
</head>
<body style="margin:0;padding:16px 8px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
        <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:28px 20px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:13px;">Refund Notification</p>
        </td></tr>
        <tr><td style="padding:28px 20px;text-align:center;">
          <div style="width:48px;height:48px;background:#ecfdf5;border-radius:50%;margin:0 auto 16px;line-height:48px;font-size:24px;color:#10b981;">✓</div>
          <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 10px;">Refund Issued</h2>
          <p style="color:#4b5563;font-size:14px;margin:0 0 20px;line-height:1.6;">
            Hi <strong style="color:#111827;">${userName || 'Customer'}</strong>,<br/>
            Your refund of <strong style="color:#10b981;font-size:18px;">₹${order.totalAmount}</strong> for order <strong>${orderIdShort}</strong> has been successfully issued.
          </p>
          
          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:12px;margin:16px 0;text-align:left;">
            <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0 0 6px;">Refund Summary</p>
            <p style="color:#475569;font-size:13px;margin:0 0 4px;">Amount: <strong>₹${order.totalAmount}</strong></p>
            <p style="color:#475569;font-size:13px;margin:0 0 4px;">Payment Method: <strong>${order.paymentMethod}</strong></p>
            ${refundIdHtml}
            <p style="color:#059669;font-size:12px;font-weight:700;margin:10px 0 0;line-height:1.4;">⏱ Expected credit timeline: 5–7 business days to your original payment method.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:14px 20px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:12px;margin:0;">Thank you for shopping with AM DRIETS · care@amdriets.com</p>
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

export async function sendOrderConfirmationEmail(order, userEmail, userName) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV EMAIL] Order confirmation email for order ${order._id} to ${userEmail}`);
    return;
  }

  try {
    const transporter = createTransporter();
    const orderIdShort = `#AMD-${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}`;

    const address = order.shippingAddress;
    const addressHtml = address ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:12px;margin:18px 0;text-align:left;">
        <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 6px;">Delivery Address</p>
        <p style="color:#374151;font-size:13px;margin:0 0 3px;"><strong>${address.name}</strong> (${address.phone})</p>
        <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.5;">${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pinCode}</p>
      </div>
    ` : '';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"AM DRIETS" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Order Confirmed - ${orderIdShort}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light dark"/>
</head>
<body style="margin:0;padding:16px 8px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
        <tr><td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 20px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:13px;">Thank You For Your Order!</p>
        </td></tr>
        <tr><td style="padding:28px 20px;text-align:center;">
          <div style="width:48px;height:48px;background:#fff7ed;border-radius:50%;margin:0 auto 16px;line-height:48px;font-size:24px;color:#f97316;">📦</div>
          <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 10px;">Order Confirmation</h2>
          <p style="color:#4b5563;font-size:14px;margin:0 0 16px;line-height:1.6;">
            Hi <strong style="color:#111827;">${userName || 'Customer'}</strong>,<br/>
            We have received your order <strong style="color:#f97316;">${orderIdShort}</strong>. We are preparing it for dispatch!
          </p>
          
          ${addressHtml}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
            ${renderItemsList(order.items)}
          </table>

          <div style="border-top:2px solid #f97316;padding-top:14px;margin-top:14px;text-align:right;">
            <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Payment Method: <strong style="color:#111827;">${order.paymentMethod}</strong> (${order.paymentStatus})</p>
            <p style="font-size:18px;font-weight:800;color:#ea580c;margin:0;">Total Paid: ₹${order.totalAmount}</p>
          </div>
        </td></tr>
        <tr><td style="background:#fff7ed;padding:14px 20px;text-align:center;border-top:1px solid #ffedd5;">
          <p style="color:#9a3412;font-size:12px;margin:0;line-height:1.5;">Need assistance? Reply to this email or reach us at <strong>care@amdriets.com</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err) {
    console.error('Send Order Confirmation Email Error:', err);
  }
}
