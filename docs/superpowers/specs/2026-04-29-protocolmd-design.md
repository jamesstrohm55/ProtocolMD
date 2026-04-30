# ProtocolMD — Design Spec
**Date:** 2026-04-29  
**Author:** James Strohm  
**Status:** Approved

---

## Overview

ProtocolMD is a web-based clinical reference and dose calculation tool for oncologists. It combines SBOC and NCCN preferential treatment protocols with drug-level reference data (OpenFDA + NCI Drug Dictionary) into a single, fast, mobile-responsive interface. The initial release (Phase A) is a React frontend + Node/Express backend proxy. Phase B adds user accounts, a database, and saved data.

---

## Target User

Oncologists — primarily in Brazil (SBOC) and the US (NCCN) — who need fast access to preferential protocols, drug dosing, toxicity profiles, and dose calculation at the point of care.

---

## Architecture

### Phase A (current scope)

```
[React Frontend] ──► [Node/Express Backend] ──► [OpenFDA API]
                                            ──► [NCI Drug Dictionary API]
```

- **Frontend:** React 19, React Router, TanStack Query, Tailwind CSS
- **Backend:** Node.js + Express — proxies OpenFDA and NCI API calls, handles CORS, and provides a clean API boundary for Phase B additions
- **Protocol data:** Manually curated JSON seed files (SBOC + NCCN regimens) served by the backend
- **Deploy:** Frontend → Vercel, Backend → Railway

### Phase B (future)

Adds to the backend:
- PostgreSQL database (via Prisma ORM)
- Auth (JWT-based user accounts)
- Saved protocols, dose history, custom notes per user

The backend is structured from Phase A with route organization and middleware hooks ready for Phase B additions — no rewrite needed.

---

## Features

### 1. Protocol Browser
- Browse by tumor site / cancer type
- Each protocol tagged with authority: **SBOC**, **NCCN**, or **Both**
- Protocol detail view shows: regimen name, cycle structure, drugs + standard doses, supportive care notes
- Filterable by authority, tumor site, drug class

### 2. Drug Search & Reference
- Search by drug name (generic or brand)
- Detail page shows:
  - Drug class (alkylating agent, antimetabolite, taxane, checkpoint inhibitor, TKI, etc.)
  - Mechanism of action
  - Standard dosing rules
  - Expected toxicities (CTCAE Grade 1–4)
  - Contraindications and special populations
- Powered by OpenFDA (label content) + NCI Drug Dictionary (class, mechanism, cancer context)

### 3. Dose Calculator
- Inputs: patient height, weight (auto-calculates BSA via Mosteller formula), creatinine clearance (Cockcroft-Gault)
- User selects a regimen; app outputs calculated dose per drug with standard capping rules applied
- Displays: calculated dose (mg), dose per m² or mg/kg reference, cycle day schedule

### 4. Toxicity Reference
- Per-drug toxicity lookup
- CTCAE-graded (Grade 1–4) with clinical descriptions
- Grouped by system (hematologic, GI, hepatic, renal, neurologic, dermatologic, etc.)

### 5. Drug Class Explorer
- Browse drugs by therapeutic class:
  - Chemotherapy: alkylating agents, antimetabolites, anthracyclines, taxanes, vinca alkaloids, topoisomerase inhibitors
  - Immunotherapy: checkpoint inhibitors (PD-1, PD-L1, CTLA-4), CAR-T context
  - Targeted therapy: TKIs, monoclonal antibodies, PARP inhibitors, CDK4/6 inhibitors, etc.

---

## Data Sources

| Layer | Source | Access |
|-------|--------|--------|
| Drug labels (dosing, toxicity, contraindications) | OpenFDA API | Free, no key required |
| Drug class, mechanism, cancer indications | NCI Drug Dictionary API | Free, no key required |
| Treatment protocols | Manually curated JSON (SBOC + NCCN) | Maintained in-repo |

---

## Data Model (Protocol Seed Schema)

```json
{
  "id": "folfox-nccn-crc",
  "name": "FOLFOX",
  "tumorSite": "Colorectal",
  "authority": ["NCCN"],
  "preferential": true,
  "cycleLength": 14,
  "drugs": [
    { "name": "Oxaliplatin", "dose": 85, "unit": "mg/m2", "day": [1] },
    { "name": "Leucovorin", "dose": 400, "unit": "mg/m2", "day": [1] },
    { "name": "Fluorouracil", "dose": 400, "unit": "mg/m2", "day": [1], "route": "IV bolus" },
    { "name": "Fluorouracil", "dose": 2400, "unit": "mg/m2", "day": [1, 2], "route": "continuous infusion" }
  ],
  "supportiveCare": "Antiemetic prophylaxis per ASCO guidelines",
  "notes": ""
}
```

---

## Backend Route Structure

```
/api/drugs/search?q=          → proxies NCI + OpenFDA
/api/drugs/:name              → drug detail (merged NCI + OpenFDA response)
/api/protocols                → list all protocols (from seed data)
/api/protocols/:id            → single protocol detail
/api/dose/calculate           → dose calculation logic (BSA, CrCl, caps)

# Phase B additions (stubs present, not implemented)
/api/auth/register
/api/auth/login
/api/users/:id/saved
```

---

## Dose Calculation Logic

- **BSA:** Mosteller formula — `√(height_cm × weight_kg / 3600)`
- **CrCl:** Cockcroft-Gault — `((140 - age) × weight_kg) / (72 × creatinine_mg_dL)` × 0.85 if female
- **Dose caps:** Applied per drug where standard caps exist (e.g., Carboplatin AUC capped at standard values)
- **Output:** Total dose in mg, reference dose (mg/m² or AUC), cycle schedule

---

## UI / UX

- Mobile-responsive (Tailwind CSS breakpoints)
- Dark mode support
- Fast search with debounced input
- Clean clinical aesthetic — not consumer, not over-designed
- No login required in Phase A (all reference data is public-access)

---

## Deployment

| Service | Target |
|---------|--------|
| Frontend | Vercel (auto-deploy from main branch) |
| Backend | Railway (Node/Express container) |
| Domain | TBD — custom domain optional |

---

## Phase B Additions (Out of Scope Now)

- User accounts (JWT auth)
- Saved protocols and favorites
- Patient dose history
- Custom protocol notes
- PostgreSQL + Prisma ORM
- Admin panel for curating protocol seed data

---

## Success Criteria

- Oncologist can find a preferential SBOC or NCCN protocol for a given tumor site in under 10 seconds
- Drug search returns accurate class, dosing, and toxicity data
- Dose calculator produces correct BSA and drug doses for a standard regimen
- App is deployed and accessible via public URL
- Codebase is clean enough to extend to Phase B without rewriting the backend
