require('dotenv').config();

const express = require('express');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect requests for User related routes
app.use('/api/user', require('./routes/userRoutes'));

// Redirect requests for file upload related routes
app.use('/api/file', require('./routes/uploadRoutes'));

app.use((err, req, res, next) => {
  console.log(err.stack);
  console.log(err.name);
  console.log(err.code);

  res.status(500).json({
    message: "Something went wrong"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));