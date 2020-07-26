import express from 'express';
const router = express.Router();

router.get('/', function (req, res, next) {
  if (req.query.testError) {
    throw new Error('Test');
  }
  res.send('<p>My idea pool API service, see <a href=\'/api-docs\'>API documentation</a></p>');
});

export default router