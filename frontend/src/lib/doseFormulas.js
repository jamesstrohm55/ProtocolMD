export function calcBSA(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function calcCrCl(age, weightKg, creatinineMgDl, sex) {
  const base = ((140 - age) * weightKg) / (72 * creatinineMgDl);
  return sex === 'F' ? base * 0.85 : base;
}
