const { sequelize } = require('./src/config/database');

(async () => {
  try {
    const [results] = await sequelize.query("select table_name from information_schema.tables where table_schema='public';");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await sequelize.close();
  }
})();
