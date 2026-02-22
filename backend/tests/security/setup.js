const mongoose = require('mongoose');
require('dotenv').config();

// Use a separate test database
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/budgettracker_test_security';

beforeAll(async () => {
    // connect to test db
    await mongoose.connect(TEST_DB_URL);
});

afterAll(async () => {
    // clean up and close
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// afterEach block removed to allow state persistence across tests in the same suite.
// Cleanup is handled by dropDatabase in afterAll.

