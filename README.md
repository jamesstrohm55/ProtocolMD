# ProtocolMD

Oncology protocol reference and dose calculation tool for clinicians. Browse SBOC and NCCN preferential treatment regimens, search drug reference data, and calculate patient-specific doses at the point of care.

---

## Features

- **Protocol Browser** — Browse SBOC and NCCN preferential regimens by tumor site, with filtering by authority
- **Drug Reference** — Search drugs by generic name; results pull from OpenFDA (labels, dosing, toxicity, contraindications) and NCI Drug Dictionary (class, mechanism, synonyms)
- **Dose Calculator** — Enter patient height, weight, age, sex, and creatinine; get BSA (Mosteller) and CrCl (Cockcroft-Gault) with calculated doses per regimen drug (Calvert formula for carboplatin)
- **Drug Class Explorer** — Browse by therapeutic class: chemotherapy, immunotherapy, and targeted therapy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 5, React Router v6, TanStack Query v5, Tailwind CSS v3 |
| Backend | Node.js 20, Express 4 |
| Data | OpenFDA API, NCI Drug Dictionary API, curated SBOC/NCCN JSON |
| Deploy | Frontend → Vercel, Backend → Railway |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/jamesstrohm55/ProtocolMD.git
cd ProtocolMD
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3001`.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend automatically.

---

## Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/protocols` | List all protocols (filter: `?tumorSite=Lung&authority=NCCN`) |
| GET | `/api/protocols/:id` | Single protocol detail |
| GET | `/api/drugs/search?q=name` | Search drug by generic name |
| GET | `/api/drugs/:name` | Full drug detail (OpenFDA + NCI merged) |
| POST | `/api/dose/calculate` | Calculate doses for a patient + protocol |

### Dose calculation payload

```json
{
  "heightCm": 170,
  "weightKg": 70,
  "age": 50,
  "sex": "M",
  "creatinineMgDl": 1.0,
  "protocolId": "folfox-nccn-crc"
}
```

---

## Running Tests

```bash
cd backend
npm test
```

16 tests covering health, protocols, drug routes, OpenFDA service, NCI service, and dose calculations.

---

## Deployment

### Backend → Railway

1. Create a new project in [Railway](https://railway.app), connect this repo, set root to `backend/`
2. Add environment variables:
   - `PORT=3001`
   - `FRONTEND_URL=https://<your-vercel-url>.vercel.app`
3. Railway will auto-detect Node and use `node src/index.js` as the start command

### Frontend → Vercel

1. Import this repo in [Vercel](https://vercel.com), set root to `frontend/`
2. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-railway-url>.railway.app`
3. Deploy — Vercel handles the SPA routing via `vercel.json`

---

## Data Sources

| Source | Data | Auth |
|--------|------|------|
| [OpenFDA](https://open.fda.gov/apis/drug/label/) | Drug labels, dosing, adverse reactions, contraindications | None required |
| [NCI Drug Dictionary](https://clinicaltrialsapi.cancer.gov/) | Drug class, mechanism, synonyms | None required (optional API key) |
| `backend/src/data/protocols.json` | SBOC + NCCN protocol regimens | Maintained in-repo |

---

## Dose Formulas

- **BSA (Mosteller):** `√(height_cm × weight_kg / 3600)`
- **CrCl (Cockcroft-Gault):** `((140 − age) × weight_kg) / (72 × creatinine)` × 0.85 if female
- **Carboplatin (Calvert):** `dose = AUC × (CrCl + 25)`

---

## Disclaimer

For clinical reference only. All treatment decisions and dose calculations must be verified by a licensed oncologist before administration.
