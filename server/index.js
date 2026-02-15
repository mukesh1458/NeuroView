import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './config/database.js'
import postRoutes from './routes/postRoutes.js'
import fileUpload from 'express-fileupload';

import dalleRoutes from './routes/dalleRoutes.js'
import summaryRoutes from './routes/summaryRoutes.js'
import summaryPostRoutes from './routes/summaryPostRoutes.js'

import authRoutes from './routes/authRoutes.js'

dotenv.config();
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }))
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
)

import collectionRoutes from './routes/collectionRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/collections', collectionRoutes); // Register Collection Routes

// Legacy routes define their own subpaths (e.g., router.get('/post'))
app.use('/api/v1', postRoutes);
app.use('/api/v1', dalleRoutes);
app.use('/api/v1', summaryRoutes);
app.use('/api/v1', summaryPostRoutes);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello from DALL.E!',
  });
});

const startServer = async () => {
  try {
    connectDB();
    app.listen(PORT, () => console.log('Server started on port 8080'));
  } catch (error) {
    console.log(error);
  }
};

startServer(); 