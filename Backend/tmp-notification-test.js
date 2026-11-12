const db = require('./src/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');
    const userId = 'b0d63041-f9a4-469a-8107-def24f8170f1';
    const user = await db.User.findByPk(userId, { attributes: { exclude: ['password'] } });
    console.log('user', !!user, user ? user.id : null, user ? user.isActive : null);
    const notes = await db.Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 50 });
    console.log('notifications count', notes.length);
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await db.sequelize.close();
  }
})();
