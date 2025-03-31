const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if username exists
    const userExists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Create token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all todos for a user
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await db.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(todos.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new todo
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = await db.query(
      'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, req.user.id]
    );
    
    res.status(201).json(newTodo.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a todo
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    // Check if todo exists and belongs to user
    const todo = await db.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (todo.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }
    
    const updatedTodo = await db.query(
      'UPDATE todos SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );
    
    res.json(updatedTodo.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if todo exists and belongs to user
    const todo = await db.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (todo.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }
    
    await db.query('DELETE FROM todos WHERE id = $1', [id]);
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});