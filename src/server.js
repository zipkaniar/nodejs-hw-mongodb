import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
} from './controllers/contactsController.js';

const logger = pino({ transport: { target: 'pino-pretty' } });

export function setupServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));

  // GET rotaları
  app.get('/contacts', getAllContacts);
  app.get('/contacts/:contactId', getContactById);

  // POST rotası
  app.post('/contacts', createContact);

  //Delete
  app.delete('/contacts/:contactId', deleteContact);

  // 404 Middleware
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Sunucu dinlenmeye başlar
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
