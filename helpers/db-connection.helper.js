const { db } = require('../database/database.config');

const authenticateConnection = async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const synchronizeDatabase = async () => {
  await db.sync();
  console.log('All models were synchronized successfully.');
};

module.exports = {
  authenticateConnection,
  synchronizeDatabase,
};
