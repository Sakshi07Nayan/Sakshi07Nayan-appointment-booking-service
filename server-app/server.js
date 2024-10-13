import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//local database
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // SSL setting for production (like Heroku)
// });

//hosted database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

// Test PostgreSQL connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Database connected');
});



app.use(express.json());
// app.use(cors({ origin: '*' }));
app.use(cors({
  origin: 'https://appointment-booking-service-ogzq.vercel.app', // Replace with your React app domain
  methods: ['GET', 'POST'], // Allowed methods
  credentials: true, 
}));


// Endpoint to book an appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, email, date, service } = req.body;
    console.log('Received data:', { name, email, date, service });
    if (!name || !email || !date || !service) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'INSERT INTO appointments (name, email, date, service) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [name, email, date, service];

    const result = await pool.query(query, values);
    console.log('Database result:', result);
    res.status(201).json({ name, date, message: "Appointment booked successfully!" });
  } catch (error) {
    console.error('API error:', error);
    if (error.code === '23505') { // Duplicate key violation
      res.status(409).json({ error: 'Appointment already exists.' });
    } else {
      res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
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

app.get('/', (req, res) => {
  res.send('Welcome to the Node.js API!');
});
