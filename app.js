require("dotenv").config()
const express = require ("express")
const port = process.env.PORT || 3000
const app = express()
app.use (express.json())
app.use ('/api/v1', require('./routes/index.routes'));
app.use ( (err, req, res, next) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    next();
  })
app.listen(port, () => {
    console.log ("app running")
})

