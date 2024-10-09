const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
    user: 'postgres',
    password: 'postgresql17',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });
  
app.use(cors());
app.use(express.json());

// Endpoint to book an appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, email, date, service } = req.body;
    const query = 'INSERT INTO appointments (name, email, date, service) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [name, email, date, service];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/get_booking', async (req, res) => {
    try {
      const query = 'SELECT * FROM appointments ORDER BY date DESC';
      const result = await pool.query(query);
      
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'An error occurred while fetching bookings' });
    }
  });

// Add more endpoints as needed

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});