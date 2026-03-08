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
  return nodemailer.createTransporter(emailConfig);
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
  notifyAssetUnassigned
};
