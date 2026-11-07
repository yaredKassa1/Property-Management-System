const nodemailer = require('nodemailer');

// University configuration
const UNIVERSITY_CONFIG = {
  name: process.env.UNIVERSITY_NAME || 'Woldia University',
  shortName: process.env.UNIVERSITY_SHORT_NAME || 'WDU',
  website: process.env.UNIVERSITY_WEBSITE || 'https://www.wdu.edu.et',
  logoUrl: process.env.UNIVERSITY_LOGO_URL || 'http://localhost:3000/woldia-logo.jpg',
  address: process.env.UNIVERSITY_ADDRESS || 'Woldia, Ethiopia',
  phone: process.env.UNIVERSITY_PHONE || '+251-33-xxx-xxxx',
  email: process.env.UNIVERSITY_EMAIL || 'info@woldia.edu.et',
  primaryColor: '#0066CC',
  secondaryColor: '#FFB81C'
};

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Create reusable transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Email notifications will be skipped.');
    return null;
  }
  return nodemailer.createTransport(emailConfig);
};

// Email template wrapper with university branding
const createEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, ${UNIVERSITY_CONFIG.primaryColor} 0%, ${UNIVERSITY_CONFIG.secondaryColor} 100%); padding: 30px 40px; text-align: center;">
                  <img src="${UNIVERSITY_CONFIG.logoUrl}" alt="${UNIVERSITY_CONFIG.name}" style="max-width: 80px; height: auto; margin-bottom: 15px;">
                  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">${UNIVERSITY_CONFIG.name}</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Property Management System</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: ${UNIVERSITY_CONFIG.primaryColor}; padding: 15px 40px;">
                  <h2 style="color: white; margin: 0; font-size: 20px;">${title}</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 3px solid ${UNIVERSITY_CONFIG.primaryColor};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center; padding-bottom: 15px;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: bold;">${UNIVERSITY_CONFIG.name}</p>
                        <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">${UNIVERSITY_CONFIG.address}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding-bottom: 15px;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                          📧 ${UNIVERSITY_CONFIG.email} | 📞 ${UNIVERSITY_CONFIG.phone}
                        </p>
                        <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">
                          🌐 <a href="${UNIVERSITY_CONFIG.website}" style="color: ${UNIVERSITY_CONFIG.primaryColor}; text-decoration: none;">${UNIVERSITY_CONFIG.website}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                          This is an automated notification from the ${UNIVERSITY_CONFIG.name} Property Management System.
                          <br>Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Send email function
const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email notification skipped (not configured):', template.subject);
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${UNIVERSITY_CONFIG.name} PMS" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

// Main notification functions
const notifyTransferInitiated = async (transfer, fromUser, toUser) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Transfer Initiated`,
    html: createEmailTemplate(`<p>Transfer initiated from ${fromUser.firstName} to ${toUser.firstName}</p>`, 'Transfer Initiated')
  };
  await sendEmail(toUser.email, template);
};

const notifyTransferApproved = async (transfer, fromUser, toUser, propertyOfficers) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Transfer Approved`,
    html: createEmailTemplate(`<p>Transfer approved</p>`, 'Transfer Approved')
  };
  const recipients = [fromUser.email];
  if (propertyOfficers && propertyOfficers.length > 0) {
    recipients.push(...propertyOfficers.map(po => po.email).filter(email => email));
  }
  await sendEmail(recipients, template);
};

const notifyTransferCompleted = async (transfer, fromUser, toUser, completedBy) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Transfer Completed`,
    html: createEmailTemplate(`<p>Transfer completed</p>`, 'Transfer Completed')
  };
  await sendEmail([fromUser.email, toUser.email], template);
};

const notifyTransferRejected = async (transfer, fromUser, toUser, rejectionReason) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Transfer Rejected`,
    html: createEmailTemplate(`<p>Transfer rejected. Reason: ${rejectionReason}</p>`, 'Transfer Rejected')
  };
  await sendEmail(fromUser.email, template);
};

const notifyRequestCreated = async (request, requester, approvalAuthority) => {
  if (!approvalAuthority || !approvalAuthority.email) {
    console.warn('No approval authority email found for request notification');
    return;
  }
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] New Request`,
    html: createEmailTemplate(`<p>New request created by ${requester.firstName} ${requester.lastName}</p>`, 'New Request')
  };
  await sendEmail(approvalAuthority.email, template);
};

const notifyRequestApproved = async (request, requester, approver) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Request Approved`,
    html: createEmailTemplate(`<p>Your request has been approved</p>`, 'Request Approved')
  };
  await sendEmail(requester.email, template);
};

const notifyRequestRejected = async (request, requester, rejectionReason) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Request Rejected`,
    html: createEmailTemplate(`<p>Your request has been rejected. Reason: ${rejectionReason}</p>`, 'Request Rejected')
  };
  await sendEmail(requester.email, template);
};

const notifyRequestCompleted = async (request, requester, completedBy) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Request Completed`,
    html: createEmailTemplate(`<p>Your request has been completed</p>`, 'Request Completed')
  };
  await sendEmail(requester.email, template);
};

const notifyAssetAssigned = async (asset, assignedUser, assignedBy) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Asset Assigned`,
    html: createEmailTemplate(`<p>Asset ${asset.name} has been assigned to you</p>`, 'Asset Assigned')
  };
  await sendEmail(assignedUser.email, template);
};

const notifyAssetUnassigned = async (asset, previousUser, unassignedBy) => {
  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Asset Unassigned`,
    html: createEmailTemplate(`<p>Asset ${asset.name} has been unassigned from you</p>`, 'Asset Unassigned')
  };
  await sendEmail(previousUser.email, template);
};

// Password Reset Email
const sendPasswordResetCode = async (email, code, userName, expiryMinutes = 10) => {
  const content = `
    <div style="text-align: center;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
        Hello <strong>${userName}</strong>,
      </p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
        We received a request to reset your password for the Property Management System.
      </p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
        <p style="color: white; font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">
          Your verification code is:
        </p>
        <div style="background-color: white; border-radius: 8px; padding: 20px; display: inline-block;">
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #667eea; font-family: 'Courier New', monospace;">
            ${code}
          </p>
        </div>
        <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 15px 0 0 0;">
          ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>
        </p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; text-align: left;">
        <p style="margin: 0; color: #92400e; font-size: 13px;">
          <strong>⚠️ Security Notice:</strong><br>
          • Do not share this code with anyone<br>
          • ${UNIVERSITY_CONFIG.name} staff will never ask for this code<br>
          • If you didn't request this reset, please ignore this email
        </p>
      </div>

      <p style="font-size: 13px; color: #6b7280; margin-top: 25px;">
        If you're having trouble resetting your password, please contact the IT Help Desk.
      </p>
    </div>
  `;

  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Password Reset Code`,
    html: createEmailTemplate(content, '🔐 Password Reset Request')
  };

  return await sendEmail(email, template);
};

// Password Reset Success Confirmation
const sendPasswordResetConfirmation = async (email, userName) => {
  const content = `
    <div style="text-align: center;">
      <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">✅</span>
      </div>
      
      <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
        Your password has been successfully reset.
      </p>

      <div style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>✓ Password Changed Successfully</strong><br>
          <span style="font-size: 13px;">You can now log in with your new password.</span>
        </p>
      </div>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 25px 0; text-align: left;">
        <p style="margin: 0; color: #991b1b; font-size: 13px;">
          <strong>⚠️ Didn't make this change?</strong><br>
          If you did not reset your password, please contact the IT Help Desk immediately at ${UNIVERSITY_CONFIG.phone} or ${UNIVERSITY_CONFIG.email}.
        </p>
      </div>

      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
         style="display: inline-block; background-color: ${UNIVERSITY_CONFIG.primaryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 20px;">
        Go to Login Page
      </a>
    </div>
  `;

  const template = {
    subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Password Reset Successful`,
    html: createEmailTemplate(content, '✅ Password Reset Successful')
  };

  return await sendEmail(email, template);
};

module.exports = {
  sendEmail,
  notifyTransferInitiated,
  notifyTransferApproved,
  notifyTransferCompleted,
  notifyTransferRejected,
  notifyRequestCreated,
  notifyRequestApproved,
  notifyRequestRejected,
  notifyRequestCompleted,
  notifyAssetAssigned,
  notifyAssetUnassigned,
  sendPasswordResetCode,
  sendPasswordResetConfirmation
};
