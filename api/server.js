const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Status</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            h1 { color: green; }
        </style>
    </head>
    <body>
        <h1>Server is running!</h1>
        <p>API is available at <a href="/api/drinks">/api/drinks</a></p>
    </body>
    </html>
  `);
});

// Path to JSON file
const filePath = '../data.json';

// Read JSON file
const getData = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Write JSON file
const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// GET all drinks from a specific category
app.get('/api/drinks', (req, res) => {
  const { category } = req.query;
  const data = getData();
  if (category && data[category]) {
    res.json(data[category]);
  } else {
    res.status(400).json({ message: 'Category not found!' });
  }
});

// POST add a new drink to a specific category
app.post('/api/drinks', (req, res) => {
  const { category, drink } = req.body;
  const data = getData();

  if (data[category]) {
    data[category].push(drink);
    saveData(data);
    res.json(drink);
  } else {
    res.status(400).json({ message: 'Category not found!' });
  }
});

// PUT edit a drink (using name)
app.put('/api/drinks/:category/:name', (req, res) => {
  const { category, name } = req.params;
  const updatedDrink = req.body;
  const data = getData();

  const drinkIndex = data[category].findIndex((drink) => drink.name === name);
  if (drinkIndex !== -1) {
    data[category][drinkIndex] = { ...data[category][drinkIndex], ...updatedDrink };
    saveData(data);
    res.json(data[category][drinkIndex]);
  } else {
    res.status(404).json({ message: 'Drink not found!' });
  }
});

// DELETE a drink (using name)
app.delete('/api/drinks/:category/:name', (req, res) => {
  const { category, name } = req.params;
  const data = getData();

  const drinkIndex = data[category].findIndex((drink) => drink.name === name);
  if (drinkIndex !== -1) {
    data[category].splice(drinkIndex, 1);
    saveData(data);
    res.json({ message: 'Drink deleted successfully!' });
  } else {
    res.status(404).json({ message: 'Drink not found!' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
