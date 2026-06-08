const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'media-service' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Persona Media Service', version: '0.1.0' });
});

app.listen(PORT, () => {
  console.log(`Media service listening on port ${PORT}`);
});
