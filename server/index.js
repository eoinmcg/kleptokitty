import express from 'express';
const app = express();
const port = process.env.PORT || 3003;
import fs from 'fs';

import raw from '../src/data/levels.js';
const levels = raw.split('+');

// const SAVETO = 'testlevel.js';
const SAVETO = 'levels.js';

app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json({
    message: 'Levels loaded successfully',
    levels: levels,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

app.post('/api/data', (req, res) => {
  const receivedData = req.body;
  const output = `export default '${req.body.levels}'`;

  fs.writeFileSync(`./src/data/${SAVETO}`, output);

  res.json({
    message: 'Map data saved successfully!',
    data: output,
    status: 'success'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
