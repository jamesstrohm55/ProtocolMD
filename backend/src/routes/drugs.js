const express = require('express');
const router = express.Router();
const { getDrugDetail } = require('../services/drugMerge');

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  const drug = await getDrugDetail(q.trim().toLowerCase());
  if (!drug) return res.json([]);
  res.json([drug]);
});

router.get('/:name', async (req, res) => {
  const drug = await getDrugDetail(req.params.name.toLowerCase());
  if (!drug) return res.status(404).json({ error: 'Drug not found' });
  res.json(drug);
});

module.exports = router;
