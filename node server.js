const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read/write data
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    // Default structure
    return {
      folders: [],
      userInfo: null,
      timetable: null
    };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- Folders & Files ---
app.get('/api/folders', (req, res) => {
  const data = readData();
  res.json(data.folders || []);
});
app.post('/api/folders', (req, res) => {
  const data = readData();
  data.folders = req.body;
  writeData(data);
  res.json({ status: 'ok' });
});

// --- User Info ---
app.get('/api/user', (req, res) => {
  const data = readData();
  res.json(data.userInfo || null);
});
app.post('/api/user', (req, res) => {
  const data = readData();
  data.userInfo = req.body;
  writeData(data);
  res.json({ status: 'ok' });
});

// --- Timetable File ---
app.get('/api/timetable', (req, res) => {
  const data = readData();
  res.json(data.timetable || null);
});
app.post('/api/timetable', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const data = readData();
  data.timetable = {
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`
  };
  writeData(data);
  res.json(data.timetable);
});

// --- Upload a file for folders ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`
  });
});

// --- Get all data (for debugging/restore) ---
app.get('/api/all', (req, res) => {
  res.json(readData());
});

// --- Set all data (for restore) ---
app.post('/api/all', (req, res) => {
  writeData(req.body);
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});