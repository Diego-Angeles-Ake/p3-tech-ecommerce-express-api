require('dotenv').config();
const { app } = require('./app');
const { defineModelAssociations } = require('./helpers/init-models.helper');
const {
  synchronizeDatabase,
  authenticateConnection,
} = require('./helpers/db-connection.helper');

const PORT = process.env.PORT || 4000;
// Test connection to the database
authenticateConnection();

// Establish model relations
defineModelAssociations();

// Model synchronization
synchronizeDatabase();

// Spin-up server
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
