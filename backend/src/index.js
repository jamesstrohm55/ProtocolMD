require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/protocols', require('./routes/protocols'));
// app.use('/api/drugs', require('./routes/drugs'));
// app.use('/api/dose', require('./routes/dose'));

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`ProtocolMD backend on port ${PORT}`));
}

module.exports = app;
