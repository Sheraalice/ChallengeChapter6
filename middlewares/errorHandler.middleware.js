const errorHandling = (err, req, res, next) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    next();
  };
  
  module.exports = errorHandling;