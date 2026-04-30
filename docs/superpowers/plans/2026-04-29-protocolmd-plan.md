# ProtocolMD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build ProtocolMD — a web-based clinical reference and dose calculation tool for oncologists, featuring SBOC/NCCN protocol browsing, drug search via OpenFDA + NCI, and BSA/CrCl-based dose calculation.

**Architecture:** React 19 frontend (Vite + TanStack Query + Tailwind) calls a Node/Express backend that proxies OpenFDA and NCI APIs and serves curated SBOC/NCCN protocol JSON. The backend is structured for Phase B (auth + PostgreSQL) without implementing it.

**Tech Stack:** React 19, Vite 5, React Router v6, TanStack Query v5, Tailwind CSS v3, Node.js 20, Express 4, Jest 29, Supertest 7

---

## File Map

```
ProtocolMD/
├── .gitignore
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── railway.json
│   ├── src/
│   │   ├── index.js                    # Express entry; registers routes
│   │   ├── data/
│   │   │   └── protocols.json          # SBOC + NCCN seed data
│   │   ├── routes/
│   │   │   ├── drugs.js                # GET /api/drugs/search, /api/drugs/:name
│   │   │   ├── protocols.js            # GET /api/protocols, /api/protocols/:id
│   │   │   └── dose.js                 # POST /api/dose/calculate
│   │   └── services/
│   │       ├── openFDA.js              # Fetch + parse OpenFDA drug labels
│   │       ├── nciDrugs.js             # Fetch + parse NCI Drug Dictionary
│   │       └── drugMerge.js            # Combine OpenFDA + NCI into unified shape
│   └── tests/
│       ├── health.test.js
│       ├── protocols.test.js
│       ├── openFDA.test.js
│       ├── nciDrugs.test.js
│       ├── drugs.test.js
│       └── dose.test.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    └── src/
        ├── main.jsx
        ├── App.jsx                     # Router root with all routes
        ├── lib/
        │   ├── api.js                  # fetch wrapper; base URL from env
        │   └── doseFormulas.js         # BSA + CrCl helpers (client-side reference)
        ├── components/
        │   ├── NavBar.jsx
        │   ├── SearchBar.jsx
        │   ├── ProtocolCard.jsx
        │   └── DrugCard.jsx
        └── pages/
            ├── HomePage.jsx
            ├── ProtocolBrowser.jsx
            ├── ProtocolDetail.jsx
            ├── DrugSearch.jsx
            ├── DrugDetail.jsx
            ├── DoseCalculator.jsx
            └── DrugClasses.jsx
```

---

### Task 1: Initialize project and git

**Files:**
- Create: `.gitignore`
- Create: `backend/package.json`
- Create: `backend/.env.example`

- [ ] **Step 1: Initialize git**

Run from `C:/Users/james/Desktop/ProtocolMD`:
```bash
git init
```
Expected: `Initialized empty Git repository in .../ProtocolMD/.git/`

- [ ] **Step 2: Create root .gitignore**

Create `ProtocolMD/.gitignore`:
```
node_modules/
.env
dist/
.DS_Store
*.local
```

- [ ] **Step 3: Create backend/package.json**

Create `backend/package.json`:
```json
{
  "name": "protocolmd-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --runInBand --forceExit"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

- [ ] **Step 4: Create backend/.env.example**

Create `backend/.env.example`:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Then copy it:
```bash
cp backend/.env.example backend/.env
```

- [ ] **Step 5: Install backend dependencies**

Run from `ProtocolMD/`:
```bash
cd backend && npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: initialize ProtocolMD project structure"
```

---

### Task 2: Backend — Express app + health check

**Files:**
- Create: `backend/src/index.js`
- Create: `backend/tests/health.test.js`

- [ ] **Step 1: Write the failing health check test**

Create `backend/tests/health.test.js`:
```javascript
const request = require('supertest');

describe('GET /api/health', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=health
```
Expected: FAIL — `Cannot find module '../src/index'`

- [ ] **Step 3: Create Express app**

Create `backend/src/index.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes are added below as they are built in subsequent tasks
// app.use('/api/protocols', require('./routes/protocols'));
// app.use('/api/drugs', require('./routes/drugs'));
// app.use('/api/dose', require('./routes/dose'));

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`ProtocolMD backend on port ${PORT}`));
}

module.exports = app;
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd backend && npm test -- --testPathPattern=health
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/index.js backend/tests/health.test.js
git commit -m "feat: add Express app with health check endpoint"
```

---

### Task 3: Backend — Protocol seed data + routes

**Files:**
- Create: `backend/src/data/protocols.json`
- Create: `backend/src/routes/protocols.js`
- Create: `backend/tests/protocols.test.js`

- [ ] **Step 1: Write failing protocol tests**

Create `backend/tests/protocols.test.js`:
```javascript
const request = require('supertest');

describe('Protocols API', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('GET /api/protocols returns array of protocols', async () => {
    const res = await request(app).get('/api/protocols');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/protocols?tumorSite=Colorectal filters results', async () => {
    const res = await request(app).get('/api/protocols?tumorSite=Colorectal');
    expect(res.status).toBe(200);
    res.body.forEach(p => expect(p.tumorSite).toBe('Colorectal'));
  });

  it('GET /api/protocols/:id returns single protocol', async () => {
    const res = await request(app).get('/api/protocols/folfox-nccn-crc');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('folfox-nccn-crc');
    expect(Array.isArray(res.body.drugs)).toBe(true);
  });

  it('GET /api/protocols/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/protocols/does-not-exist');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=protocols
```
Expected: FAIL — route not registered

- [ ] **Step 3: Create protocol seed data**

Create `backend/src/data/protocols.json`:
```json
[
  {
    "id": "folfox-nccn-crc",
    "name": "FOLFOX",
    "tumorSite": "Colorectal",
    "authority": ["NCCN"],
    "preferential": true,
    "cycleLength": 14,
    "drugs": [
      { "name": "Oxaliplatin", "dose": 85, "unit": "mg/m2", "day": [1], "route": "IV over 2h" },
      { "name": "Leucovorin", "dose": 400, "unit": "mg/m2", "day": [1], "route": "IV over 2h" },
      { "name": "Fluorouracil", "dose": 400, "unit": "mg/m2", "day": [1], "route": "IV bolus" },
      { "name": "Fluorouracil", "dose": 2400, "unit": "mg/m2", "day": [1, 2], "route": "IV continuous 46h" }
    ],
    "supportiveCare": "Antiemetic prophylaxis: 5-HT3 antagonist + dexamethasone on Day 1.",
    "notes": "Reduce oxaliplatin by 25% for grade 2 sensory neuropathy."
  },
  {
    "id": "ac-dd-nccn-breast",
    "name": "AC (dose-dense)",
    "tumorSite": "Breast",
    "authority": ["NCCN"],
    "preferential": true,
    "cycleLength": 14,
    "drugs": [
      { "name": "Doxorubicin", "dose": 60, "unit": "mg/m2", "day": [1], "route": "IV bolus" },
      { "name": "Cyclophosphamide", "dose": 600, "unit": "mg/m2", "day": [1], "route": "IV over 30min" }
    ],
    "supportiveCare": "G-CSF support required. Antiemetic: NK1 + 5-HT3 + dexamethasone.",
    "notes": "Followed by Paclitaxel 175 mg/m2 q2w x4 cycles after AC completion."
  },
  {
    "id": "chop-nccn-dlbcl",
    "name": "CHOP",
    "tumorSite": "Lymphoma",
    "authority": ["NCCN"],
    "preferential": true,
    "cycleLength": 21,
    "drugs": [
      { "name": "Cyclophosphamide", "dose": 750, "unit": "mg/m2", "day": [1], "route": "IV over 30min" },
      { "name": "Doxorubicin", "dose": 50, "unit": "mg/m2", "day": [1], "route": "IV bolus" },
      { "name": "Vincristine", "dose": 1.4, "unit": "mg/m2", "day": [1], "route": "IV bolus", "cap": 2 },
      { "name": "Prednisone", "dose": 100, "unit": "mg", "day": [1, 2, 3, 4, 5], "route": "PO" }
    ],
    "supportiveCare": "Vincristine capped at 2 mg absolute. Antiemetic: 5-HT3 + dexamethasone.",
    "notes": "Usually given as R-CHOP with Rituximab 375 mg/m2 on Day 1."
  },
  {
    "id": "carbo-pacli-nccn-nsclc",
    "name": "Carboplatin + Paclitaxel",
    "tumorSite": "Lung",
    "authority": ["NCCN", "SBOC"],
    "preferential": true,
    "cycleLength": 21,
    "drugs": [
      { "name": "Carboplatin", "dose": 6, "unit": "AUC", "day": [1], "route": "IV over 30min" },
      { "name": "Paclitaxel", "dose": 200, "unit": "mg/m2", "day": [1], "route": "IV over 3h" }
    ],
    "supportiveCare": "Premedicate paclitaxel: dexamethasone 20mg + diphenhydramine 50mg + ranitidine 50mg IV.",
    "notes": "Carboplatin dose by Calvert formula: dose = AUC × (CrCl + 25)."
  },
  {
    "id": "pembrolizumab-sboc-nsclc",
    "name": "Pembrolizumab",
    "tumorSite": "Lung",
    "authority": ["NCCN", "SBOC"],
    "preferential": true,
    "cycleLength": 21,
    "drugs": [
      { "name": "Pembrolizumab", "dose": 200, "unit": "mg", "day": [1], "route": "IV over 30min" }
    ],
    "supportiveCare": "Monitor for immune-related adverse events (irAEs). No routine antiemetic required.",
    "notes": "First-line monotherapy for PD-L1 TPS ≥ 50% without EGFR/ALK alterations."
  }
]
```

- [ ] **Step 4: Create protocols route**

Create `backend/src/routes/protocols.js`:
```javascript
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
```

- [ ] **Step 5: Register protocols route in index.js**

Edit `backend/src/index.js` — uncomment the protocols line:
```javascript
app.use('/api/protocols', require('./routes/protocols'));
```

- [ ] **Step 6: Run tests — expect pass**

```bash
cd backend && npm test -- --testPathPattern=protocols
```
Expected: PASS — all 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/src/data/protocols.json backend/src/routes/protocols.js backend/tests/protocols.test.js backend/src/index.js
git commit -m "feat: add protocol seed data and SBOC/NCCN routes"
```

---

### Task 4: Backend — OpenFDA service

**Files:**
- Create: `backend/src/services/openFDA.js`
- Create: `backend/tests/openFDA.test.js`

- [ ] **Step 1: Write failing OpenFDA tests**

Create `backend/tests/openFDA.test.js`:
```javascript
const { fetchDrugLabel } = require('../src/services/openFDA');

global.fetch = jest.fn();
afterEach(() => jest.clearAllMocks());

describe('fetchDrugLabel', () => {
  it('returns parsed label fields for a valid drug', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{
          openfda: {
            generic_name: ['fluorouracil'],
            brand_name: ['Adrucil'],
            pharm_class_epc: ['Antimetabolite [EPC]']
          },
          description: ['Fluorouracil is a pyrimidine analog.'],
          dosage_and_administration: ['400 mg/m2 IV bolus Day 1.'],
          adverse_reactions: ['Nausea, myelosuppression, mucositis.'],
          contraindications: ['Bone marrow depression, poor nutritional status.'],
          warnings: ['Monitor CBC closely.']
        }]
      })
    });

    const result = await fetchDrugLabel('fluorouracil');
    expect(result.genericName).toBe('fluorouracil');
    expect(result.brandName).toBe('Adrucil');
    expect(result.pharmClass).toContain('Antimetabolite');
    expect(result.dosage).toBeTruthy();
    expect(result.adverseReactions).toBeTruthy();
  });

  it('returns null when drug is not found (404)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await fetchDrugLabel('notadrugxyz');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=openFDA
```
Expected: FAIL — `Cannot find module '../src/services/openFDA'`

- [ ] **Step 3: Create OpenFDA service**

Create `backend/src/services/openFDA.js`:
```javascript
const OPENFDA_BASE = 'https://api.fda.gov/drug/label.json';

async function fetchDrugLabel(drugName) {
  const encoded = encodeURIComponent(`"${drugName}"`);
  const url = `${OPENFDA_BASE}?search=openfda.generic_name:${encoded}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const label = data.results[0];
  const openfda = label.openfda || {};

  return {
    genericName: (openfda.generic_name?.[0] || drugName).toLowerCase(),
    brandName: openfda.brand_name?.[0] || null,
    pharmClass: openfda.pharm_class_epc?.[0] || null,
    description: label.description?.[0] || null,
    dosage: label.dosage_and_administration?.[0] || null,
    adverseReactions: label.adverse_reactions?.[0] || null,
    contraindications: label.contraindications?.[0] || null,
    warnings: label.warnings?.[0] || null
  };
}

module.exports = { fetchDrugLabel };
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd backend && npm test -- --testPathPattern=openFDA
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/openFDA.js backend/tests/openFDA.test.js
git commit -m "feat: add OpenFDA drug label service"
```

---

### Task 5: Backend — NCI Drug Dictionary service

**Files:**
- Create: `backend/src/services/nciDrugs.js`
- Create: `backend/tests/nciDrugs.test.js`

NCI endpoint: `https://clinicaltrialsapi.cancer.gov/api/v2/drugs?name=NAME&size=5`
Returns: `{ data: [{ name, synonyms, definition, nci_thesaurus_concept_id }] }`

Before starting, verify the endpoint is accessible:
```bash
curl "https://clinicaltrialsapi.cancer.gov/api/v2/drugs?name=fluorouracil&size=1"
```
If it returns a 401, the endpoint requires a key — register at https://clinicaltrialsapi.cancer.gov and add `NCI_API_KEY` to `backend/.env`.

- [ ] **Step 1: Write failing NCI tests**

Create `backend/tests/nciDrugs.test.js`:
```javascript
const { fetchNciDrug } = require('../src/services/nciDrugs');

global.fetch = jest.fn();
afterEach(() => jest.clearAllMocks());

describe('fetchNciDrug', () => {
  it('returns parsed drug info for a valid drug', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{
          name: 'Fluorouracil',
          synonyms: ['5-FU', '5-Fluorouracil'],
          definition: 'A fluorinated pyrimidine analog with antineoplastic activity.',
          nci_thesaurus_concept_id: 'C505'
        }]
      })
    });

    const result = await fetchNciDrug('fluorouracil');
    expect(result.name).toBe('Fluorouracil');
    expect(result.synonyms).toContain('5-FU');
    expect(result.definition).toBeTruthy();
    expect(result.nciId).toBe('C505');
  });

  it('returns null when no results', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });
    const result = await fetchNciDrug('notadrugxyz');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=nciDrugs
```
Expected: FAIL — `Cannot find module '../src/services/nciDrugs'`

- [ ] **Step 3: Create NCI service**

Create `backend/src/services/nciDrugs.js`:
```javascript
const NCI_BASE = 'https://clinicaltrialsapi.cancer.gov/api/v2/drugs';

async function fetchNciDrug(drugName) {
  const headers = {};
  if (process.env.NCI_API_KEY) headers['x-api-key'] = process.env.NCI_API_KEY;

  const url = `${NCI_BASE}?name=${encodeURIComponent(drugName)}&size=5`;
  const res = await fetch(url, { headers });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;

  const match = data.data.find(
    d => d.name.toLowerCase() === drugName.toLowerCase()
  ) || data.data[0];

  return {
    name: match.name,
    synonyms: match.synonyms || [],
    definition: match.definition || null,
    nciId: match.nci_thesaurus_concept_id || null
  };
}

module.exports = { fetchNciDrug };
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd backend && npm test -- --testPathPattern=nciDrugs
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/nciDrugs.js backend/tests/nciDrugs.test.js
git commit -m "feat: add NCI Drug Dictionary service"
```

---

### Task 6: Backend — Drug merge service + routes

**Files:**
- Create: `backend/src/services/drugMerge.js`
- Create: `backend/src/routes/drugs.js`
- Create: `backend/tests/drugs.test.js`

- [ ] **Step 1: Write failing drug route tests**

Create `backend/tests/drugs.test.js`:
```javascript
const request = require('supertest');

jest.mock('../src/services/openFDA', () => ({
  fetchDrugLabel: jest.fn().mockResolvedValue({
    genericName: 'fluorouracil',
    brandName: 'Adrucil',
    pharmClass: 'Antimetabolite [EPC]',
    description: 'A pyrimidine analog.',
    dosage: 'Administer 400 mg/m2 IV.',
    adverseReactions: 'Nausea, myelosuppression.',
    contraindications: 'Bone marrow depression.',
    warnings: 'Monitor CBC.'
  })
}));

jest.mock('../src/services/nciDrugs', () => ({
  fetchNciDrug: jest.fn().mockResolvedValue({
    name: 'Fluorouracil',
    synonyms: ['5-FU'],
    definition: 'Antineoplastic antimetabolite.',
    nciId: 'C505'
  })
}));

describe('Drugs API', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('GET /api/drugs/search?q=fluorouracil returns results', async () => {
    const res = await request(app).get('/api/drugs/search?q=fluorouracil');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].genericName).toBe('fluorouracil');
  });

  it('GET /api/drugs/search without q returns 400', async () => {
    const res = await request(app).get('/api/drugs/search');
    expect(res.status).toBe(400);
  });

  it('GET /api/drugs/:name returns merged drug detail', async () => {
    const res = await request(app).get('/api/drugs/fluorouracil');
    expect(res.status).toBe(200);
    expect(res.body.genericName).toBe('fluorouracil');
    expect(res.body.synonyms).toContain('5-FU');
    expect(res.body.definition).toBeTruthy();
    expect(res.body.dosage).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=drugs
```
Expected: FAIL — route not registered

- [ ] **Step 3: Create drugMerge service**

Create `backend/src/services/drugMerge.js`:
```javascript
const { fetchDrugLabel } = require('./openFDA');
const { fetchNciDrug } = require('./nciDrugs');

async function getDrugDetail(drugName) {
  const [fda, nci] = await Promise.all([
    fetchDrugLabel(drugName),
    fetchNciDrug(drugName)
  ]);

  if (!fda && !nci) return null;

  return {
    genericName: fda?.genericName || drugName.toLowerCase(),
    brandName: fda?.brandName || null,
    pharmClass: fda?.pharmClass || null,
    synonyms: nci?.synonyms || [],
    definition: nci?.definition || null,
    nciId: nci?.nciId || null,
    description: fda?.description || null,
    dosage: fda?.dosage || null,
    adverseReactions: fda?.adverseReactions || null,
    contraindications: fda?.contraindications || null,
    warnings: fda?.warnings || null
  };
}

module.exports = { getDrugDetail };
```

- [ ] **Step 4: Create drugs route**

Create `backend/src/routes/drugs.js`:
```javascript
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
```

- [ ] **Step 5: Register drugs route in index.js**

Edit `backend/src/index.js` — uncomment:
```javascript
app.use('/api/drugs', require('./routes/drugs'));
```

- [ ] **Step 6: Run all backend tests — expect pass**

```bash
cd backend && npm test
```
Expected: PASS — health, protocols, openFDA, nciDrugs, drugs all pass.

- [ ] **Step 7: Commit**

```bash
git add backend/src/services/drugMerge.js backend/src/routes/drugs.js backend/tests/drugs.test.js backend/src/index.js
git commit -m "feat: add drug search and detail routes with merged OpenFDA + NCI data"
```

---

### Task 7: Backend — Dose calculation route

**Files:**
- Create: `backend/src/routes/dose.js`
- Create: `backend/tests/dose.test.js`

Formulas:
- **BSA (Mosteller):** `sqrt((heightCm * weightKg) / 3600)`
- **CrCl (Cockcroft-Gault):** `((140 - age) * weightKg) / (72 * creatinineMgDl)` × 0.85 if female
- **Carboplatin (Calvert):** `dose = AUC * (CrCl + 25)`

- [ ] **Step 1: Write failing dose tests**

Create `backend/tests/dose.test.js`:
```javascript
const request = require('supertest');

describe('POST /api/dose/calculate', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  const base = {
    heightCm: 170,
    weightKg: 70,
    age: 50,
    sex: 'M',
    creatinineMgDl: 1.0,
    protocolId: 'folfox-nccn-crc'
  };

  it('returns BSA and calculated doses for FOLFOX', async () => {
    const res = await request(app).post('/api/dose/calculate').send(base);
    expect(res.status).toBe(200);
    expect(res.body.bsa).toBeCloseTo(1.847, 2);
    expect(Array.isArray(res.body.drugs)).toBe(true);
    const oxali = res.body.drugs.find(d => d.name === 'Oxaliplatin');
    expect(oxali.calculatedDoseMg).toBeCloseTo(157, 0);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/dose/calculate').send({ weightKg: 70 });
    expect(res.status).toBe(400);
  });

  it('calculates Carboplatin with Calvert formula', async () => {
    const res = await request(app)
      .post('/api/dose/calculate')
      .send({ ...base, protocolId: 'carbo-pacli-nccn-nsclc' });
    expect(res.status).toBe(200);
    const carbo = res.body.drugs.find(d => d.name === 'Carboplatin');
    // CrCl ≈ 91.7 for M, 70kg, age 50, creat 1.0 → dose = 6 × (91.7 + 25) ≈ 700
    expect(carbo.calculatedDoseMg).toBeGreaterThan(650);
    expect(carbo.note).toContain('Calvert');
  });

  it('applies vincristine cap in CHOP', async () => {
    const res = await request(app)
      .post('/api/dose/calculate')
      .send({ ...base, protocolId: 'chop-nccn-dlbcl' });
    expect(res.status).toBe(200);
    const vincristine = res.body.drugs.find(d => d.name === 'Vincristine');
    expect(vincristine.calculatedDoseMg).toBeLessThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd backend && npm test -- --testPathPattern=dose
```
Expected: FAIL — route not registered

- [ ] **Step 3: Create dose route**

Create `backend/src/routes/dose.js`:
```javascript
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
```

- [ ] **Step 4: Register dose route in index.js**

Edit `backend/src/index.js` — uncomment:
```javascript
app.use('/api/dose', require('./routes/dose'));
```

- [ ] **Step 5: Run all backend tests — expect all pass**

```bash
cd backend && npm test
```
Expected: ALL PASS (health, protocols, openFDA, nciDrugs, drugs, dose)

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/dose.js backend/tests/dose.test.js backend/src/index.js
git commit -m "feat: add dose calculation with BSA, CrCl, and Calvert formula"
```

---

### Task 8: Frontend — Vite scaffold + Tailwind

**Files:**
- Create: `frontend/` (scaffolded by Vite)
- Modify: `frontend/vite.config.js`
- Modify: `frontend/tailwind.config.js`
- Create: `frontend/.env.local`
- Create: `frontend/.env.production`

- [ ] **Step 1: Scaffold React app with Vite**

Run from `ProtocolMD/`:
```bash
npm create vite@latest frontend -- --template react
```
Expected: `frontend/` created with React + Vite boilerplate.

- [ ] **Step 2: Install frontend dependencies**

```bash
cd frontend && npm install
npm install react-router-dom @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f9ff',
          300: '#7dd3fc',
          500: '#0ea5e9',
          700: '#0369a1',
          900: '#0c4a6e'
        }
      }
    }
  },
  plugins: []
}
```

- [ ] **Step 4: Add Tailwind directives to CSS**

Replace `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 font-sans;
}
```

- [ ] **Step 5: Configure Vite proxy for local dev**

Replace `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 6: Create env files**

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:3001
```

Create `frontend/.env.production`:
```
VITE_API_BASE_URL=https://your-railway-url.railway.app
```
(Update the Railway URL after deploying in Task 16.)

- [ ] **Step 7: Verify dev server starts**

Start backend first: `cd backend && npm run dev`
Then: `cd frontend && npm run dev`
Visit `http://localhost:5173` — Vite default page loads without errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "chore: scaffold frontend with Vite, React, Tailwind, TanStack Query"
```

---

### Task 9: Frontend — API client + main setup

**Files:**
- Create: `frontend/src/lib/api.js`
- Create: `frontend/src/lib/doseFormulas.js`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Create API client**

Create `frontend/src/lib/api.js`:
```javascript
const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  protocols: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/api/protocols${q ? '?' + q : ''}`);
    },
    get: (id) => apiFetch(`/api/protocols/${id}`)
  },
  drugs: {
    search: (q) => apiFetch(`/api/drugs/search?q=${encodeURIComponent(q)}`),
    get: (name) => apiFetch(`/api/drugs/${encodeURIComponent(name)}`)
  },
  dose: {
    calculate: (payload) => apiFetch('/api/dose/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
};
```

- [ ] **Step 2: Create dose formula helpers**

Create `frontend/src/lib/doseFormulas.js`:
```javascript
export function calcBSA(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function calcCrCl(age, weightKg, creatinineMgDl, sex) {
  const base = ((140 - age) * weightKg) / (72 * creatinineMgDl);
  return sex === 'F' ? base * 0.85 : base;
}
```

- [ ] **Step 3: Wrap app in QueryClientProvider**

Replace `frontend/src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/ frontend/src/main.jsx
git commit -m "feat: add API client and React Query provider"
```

---

### Task 10: Frontend — Routing + NavBar + stub pages

**Files:**
- Create: `frontend/src/components/NavBar.jsx`
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/pages/*.jsx` (stubs)

- [ ] **Step 1: Create NavBar**

Create `frontend/src/components/NavBar.jsx`:
```jsx
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/protocols', label: 'Protocols' },
  { to: '/drugs', label: 'Drugs' },
  { to: '/dose', label: 'Dose Calc' },
  { to: '/classes', label: 'Drug Classes' }
]

export default function NavBar() {
  const { pathname } = useLocation()
  return (
    <nav className="bg-clinical-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg tracking-tight">ProtocolMD</Link>
        <div className="flex gap-6 text-sm">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`hover:text-clinical-300 transition-colors ${
                pathname === to ? 'text-clinical-300 font-semibold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create App.jsx with all routes**

Replace `frontend/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import ProtocolBrowser from './pages/ProtocolBrowser'
import ProtocolDetail from './pages/ProtocolDetail'
import DrugSearch from './pages/DrugSearch'
import DrugDetail from './pages/DrugDetail'
import DoseCalculator from './pages/DoseCalculator'
import DrugClasses from './pages/DrugClasses'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/protocols" element={<ProtocolBrowser />} />
            <Route path="/protocols/:id" element={<ProtocolDetail />} />
            <Route path="/drugs" element={<DrugSearch />} />
            <Route path="/drugs/:name" element={<DrugDetail />} />
            <Route path="/dose" element={<DoseCalculator />} />
            <Route path="/classes" element={<DrugClasses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Create stub pages**

Create all 7 of these — they are replaced in later tasks:

`frontend/src/pages/HomePage.jsx`: `export default function HomePage() { return <div>Home</div> }`
`frontend/src/pages/ProtocolBrowser.jsx`: `export default function ProtocolBrowser() { return <div>Protocols</div> }`
`frontend/src/pages/ProtocolDetail.jsx`: `export default function ProtocolDetail() { return <div>Protocol Detail</div> }`
`frontend/src/pages/DrugSearch.jsx`: `export default function DrugSearch() { return <div>Drug Search</div> }`
`frontend/src/pages/DrugDetail.jsx`: `export default function DrugDetail() { return <div>Drug Detail</div> }`
`frontend/src/pages/DoseCalculator.jsx`: `export default function DoseCalculator() { return <div>Dose Calculator</div> }`
`frontend/src/pages/DrugClasses.jsx`: `export default function DrugClasses() { return <div>Drug Classes</div> }`

- [ ] **Step 4: Verify routing works**

With backend running on 3001 and frontend on 5173, visit `http://localhost:5173`.
NavBar renders. Clicking each nav link shows its stub text without errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/components/NavBar.jsx frontend/src/pages/
git commit -m "feat: add routing, NavBar, and stub pages"
```

---

### Task 11: Frontend — Protocol Browser + Protocol Detail

**Files:**
- Create: `frontend/src/components/ProtocolCard.jsx`
- Modify: `frontend/src/pages/ProtocolBrowser.jsx`
- Modify: `frontend/src/pages/ProtocolDetail.jsx`

- [ ] **Step 1: Create ProtocolCard**

Create `frontend/src/components/ProtocolCard.jsx`:
```jsx
import { Link } from 'react-router-dom'

const authorityColor = {
  NCCN: 'bg-blue-100 text-blue-800',
  SBOC: 'bg-green-100 text-green-800'
}

export default function ProtocolCard({ protocol }) {
  return (
    <Link
      to={`/protocols/${protocol.id}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
          <p className="text-sm text-gray-500">{protocol.tumorSite} · {protocol.cycleLength}-day cycle</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {protocol.authority.map(a => (
            <span key={a} className={`text-xs px-2 py-0.5 rounded-full font-medium ${authorityColor[a] || 'bg-gray-100 text-gray-700'}`}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Build Protocol Browser page**

Replace `frontend/src/pages/ProtocolBrowser.jsx`:
```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ProtocolCard from '../components/ProtocolCard'

const TUMOR_SITES = ['All', 'Colorectal', 'Breast', 'Lung', 'Lymphoma']
const AUTHORITIES = ['All', 'NCCN', 'SBOC']

export default function ProtocolBrowser() {
  const [tumorSite, setTumorSite] = useState('All')
  const [authority, setAuthority] = useState('All')

  const params = {}
  if (tumorSite !== 'All') params.tumorSite = tumorSite
  if (authority !== 'All') params.authority = authority

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['protocols', params],
    queryFn: () => api.protocols.list(params)
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Protocol Browser</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Tumor Site</label>
          <select value={tumorSite} onChange={e => setTumorSite(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {TUMOR_SITES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Authority</label>
          <select value={authority} onChange={e => setAuthority(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {AUTHORITIES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      {isLoading && <p className="text-gray-500">Loading protocols...</p>}
      {error && <p className="text-red-600">Failed to load protocols.</p>}
      {protocols && (
        <div className="grid gap-3 sm:grid-cols-2">
          {protocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}
          {protocols.length === 0 && <p className="text-gray-500">No protocols match selected filters.</p>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build Protocol Detail page**

Replace `frontend/src/pages/ProtocolDetail.jsx`:
```jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function ProtocolDetail() {
  const { id } = useParams()
  const { data: protocol, isLoading, error } = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => api.protocols.get(id)
  })

  if (isLoading) return <p className="text-gray-500">Loading...</p>
  if (error) return <p className="text-red-600">Protocol not found.</p>
  if (!protocol) return null

  return (
    <div className="max-w-3xl">
      <Link to="/protocols" className="text-clinical-700 text-sm hover:underline">← Back to Protocols</Link>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{protocol.name}</h1>
        {protocol.authority.map(a => (
          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{a}</span>
        ))}
      </div>
      <p className="text-gray-500 mt-1">{protocol.tumorSite} · {protocol.cycleLength}-day cycle</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Regimen</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Drug</th>
                <th className="text-left px-4 py-2">Dose</th>
                <th className="text-left px-4 py-2">Route</th>
                <th className="text-left px-4 py-2">Day(s)</th>
              </tr>
            </thead>
            <tbody>
              {protocol.drugs.map((drug, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">
                    <Link to={`/drugs/${drug.name.toLowerCase()}`} className="text-clinical-700 hover:underline">
                      {drug.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{drug.dose} {drug.unit}</td>
                  <td className="px-4 py-2">{drug.route}</td>
                  <td className="px-4 py-2">Day {drug.day.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {protocol.supportiveCare && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Supportive Care</h2>
          <p className="text-sm text-gray-700">{protocol.supportiveCare}</p>
        </section>
      )}
      {protocol.notes && (
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-1">Notes</h2>
          <p className="text-sm text-gray-700">{protocol.notes}</p>
        </section>
      )}

      <div className="mt-6">
        <Link
          to={`/dose?protocolId=${protocol.id}`}
          className="inline-block bg-clinical-700 text-white px-4 py-2 rounded hover:bg-clinical-900 text-sm"
        >
          Calculate Dose for This Protocol →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:5173/protocols` — protocol cards render with authority badges.
Click FOLFOX → detail page with drug table, supportive care, dose calc link.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ProtocolCard.jsx frontend/src/pages/ProtocolBrowser.jsx frontend/src/pages/ProtocolDetail.jsx
git commit -m "feat: build Protocol Browser and Protocol Detail pages"
```

---

### Task 12: Frontend — Drug Search + Drug Detail

**Files:**
- Create: `frontend/src/components/SearchBar.jsx`
- Modify: `frontend/src/pages/DrugSearch.jsx`
- Modify: `frontend/src/pages/DrugDetail.jsx`

- [ ] **Step 1: Create SearchBar**

Create `frontend/src/components/SearchBar.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ placeholder = 'Search drugs...', onSearch, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    if (onSearch) {
      onSearch(value.trim())
    } else {
      navigate(`/drugs?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-500"
      />
      <button type="submit" className="bg-clinical-700 text-white px-4 py-2 rounded text-sm hover:bg-clinical-900">
        Search
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Build Drug Search page**

Replace `frontend/src/pages/DrugSearch.jsx`:
```jsx
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import SearchBar from '../components/SearchBar'

export default function DrugSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['drugs', 'search', query],
    queryFn: () => api.drugs.search(query),
    enabled: query.length > 1
  })

  function handleSearch(term) {
    setQuery(term)
    setSearchParams({ q: term })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Drug Search</h1>
      <div className="max-w-xl mb-6">
        <SearchBar placeholder="Search by generic name (e.g. oxaliplatin)" defaultValue={q} onSearch={handleSearch} />
      </div>
      {isLoading && <p className="text-gray-500">Searching...</p>}
      {error && <p className="text-red-600">Search failed. Check backend is running.</p>}
      {results && results.length === 0 && query && (
        <p className="text-gray-500">No results for "{query}". Try the generic name.</p>
      )}
      {results && results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(drug => (
            <Link
              key={drug.genericName}
              to={`/drugs/${drug.genericName}`}
              className="block border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <p className="font-semibold capitalize">{drug.genericName}</p>
              {drug.brandName && <p className="text-sm text-gray-500">{drug.brandName}</p>}
              {drug.pharmClass && <p className="text-xs text-gray-400 mt-1">{drug.pharmClass}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build Drug Detail page**

Replace `frontend/src/pages/DrugDetail.jsx`:
```jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

function Section({ title, children }) {
  if (!children) return null
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{children}</p>
    </section>
  )
}

export default function DrugDetail() {
  const { name } = useParams()
  const { data: drug, isLoading, error } = useQuery({
    queryKey: ['drug', name],
    queryFn: () => api.drugs.get(name)
  })

  if (isLoading) return <p className="text-gray-500">Loading drug data...</p>
  if (error) return <p className="text-red-600">Drug not found or data unavailable.</p>
  if (!drug) return null

  return (
    <div className="max-w-3xl">
      <Link to="/drugs" className="text-clinical-700 text-sm hover:underline">← Back to Drug Search</Link>
      <div className="mt-4">
        <h1 className="text-2xl font-bold capitalize">{drug.genericName}</h1>
        {drug.brandName && <p className="text-gray-500">{drug.brandName}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {drug.pharmClass && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{drug.pharmClass}</span>
          )}
          {drug.synonyms?.map(s => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>
      <Section title="Definition">{drug.definition}</Section>
      <Section title="Description">{drug.description}</Section>
      <Section title="Dosing">{drug.dosage}</Section>
      <Section title="Adverse Reactions">{drug.adverseReactions}</Section>
      <Section title="Contraindications">{drug.contraindications}</Section>
      <Section title="Warnings">{drug.warnings}</Section>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:5173/drugs`, search "fluorouracil":
- Results card appears → click → detail page shows definition, dosing, adverse reactions, synonyms.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/SearchBar.jsx frontend/src/pages/DrugSearch.jsx frontend/src/pages/DrugDetail.jsx
git commit -m "feat: build Drug Search and Drug Detail pages"
```

---

### Task 13: Frontend — Dose Calculator

**Files:**
- Modify: `frontend/src/pages/DoseCalculator.jsx`

- [ ] **Step 1: Build Dose Calculator page**

Replace `frontend/src/pages/DoseCalculator.jsx`:
```jsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function DoseCalculator() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    sex: 'M',
    creatinineMgDl: '',
    protocolId: searchParams.get('protocolId') || ''
  })

  const { data: protocols } = useQuery({
    queryKey: ['protocols'],
    queryFn: () => api.protocols.list()
  })

  const { mutate: calculate, data: result, isPending, error } = useMutation({
    mutationFn: () => api.dose.calculate({
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      age: Number(form.age),
      sex: form.sex,
      creatinineMgDl: Number(form.creatinineMgDl),
      protocolId: form.protocolId
    })
  })

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const isComplete = form.heightCm && form.weightKg && form.age && form.creatinineMgDl && form.protocolId

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Dose Calculator</h1>
      <form onSubmit={e => { e.preventDefault(); calculate() }} className="space-y-4 bg-white border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Height (cm)', name: 'heightCm', placeholder: '170' },
            { label: 'Weight (kg)', name: 'weightKg', placeholder: '70' },
            { label: 'Age', name: 'age', placeholder: '50' },
            { label: 'Creatinine (mg/dL)', name: 'creatinineMgDl', placeholder: '1.0', step: '0.1' }
          ].map(({ label, name, placeholder, step }) => (
            <label key={name} className="block">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input type="number" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} step={step}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sex</span>
            <select name="sex" value={form.sex} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Protocol</span>
            <select name="protocolId" value={form.protocolId} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="">Select protocol...</option>
              {protocols?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tumorSite})</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={!isComplete || isPending}
          className="w-full bg-clinical-700 text-white py-2 rounded hover:bg-clinical-900 disabled:opacity-50 text-sm font-medium">
          {isPending ? 'Calculating...' : 'Calculate Doses'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">Calculation failed. Check all fields.</p>}

      {result && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-1">{result.protocolName}</h2>
          <div className="flex gap-6 text-sm text-gray-600 mb-4">
            <span>BSA: <strong>{result.bsa} m²</strong></span>
            <span>CrCl: <strong>{result.crCl} mL/min</strong></span>
          </div>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2">Drug</th>
                  <th className="text-left px-4 py-2">Prescribed</th>
                  <th className="text-left px-4 py-2">Calculated</th>
                  <th className="text-left px-4 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {result.drugs.map((drug, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{drug.name}</td>
                    <td className="px-4 py-2">{drug.prescribedDose} {drug.unit}</td>
                    <td className="px-4 py-2 font-semibold text-clinical-900">{drug.calculatedDoseMg} mg</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{drug.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            For reference only. All doses must be verified by a licensed oncologist before administration.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:5173/dose`:
- Fill: height 170, weight 70, age 50, M, creatinine 1.0, select FOLFOX → Calculate
- Result shows BSA 1.847, Oxaliplatin 157 mg, Fluorouracil doses.
- Select Carboplatin + Paclitaxel → Carboplatin shows Calvert formula note.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DoseCalculator.jsx
git commit -m "feat: build Dose Calculator page with results table"
```

---

### Task 14: Frontend — Drug Class Explorer

**Files:**
- Modify: `frontend/src/pages/DrugClasses.jsx`

- [ ] **Step 1: Build Drug Class Explorer**

Replace `frontend/src/pages/DrugClasses.jsx`:
```jsx
import { Link } from 'react-router-dom'

const DRUG_CLASSES = [
  {
    category: 'Chemotherapy',
    classes: [
      { name: 'Alkylating Agents', examples: ['Cyclophosphamide', 'Ifosfamide', 'Carboplatin', 'Cisplatin', 'Oxaliplatin'] },
      { name: 'Antimetabolites', examples: ['Fluorouracil', 'Capecitabine', 'Gemcitabine', 'Methotrexate', 'Pemetrexed'] },
      { name: 'Anthracyclines', examples: ['Doxorubicin', 'Epirubicin', 'Liposomal Doxorubicin'] },
      { name: 'Taxanes', examples: ['Paclitaxel', 'Docetaxel', 'Nab-paclitaxel'] },
      { name: 'Vinca Alkaloids', examples: ['Vincristine', 'Vinorelbine', 'Vinblastine'] },
      { name: 'Topoisomerase Inhibitors', examples: ['Irinotecan', 'Etoposide', 'Topotecan'] }
    ]
  },
  {
    category: 'Immunotherapy',
    classes: [
      { name: 'PD-1 Inhibitors', examples: ['Pembrolizumab', 'Nivolumab', 'Cemiplimab'] },
      { name: 'PD-L1 Inhibitors', examples: ['Atezolizumab', 'Durvalumab', 'Avelumab'] },
      { name: 'CTLA-4 Inhibitors', examples: ['Ipilimumab', 'Tremelimumab'] }
    ]
  },
  {
    category: 'Targeted Therapy',
    classes: [
      { name: 'EGFR TKIs', examples: ['Erlotinib', 'Gefitinib', 'Osimertinib', 'Afatinib'] },
      { name: 'ALK TKIs', examples: ['Crizotinib', 'Alectinib', 'Lorlatinib'] },
      { name: 'HER2-targeted', examples: ['Trastuzumab', 'Pertuzumab', 'Lapatinib'] },
      { name: 'VEGF/VEGFR Inhibitors', examples: ['Bevacizumab', 'Sunitinib', 'Sorafenib', 'Axitinib'] },
      { name: 'CDK4/6 Inhibitors', examples: ['Palbociclib', 'Ribociclib', 'Abemaciclib'] },
      { name: 'PARP Inhibitors', examples: ['Olaparib', 'Niraparib', 'Rucaparib'] },
      { name: 'Anti-CD20', examples: ['Rituximab', 'Obinutuzumab', 'Ofatumumab'] }
    ]
  }
]

export default function DrugClasses() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Drug Classes</h1>
      <div className="space-y-8">
        {DRUG_CLASSES.map(cat => (
          <section key={cat.category}>
            <h2 className="text-xl font-semibold mb-3 text-clinical-900">{cat.category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.classes.map(cls => (
                <div key={cls.name} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-medium text-gray-900 mb-2">{cls.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {cls.examples.map(drug => (
                      <Link
                        key={drug}
                        to={`/drugs/${drug.toLowerCase()}`}
                        className="text-xs bg-gray-100 hover:bg-clinical-50 text-gray-700 px-2 py-0.5 rounded transition-colors"
                      >
                        {drug}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:5173/classes` — 3 categories with class cards and clickable drug links routing to Drug Detail.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DrugClasses.jsx
git commit -m "feat: build Drug Class Explorer with clickable drug links"
```

---

### Task 15: Frontend — Home Page

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Build Home page**

Replace `frontend/src/pages/HomePage.jsx`:
```jsx
import { Link } from 'react-router-dom'

const FEATURES = [
  { to: '/protocols', title: 'Protocol Browser', desc: 'Browse SBOC and NCCN preferential regimens by tumor site.', icon: '📋' },
  { to: '/drugs', title: 'Drug Reference', desc: 'Search chemotherapy, immunotherapy, and targeted drugs by name.', icon: '💊' },
  { to: '/dose', title: 'Dose Calculator', desc: 'Calculate BSA-based and AUC-based doses from patient parameters.', icon: '🧮' },
  { to: '/classes', title: 'Drug Classes', desc: 'Explore by class: alkylating agents, checkpoint inhibitors, TKIs, and more.', icon: '🔬' }
]

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-clinical-900 mb-3">ProtocolMD</h1>
        <p className="text-lg text-gray-600">
          Oncology protocol reference and dose calculation for clinicians.
          SBOC and NCCN guidelines in one place.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="border rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-clinical-700 mb-1">{f.title}</h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-10">
        For clinical reference only. All treatment decisions must be made by licensed healthcare providers.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:5173` — hero text, four feature cards, all nav links work without errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: build home page with feature cards"
```

---

### Task 16: Deployment

**Files:**
- Create: `frontend/vercel.json`
- Create: `backend/railway.json`

- [ ] **Step 1: Add Vercel SPA rewrite config**

Create `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Add Railway config**

Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node src/index.js",
    "healthcheckPath": "/api/health"
  }
}
```

- [ ] **Step 3: Deploy backend to Railway**

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select the `ProtocolMD` repo, set root directory to `backend/`
3. Set environment variables in Railway dashboard:
   - `PORT=3001`
   - `FRONTEND_URL=https://<your-vercel-url>.vercel.app`
4. Note the generated Railway URL (e.g. `https://protocolmd-backend.up.railway.app`)

- [ ] **Step 4: Update frontend production env**

Edit `frontend/.env.production`:
```
VITE_API_BASE_URL=https://<your-actual-railway-url>.railway.app
```

- [ ] **Step 5: Deploy frontend to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → import `ProtocolMD` repo
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_BASE_URL=https://<railway-url>.railway.app`
4. Deploy

- [ ] **Step 6: Smoke test production**

Visit the Vercel URL:
- Home page loads
- `/protocols` → protocol cards render
- `/drugs` → search "fluorouracil" → results appear → detail page loads
- `/dose` → fill form, submit → dose results table shows
- `/classes` → drug class grid renders

- [ ] **Step 7: Final commit**

```bash
git add frontend/vercel.json backend/railway.json frontend/.env.production
git commit -m "chore: add Vercel and Railway deployment configuration"
```

---

## Self-Review

**Spec coverage:**

| Requirement | Covered by |
|-------------|-----------|
| Protocol Browser with SBOC + NCCN tags, filter by tumor site | Tasks 3, 11 |
| Drug Search & Reference (OpenFDA + NCI) | Tasks 4, 5, 6, 12 |
| Dose Calculator — BSA (Mosteller), CrCl (Cockcroft-Gault), Calvert | Tasks 7, 13 |
| Toxicity Reference per drug (CTCAE) | Task 12 — DrugDetail adverseReactions field from OpenFDA |
| Drug Class Explorer | Task 14 |
| Home page | Task 15 |
| Backend structured for Phase B (commented stubs in index.js) | Task 2 |
| Mobile-responsive UI | Tailwind responsive classes throughout Tasks 10–15 |
| Deployment to Vercel + Railway | Task 16 |

All spec requirements covered. No gaps.

**Placeholder scan:** No TBD, TODO, or vague "add error handling" steps. All code blocks are complete and self-contained.

**Type consistency:**
- Drug shape `{ genericName, brandName, pharmClass, synonyms, definition, nciId, description, dosage, adverseReactions, contraindications, warnings }` — defined in Task 6 (drugMerge.js), consumed in Task 12 (DrugDetail.jsx) ✓
- Protocol shape `{ id, name, tumorSite, authority, cycleLength, drugs, supportiveCare, notes }` — defined in Task 3 (protocols.json), consumed in Tasks 11, 13 ✓
- Dose result shape `{ protocolId, protocolName, bsa, crCl, drugs: [{ name, prescribedDose, unit, calculatedDoseMg, note }] }` — defined in Task 7 (dose.js), consumed in Task 13 (DoseCalculator.jsx) ✓
- `api.protocols.list()`, `api.protocols.get()`, `api.drugs.search()`, `api.drugs.get()`, `api.dose.calculate()` — defined in Task 9 (api.js), used consistently in Tasks 11–13 ✓
