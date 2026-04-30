const express = require('express');
const router = express.Router();
const protocols = require('../data/protocols.json');

function calcBSA(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

function calcCrCl(age, weightKg, creatinineMgDl, sex) {
  const base = ((140 - age) * weightKg) / (72 * creatinineMgDl);
  return sex === 'F' ? base * 0.85 : base;
}

function calcDrug(drug, bsa, crCl) {
  if (drug.unit === 'AUC') {
    const dose = drug.dose * (crCl + 25);
    return {
      name: drug.name,
      prescribedDose: drug.dose,
      unit: drug.unit,
      calculatedDoseMg: Math.round(dose),
      note: `Calvert formula: ${drug.dose} × (CrCl ${Math.round(crCl)} + 25)`
    };
  }

  if (drug.unit === 'mg/m2') {
    let dose = drug.dose * bsa;
    let note = null;
    if (drug.cap && dose > drug.cap) {
      dose = drug.cap;
      note = `Capped at ${drug.cap} mg (standard maximum)`;
    }
    return {
      name: drug.name,
      prescribedDose: drug.dose,
      unit: drug.unit,
      calculatedDoseMg: Math.round(dose * 10) / 10,
      note
    };
  }

  return {
    name: drug.name,
    prescribedDose: drug.dose,
    unit: drug.unit,
    calculatedDoseMg: drug.dose,
    note: 'Fixed dose — not BSA-based'
  };
}

router.post('/calculate', (req, res) => {
  const { heightCm, weightKg, age, sex, creatinineMgDl, protocolId } = req.body;

  if (!heightCm || !weightKg || !age || !sex || !creatinineMgDl || !protocolId) {
    return res.status(400).json({
      error: 'Missing required fields: heightCm, weightKg, age, sex, creatinineMgDl, protocolId'
    });
  }

  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) return res.status(404).json({ error: 'Protocol not found' });

  const bsa = calcBSA(heightCm, weightKg);
  const crCl = calcCrCl(age, weightKg, creatinineMgDl, sex);
  const drugs = protocol.drugs.map(drug => calcDrug(drug, bsa, crCl));

  res.json({
    protocolId,
    protocolName: protocol.name,
    bsa: Math.round(bsa * 1000) / 1000,
    crCl: Math.round(crCl * 10) / 10,
    drugs
  });
});

module.exports = router;
