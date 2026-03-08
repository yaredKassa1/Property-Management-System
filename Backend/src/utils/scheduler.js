const cron = require('node-cron');
const { 
  sendPendingTransferReminders, 
  sendApprovedTransferReminders,
  sendPendingRequestReminders,
  sendApprovedRequestReminders
} = require('./reminderService');

// Initialize all scheduled jobs
const initializeScheduler = () => {
  console.log('📅 Initializing scheduled jobs...');

  // Check if reminders are enabled
  const remindersEnabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
  
  if (!remindersEnabled) {
    console.log('⚠️  Email notifications disabled. Scheduled reminders will not run.');
    return;
  }

  // Run daily at 9:00 AM to send reminders for pending transfers
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running pending transfer reminders job...');
    try {
      await sendPendingTransferReminders();
      console.log('✅ Pending transfer reminders sent successfully');
    } catch (error) {
      console.error('❌ Error sending pending transfer reminders:', error);
    }
  });

  // Run daily at 10:00 AM to send reminders for approved transfers (waiting for property officer)
  cron.schedule('0 10 * * *', async () => {
    console.log('🔔 Running approved transfer reminders job...');
    try {
      await sendApprovedTransferReminders();
      console.log('✅ Approved transfer reminders sent successfully');
    } catch (error) {
      console.error('❌ Error sending approved transfer reminders:', error);
    }
  });

  // Run daily at 11:00 AM to send reminders for pending requests
  cron.schedule('0 11 * * *', async () => {
    console.log('🔔 Running pending request reminders job...');
    try {
      await sendPendingRequestReminders();
      console.log('✅ Pending request reminders sent successfully');
    } catch (error) {
      console.error('❌ Error sending pending request reminders:', error);
    }
  });

  // Run daily at 2:00 PM to send reminders for approved requests
  cron.schedule('0 14 * * *', async () => {
    console.log('🔔 Running approved request reminders job...');
    try {
      await sendApprovedRequestReminders();
      console.log('✅ Approved request reminders sent successfully');
    } catch (error) {
      console.error('❌ Error sending approved request reminders:', error);
    }
  });

  console.log('✅ Scheduled jobs initialized:');
  console.log('   - Pending transfer reminders: Daily at 9:00 AM');
  console.log('   - Approved transfer reminders: Daily at 10:00 AM');
  console.log('   - Pending request reminders: Daily at 11:00 AM');
  console.log('   - Approved request reminders: Daily at 2:00 PM');
};

module.exports = { initializeScheduler };
