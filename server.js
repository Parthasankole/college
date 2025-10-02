const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname)); // serves index.html and assets
app.use(express.urlencoded({ extended: true }));

let notes = []; // temporary in-memory storage

app.post('/submit', (req, res) => {
  const note = req.body.note;
  notes.push(note);
  console.log('Saved note:', note);
  res.send('Note stored: ' + note);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
