const db = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('./emailService');

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

// Email template wrapper (simplified version for reminders)
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
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, ${UNIVERSITY_CONFIG.primaryColor} 0%, ${UNIVERSITY_CONFIG.secondaryColor} 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">${UNIVERSITY_CONFIG.name}</h1>
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
                <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 3px solid ${UNIVERSITY_CONFIG.primaryColor};">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    ${UNIVERSITY_CONFIG.name} | ${UNIVERSITY_CONFIG.address}<br>
                    ${UNIVERSITY_CONFIG.email} | ${UNIVERSITY_CONFIG.phone}
                  </p>
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

// Send reminders for pending transfers (waiting for recipient approval)
const sendPendingTransferReminders = async () => {
  try {
    const reminderDays = parseInt(process.env.REMINDER_DAYS_PENDING) || 3;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    // Find transfers that are pending for more than reminderDays
    const pendingTransfers = await db.Transfer.findAll({
      where: {
        status: 'pending',
        requestDate: {
          [Op.lte]: reminderDate
        }
      },
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'email']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'email']
        }
      ]
    });

    console.log(`Found ${pendingTransfers.length} pending transfers requiring reminders`);

    for (const transfer of pendingTransfers) {
      if (transfer.toUser && transfer.toUser.email) {
        const daysPending = Math.floor((new Date() - new Date(transfer.requestDate)) / (1000 * 60 * 60 * 24));
        
        const template = {
          subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Reminder: Pending Transfer - ${transfer.asset?.assetId || 'Asset'}`,
          html: createEmailTemplate(`
            <p>Dear ${transfer.toUser.firstName} ${transfer.toUser.lastName},</p>
            <p>This is a reminder that you have a pending asset transfer that requires your approval.</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #f59e0b;">⏰ Pending Transfer</h3>
              <p><strong>Asset:</strong> ${transfer.asset?.name || 'N/A'}</p>
              <p><strong>Asset ID:</strong> ${transfer.asset?.assetId || 'N/A'}</p>
              <p><strong>From:</strong> ${transfer.fromUser.firstName} ${transfer.fromUser.lastName}</p>
              <p><strong>Days Pending:</strong> ${daysPending} days</p>
            </div>
            
            <p>Please review and approve/reject this transfer at your earliest convenience.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/transfers" 
                 style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Transfer
              </a>
            </div>
          `, '⏰ Pending Transfer Reminder')
        };

        await sendEmail(transfer.toUser.email, template);
        console.log(`Sent reminder for transfer ${transfer.id} to ${transfer.toUser.email}`);
      }
    }

    return { success: true, count: pendingTransfers.length };
  } catch (error) {
    console.error('Error sending pending transfer reminders:', error);
    throw error;
  }
};

// Send reminders for approved transfers (waiting for property officer to complete)
const sendApprovedTransferReminders = async () => {
  try {
    const reminderDays = parseInt(process.env.REMINDER_DAYS_APPROVED) || 2;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    // Find transfers that are approved for more than reminderDays
    const approvedTransfers = await db.Transfer.findAll({
      where: {
        status: 'approved',
        approvalDate: {
          [Op.lte]: reminderDate
        }
      },
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'middleName', 'lastName']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'middleName', 'lastName']
        }
      ]
    });

    console.log(`Found ${approvedTransfers.length} approved transfers requiring reminders`);

    // Get all property officers
    const propertyOfficers = await db.User.findAll({
      where: {
        role: 'property_officer',
        isActive: true
      },
      attributes: ['id', 'email', 'firstName', 'lastName']
    });

    for (const transfer of approvedTransfers) {
      const daysApproved = Math.floor((new Date() - new Date(transfer.approvalDate)) / (1000 * 60 * 60 * 24));
      
      const template = {
        subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Reminder: Complete Transfer - ${transfer.asset?.assetId || 'Asset'}`,
        html: createEmailTemplate(`
          <p>Dear Property Officer,</p>
          <p>This is a reminder about an approved transfer that needs to be completed.</p>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #3b82f6;">⏰ Approved Transfer Pending Completion</h3>
            <p><strong>Asset:</strong> ${transfer.asset?.name || 'N/A'}</p>
            <p><strong>Asset ID:</strong> ${transfer.asset?.assetId || 'N/A'}</p>
            <p><strong>From:</strong> ${transfer.fromUser.firstName} ${transfer.fromUser.lastName}</p>
            <p><strong>To:</strong> ${transfer.toUser.firstName} ${transfer.toUser.lastName}</p>
            <p><strong>Days Since Approval:</strong> ${daysApproved} days</p>
          </div>
          
          <p>Please complete this transfer to finalize the asset reassignment.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/transfers" 
               style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Transfer
            </a>
          </div>
        `, '⏰ Approved Transfer Reminder')
      };

      // Send to all property officers
      for (const officer of propertyOfficers) {
        if (officer.email) {
          await sendEmail(officer.email, template);
          console.log(`Sent reminder for transfer ${transfer.id} to ${officer.email}`);
        }
      }
    }

    return { success: true, count: approvedTransfers.length };
  } catch (error) {
    console.error('Error sending approved transfer reminders:', error);
    throw error;
  }
};

// Send reminders for pending requests (waiting for approval)
const sendPendingRequestReminders = async () => {
  try {
    const reminderDays = parseInt(process.env.REMINDER_DAYS_PENDING) || 3;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    const pendingRequests = await db.Request.findAll({
      where: {
        status: { [Op.in]: ['in_progress', 'pending'] },
        requestDate: { [Op.lte]: reminderDate }
      },
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'firstName', 'middleName', 'lastName', 'email'] },
        { model: db.User, as: 'approvalAuthority', attributes: ['id', 'firstName', 'middleName', 'lastName', 'email'] }
      ]
    });

    console.log(`Found ${pendingRequests.length} pending requests requiring reminders`);
    
    for (const request of pendingRequests) {
      if (request.approvalAuthority && request.approvalAuthority.email) {
        const daysPending = Math.floor((new Date() - new Date(request.requestDate)) / (1000 * 60 * 60 * 24));
        
        const template = {
          subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Reminder: Pending Request - ${request.itemName}`,
          html: createEmailTemplate(`
            <p>Dear ${request.approvalAuthority.firstName} ${request.approvalAuthority.lastName},</p>
            <p>This is a reminder that you have a pending asset request.</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">⏰ Pending Request</h3>
              <p><strong>Item:</strong> ${request.itemName}</p>
              <p><strong>Quantity:</strong> ${request.quantity}</p>
              <p><strong>Requester:</strong> ${request.requester.firstName} ${request.requester.lastName}</p>
              <p><strong>Days Pending:</strong> ${daysPending} days</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/requests" 
                 style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Request
              </a>
            </div>
          `, '⏰ Pending Request Reminder')
        };
        
        await sendEmail(request.approvalAuthority.email, template);
        console.log(`Sent reminder for request ${request.id}`);
      }
    }
    
    return { success: true, count: pendingRequests.length };
  } catch (error) {
    console.error('Error sending pending request reminders:', error);
    throw error;
  }
};

// Send reminders for approved requests (waiting for completion)
const sendApprovedRequestReminders = async () => {
  try {
    const reminderDays = parseInt(process.env.REMINDER_DAYS_APPROVED) || 2;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    const approvedRequests = await db.Request.findAll({
      where: {
        status: 'approved',
        approvalDate: { [Op.lte]: reminderDate }
      },
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'firstName', 'middleName', 'lastName', 'email'] }
      ]
    });

    console.log(`Found ${approvedRequests.length} approved requests requiring reminders`);

    const propertyOfficers = await db.User.findAll({
      where: { role: { [Op.in]: ['property_officer', 'purchase_department'] }, isActive: true },
      attributes: ['id', 'email', 'firstName', 'lastName']
    });

    for (const request of approvedRequests) {
      const daysApproved = Math.floor((new Date() - new Date(request.approvalDate)) / (1000 * 60 * 60 * 24));
      
      const template = {
        subject: `[${UNIVERSITY_CONFIG.shortName} PMS] Reminder: Complete Request - ${request.itemName}`,
        html: createEmailTemplate(`
          <p>Dear Property Officer,</p>
          <p>This is a reminder about an approved request that needs completion.</p>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">⏰ Approved Request</h3>
            <p><strong>Item:</strong> ${request.itemName}</p>
            <p><strong>Quantity:</strong> ${request.quantity}</p>
            <p><strong>Requester:</strong> ${request.requester.firstName} ${request.requester.lastName}</p>
            <p><strong>Days Since Approval:</strong> ${daysApproved} days</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/requests" 
               style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Request
            </a>
          </div>
        `, '⏰ Approved Request Reminder')
      };
      
      for (const officer of propertyOfficers) {
        if (officer.email) {
          await sendEmail(officer.email, template);
        }
      }
    }
    
    return { success: true, count: approvedRequests.length };
  } catch (error) {
    console.error('Error sending approved request reminders:', error);
    throw error;
  }
};

module.exports = {
  sendPendingTransferReminders,
  sendApprovedTransferReminders,
  sendPendingRequestReminders,
  sendApprovedRequestReminders
};
