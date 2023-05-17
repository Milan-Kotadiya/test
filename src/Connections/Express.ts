import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/check', async (req, resp) => {
  resp.send('Server is Running');
});

export default app;
