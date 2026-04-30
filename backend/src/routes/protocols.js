const express = require('express');
const router = express.Router();
const protocols = require('../data/protocols.json');

router.get('/', (req, res) => {
  const { tumorSite, authority } = req.query;
  let results = protocols;
  if (tumorSite) results = results.filter(p => p.tumorSite === tumorSite);
  if (authority) results = results.filter(p => p.authority.includes(authority));
  res.json(results);
});

router.get('/:id', (req, res) => {
  const protocol = protocols.find(p => p.id === req.params.id);
  if (!protocol) return res.status(404).json({ error: 'Protocol not found' });
  res.json(protocol);
});

module.exports = router;
