import 'dotenv/config';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

(async () => {
  await initMongoConnection();
  setupServer();
})();
