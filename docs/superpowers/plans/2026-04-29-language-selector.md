# Language Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English / Spanish / Brazilian Portuguese language selector to the entire ProtocolMD frontend, with localStorage persistence.

**Architecture:** react-i18next with i18next-browser-languagedetector handles detection and persistence. Translation keys live in three JSON locale files imported at bundle time (no async loading). A `<select>` in the NavBar calls `i18next.changeLanguage()` on change. All static UI text is wrapped in `t('key')` calls; dynamic OpenFDA content stays in English as-is.

**Tech Stack:** react-i18next v17, i18next v26, i18next-browser-languagedetector v8, React 19, Vite 5, Tailwind CSS v3

---

## File Map

**New files:**
- `frontend/src/i18n/index.js` — i18next configuration (language detector, resources, fallback)
- `frontend/src/i18n/locales/en.json` — English strings
- `frontend/src/i18n/locales/es.json` — Spanish strings
- `frontend/src/i18n/locales/pt-BR.json` — Brazilian Portuguese strings

**Modified files:**
- `frontend/package.json` — add 3 new dependencies
- `frontend/src/main.jsx` — import i18n init, wrap `<App>` in `<Suspense>`
- `frontend/src/components/NavBar.jsx` — language selector + translated nav links
- `frontend/src/pages/HomePage.jsx` — translate all static text
- `frontend/src/pages/ProtocolBrowser.jsx` — translate labels and status strings
- `frontend/src/pages/ProtocolDetail.jsx` — translate section headers and status strings
- `frontend/src/pages/DrugSearch.jsx` — translate headings, placeholder, status strings
- `frontend/src/pages/DrugDetail.jsx` — translate section headers and status strings
- `frontend/src/pages/DoseCalculator.jsx` — translate all form labels and results table headers
- `frontend/src/pages/DrugClasses.jsx` — translate page title and category headers

---

### Task 1: Install packages, create locale files, configure i18next, wire up main.jsx

**Files:**
- Create: `frontend/src/i18n/index.js`
- Create: `frontend/src/i18n/locales/en.json`
- Create: `frontend/src/i18n/locales/es.json`
- Create: `frontend/src/i18n/locales/pt-BR.json`
- Modify: `frontend/package.json`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Install i18n packages**

Run from `frontend/` directory:
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```
Expected: packages added to node_modules, package.json dependencies updated.

- [ ] **Step 2: Create the English locale file**

Create `frontend/src/i18n/locales/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "protocols": "Protocols",
    "drugs": "Drugs",
    "doseCalc": "Dose Calc",
    "drugClasses": "Drug Classes"
  },
  "home": {
    "subtitle": "Oncology protocol reference and dose calculation for clinicians. SBOC and NCCN guidelines in one place.",
    "disclaimer": "For clinical reference only. All treatment decisions must be made by licensed healthcare providers.",
    "features": {
      "protocols": {
        "title": "Protocol Browser",
        "desc": "Browse SBOC and NCCN preferential regimens by tumor site."
      },
      "drugs": {
        "title": "Drug Reference",
        "desc": "Search chemotherapy, immunotherapy, and targeted drugs by name."
      },
      "dose": {
        "title": "Dose Calculator",
        "desc": "Calculate BSA-based and AUC-based doses from patient parameters."
      },
      "classes": {
        "title": "Drug Classes",
        "desc": "Explore by class: alkylating agents, checkpoint inhibitors, TKIs, and more."
      }
    }
  },
  "protocols": {
    "title": "Protocol Browser",
    "tumorSite": "Tumor Site",
    "authority": "Authority",
    "loading": "Loading protocols...",
    "loadError": "Failed to load protocols.",
    "noResults": "No protocols match selected filters.",
    "notFound": "Protocol not found.",
    "backToProtocols": "← Back to Protocols",
    "cycleLength": "{{days}}-day cycle",
    "regimen": "Regimen",
    "drug": "Drug",
    "dose": "Dose",
    "route": "Route",
    "days": "Day(s)",
    "day": "Day",
    "supportiveCare": "Supportive Care",
    "notes": "Notes",
    "calcDose": "Calculate Dose for This Protocol →"
  },
  "drugs": {
    "searchTitle": "Drug Search",
    "searchPlaceholder": "Search by generic name (e.g. oxaliplatin)",
    "searching": "Searching...",
    "searchError": "Search failed. Check backend is running.",
    "noResults": "No results for \"{{query}}\". Try the generic name.",
    "loading": "Loading drug data...",
    "notFound": "Drug not found or data unavailable.",
    "backToSearch": "← Back to Drug Search",
    "definition": "Definition",
    "description": "Description",
    "dosing": "Dosing",
    "adverseReactions": "Adverse Reactions",
    "contraindications": "Contraindications",
    "warnings": "Warnings"
  },
  "dose": {
    "title": "Dose Calculator",
    "height": "Height (cm)",
    "weight": "Weight (kg)",
    "age": "Age",
    "creatinine": "Creatinine (mg/dL)",
    "sex": "Sex",
    "male": "Male",
    "female": "Female",
    "protocol": "Protocol",
    "selectProtocol": "Select protocol...",
    "calculating": "Calculating...",
    "calculateDoses": "Calculate Doses",
    "calcError": "Calculation failed. Check all fields.",
    "prescribed": "Prescribed",
    "calculated": "Calculated",
    "note": "Note",
    "disclaimer": "For reference only. All doses must be verified by a licensed oncologist before administration."
  },
  "drugClasses": {
    "title": "Drug Classes",
    "chemotherapy": "Chemotherapy",
    "immunotherapy": "Immunotherapy",
    "targetedTherapy": "Targeted Therapy"
  },
  "common": {
    "loading": "Loading...",
    "all": "All"
  }
}
```

- [ ] **Step 3: Create the Spanish locale file**

Create `frontend/src/i18n/locales/es.json`:
```json
{
  "nav": {
    "home": "Inicio",
    "protocols": "Protocolos",
    "drugs": "Fármacos",
    "doseCalc": "Calc. de Dosis",
    "drugClasses": "Clases de Fármacos"
  },
  "home": {
    "subtitle": "Referencia de protocolos oncológicos y cálculo de dosis para clínicos. Guías SBOC y NCCN en un solo lugar.",
    "disclaimer": "Solo para referencia clínica. Todas las decisiones de tratamiento deben ser tomadas por profesionales de salud autorizados.",
    "features": {
      "protocols": {
        "title": "Buscador de Protocolos",
        "desc": "Explore los regímenes preferenciales SBOC y NCCN por localización tumoral."
      },
      "drugs": {
        "title": "Referencia de Fármacos",
        "desc": "Busque quimioterapia, inmunoterapia y fármacos dirigidos por nombre."
      },
      "dose": {
        "title": "Calculadora de Dosis",
        "desc": "Calcule dosis basadas en SCT y AUC a partir de parámetros del paciente."
      },
      "classes": {
        "title": "Clases de Fármacos",
        "desc": "Explore por clase: agentes alquilantes, inhibidores de puntos de control, TKIs y más."
      }
    }
  },
  "protocols": {
    "title": "Buscador de Protocolos",
    "tumorSite": "Localización Tumoral",
    "authority": "Autoridad",
    "loading": "Cargando protocolos...",
    "loadError": "Error al cargar protocolos.",
    "noResults": "Ningún protocolo coincide con los filtros seleccionados.",
    "notFound": "Protocolo no encontrado.",
    "backToProtocols": "← Volver a Protocolos",
    "cycleLength": "Ciclo de {{days}} días",
    "regimen": "Régimen",
    "drug": "Fármaco",
    "dose": "Dosis",
    "route": "Vía",
    "days": "Día(s)",
    "day": "Día",
    "supportiveCare": "Cuidados de Soporte",
    "notes": "Notas",
    "calcDose": "Calcular Dosis para Este Protocolo →"
  },
  "drugs": {
    "searchTitle": "Búsqueda de Fármacos",
    "searchPlaceholder": "Buscar por nombre genérico (p.ej. oxaliplatino)",
    "searching": "Buscando...",
    "searchError": "Búsqueda fallida. Verifique que el backend esté funcionando.",
    "noResults": "Sin resultados para \"{{query}}\". Intente con el nombre genérico.",
    "loading": "Cargando datos del fármaco...",
    "notFound": "Fármaco no encontrado o datos no disponibles.",
    "backToSearch": "← Volver a Búsqueda de Fármacos",
    "definition": "Definición",
    "description": "Descripción",
    "dosing": "Dosificación",
    "adverseReactions": "Reacciones Adversas",
    "contraindications": "Contraindicaciones",
    "warnings": "Advertencias"
  },
  "dose": {
    "title": "Calculadora de Dosis",
    "height": "Talla (cm)",
    "weight": "Peso (kg)",
    "age": "Edad",
    "creatinine": "Creatinina (mg/dL)",
    "sex": "Sexo",
    "male": "Masculino",
    "female": "Femenino",
    "protocol": "Protocolo",
    "selectProtocol": "Seleccionar protocolo...",
    "calculating": "Calculando...",
    "calculateDoses": "Calcular Dosis",
    "calcError": "Error en el cálculo. Verifique todos los campos.",
    "prescribed": "Prescrita",
    "calculated": "Calculada",
    "note": "Nota",
    "disclaimer": "Solo para referencia. Todas las dosis deben ser verificadas por un oncólogo autorizado antes de la administración."
  },
  "drugClasses": {
    "title": "Clases de Fármacos",
    "chemotherapy": "Quimioterapia",
    "immunotherapy": "Inmunoterapia",
    "targetedTherapy": "Terapia Dirigida"
  },
  "common": {
    "loading": "Cargando...",
    "all": "Todos"
  }
}
```

- [ ] **Step 4: Create the Brazilian Portuguese locale file**

Create `frontend/src/i18n/locales/pt-BR.json`:
```json
{
  "nav": {
    "home": "Início",
    "protocols": "Protocolos",
    "drugs": "Fármacos",
    "doseCalc": "Calc. de Dose",
    "drugClasses": "Classes de Fármacos"
  },
  "home": {
    "subtitle": "Referência de protocolos oncológicos e cálculo de dose para clínicos. Diretrizes SBOC e NCCN em um só lugar.",
    "disclaimer": "Apenas para referência clínica. Todas as decisões de tratamento devem ser tomadas por profissionais de saúde habilitados.",
    "features": {
      "protocols": {
        "title": "Navegador de Protocolos",
        "desc": "Navegue pelos regimes preferenciais SBOC e NCCN por sítio tumoral."
      },
      "drugs": {
        "title": "Referência de Fármacos",
        "desc": "Pesquise quimioterapia, imunoterapia e fármacos-alvo por nome."
      },
      "dose": {
        "title": "Calculadora de Dose",
        "desc": "Calcule doses baseadas em SC e AUC a partir dos parâmetros do paciente."
      },
      "classes": {
        "title": "Classes de Fármacos",
        "desc": "Explore por classe: agentes alquilantes, inibidores de checkpoint, TKIs e mais."
      }
    }
  },
  "protocols": {
    "title": "Navegador de Protocolos",
    "tumorSite": "Sítio Tumoral",
    "authority": "Autoridade",
    "loading": "Carregando protocolos...",
    "loadError": "Falha ao carregar protocolos.",
    "noResults": "Nenhum protocolo corresponde aos filtros selecionados.",
    "notFound": "Protocolo não encontrado.",
    "backToProtocols": "← Voltar aos Protocolos",
    "cycleLength": "Ciclo de {{days}} dias",
    "regimen": "Regime",
    "drug": "Fármaco",
    "dose": "Dose",
    "route": "Via",
    "days": "Dia(s)",
    "day": "Dia",
    "supportiveCare": "Cuidados de Suporte",
    "notes": "Notas",
    "calcDose": "Calcular Dose para Este Protocolo →"
  },
  "drugs": {
    "searchTitle": "Pesquisa de Fármacos",
    "searchPlaceholder": "Pesquisar por nome genérico (ex.: oxaliplatina)",
    "searching": "Pesquisando...",
    "searchError": "Pesquisa falhou. Verifique se o backend está em execução.",
    "noResults": "Sem resultados para \"{{query}}\". Tente o nome genérico.",
    "loading": "Carregando dados do fármaco...",
    "notFound": "Fármaco não encontrado ou dados indisponíveis.",
    "backToSearch": "← Voltar à Pesquisa de Fármacos",
    "definition": "Definição",
    "description": "Descrição",
    "dosing": "Posologia",
    "adverseReactions": "Reações Adversas",
    "contraindications": "Contraindicações",
    "warnings": "Advertências"
  },
  "dose": {
    "title": "Calculadora de Dose",
    "height": "Altura (cm)",
    "weight": "Peso (kg)",
    "age": "Idade",
    "creatinine": "Creatinina (mg/dL)",
    "sex": "Sexo",
    "male": "Masculino",
    "female": "Feminino",
    "protocol": "Protocolo",
    "selectProtocol": "Selecionar protocolo...",
    "calculating": "Calculando...",
    "calculateDoses": "Calcular Doses",
    "calcError": "Erro no cálculo. Verifique todos os campos.",
    "prescribed": "Prescrita",
    "calculated": "Calculada",
    "note": "Nota",
    "disclaimer": "Apenas para referência. Todas as doses devem ser verificadas por um oncologista habilitado antes da administração."
  },
  "drugClasses": {
    "title": "Classes de Fármacos",
    "chemotherapy": "Quimioterapia",
    "immunotherapy": "Imunoterapia",
    "targetedTherapy": "Terapia-Alvo"
  },
  "common": {
    "loading": "Carregando...",
    "all": "Todos"
  }
}
```

- [ ] **Step 5: Create the i18next configuration**

Create `frontend/src/i18n/index.js`:
```js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      'pt-BR': { translation: ptBR }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt-BR'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false }
  })

export default i18n
```

- [ ] **Step 6: Update main.jsx to import i18n and add Suspense**

Replace the full contents of `frontend/src/main.jsx`:
```jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './i18n/index.js'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 7: Verify the app starts without errors**

Run from `frontend/`:
```bash
npm run dev
```
Open `http://localhost:5173` in a browser. The app should render normally (no console errors about i18next). The nav links should still show English text.

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/i18n/ frontend/src/main.jsx
git commit -m "feat: add i18next with en/es/pt-BR locale files"
```

---

### Task 2: NavBar — language selector + translated nav links

**Files:**
- Modify: `frontend/src/components/NavBar.jsx`

- [ ] **Step 1: Replace NavBar.jsx with the translated + language-selector version**

Replace the full contents of `frontend/src/components/NavBar.jsx`:
```jsx
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const links = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/protocols', labelKey: 'nav.protocols' },
  { to: '/drugs', labelKey: 'nav.drugs' },
  { to: '/dose', labelKey: 'nav.doseCalc' },
  { to: '/classes', labelKey: 'nav.drugClasses' }
]

export default function NavBar() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  return (
    <nav className="bg-clinical-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg tracking-tight">ProtocolMD</Link>
        <div className="flex items-center gap-6 text-sm">
          {links.map(({ to, labelKey }) => (
            <Link
              key={to}
              to={to}
              className={`hover:text-clinical-300 transition-colors ${
                pathname === to ? 'text-clinical-300 font-semibold' : ''
              }`}
            >
              {t(labelKey)}
            </Link>
          ))}
          <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="border border-clinical-700 bg-clinical-900 text-white rounded px-2 py-0.5 text-sm cursor-pointer hover:border-clinical-400 transition-colors"
          >
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="pt-BR">🇧🇷 Português</option>
          </select>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify in browser**

With dev server running, open `http://localhost:5173`. Change the language dropdown to Español — nav links should switch to "Inicio / Protocolos / Fármacos / Calc. de Dosis / Clases de Fármacos". Switch to Português — should switch again. Reload the page — selected language should persist.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NavBar.jsx
git commit -m "feat: add language selector to NavBar with translated nav links"
```

---

### Task 3: Translate HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Replace HomePage.jsx**

Replace the full contents of `frontend/src/pages/HomePage.jsx`:
```jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()

  const FEATURES = [
    { to: '/protocols', titleKey: 'home.features.protocols.title', descKey: 'home.features.protocols.desc' },
    { to: '/drugs', titleKey: 'home.features.drugs.title', descKey: 'home.features.drugs.desc' },
    { to: '/dose', titleKey: 'home.features.dose.title', descKey: 'home.features.dose.desc' },
    { to: '/classes', titleKey: 'home.features.classes.title', descKey: 'home.features.classes.desc' }
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-clinical-900 mb-3">ProtocolMD</h1>
        <p className="text-lg text-gray-600">{t('home.subtitle')}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="border rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
            <h2 className="font-semibold text-gray-900 group-hover:text-clinical-700 mb-1">{t(f.titleKey)}</h2>
            <p className="text-sm text-gray-500">{t(f.descKey)}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-10">{t('home.disclaimer')}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/`. Switch language — hero subtitle, feature card titles/descriptions, and disclaimer should all change.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: translate HomePage"
```

---

### Task 4: Translate ProtocolBrowser

**Files:**
- Modify: `frontend/src/pages/ProtocolBrowser.jsx`

- [ ] **Step 1: Replace ProtocolBrowser.jsx**

Replace the full contents of `frontend/src/pages/ProtocolBrowser.jsx`:
```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import ProtocolCard from '../components/ProtocolCard'

const TUMOR_SITES = ['All', 'Colorectal', 'Breast', 'Lung', 'Lymphoma']
const AUTHORITIES = ['All', 'NCCN', 'SBOC']

export default function ProtocolBrowser() {
  const { t } = useTranslation()
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
      <h1 className="text-2xl font-bold mb-4">{t('protocols.title')}</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">{t('protocols.tumorSite')}</label>
          <select value={tumorSite} onChange={e => setTumorSite(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {TUMOR_SITES.map(s => (
              <option key={s} value={s}>{s === 'All' ? t('common.all') : s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">{t('protocols.authority')}</label>
          <select value={authority} onChange={e => setAuthority(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {AUTHORITIES.map(a => (
              <option key={a} value={a}>{a === 'All' ? t('common.all') : a}</option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && <p className="text-gray-500">{t('protocols.loading')}</p>}
      {error && <p className="text-red-600">{t('protocols.loadError')}</p>}
      {protocols && (
        <div className="grid gap-3 sm:grid-cols-2">
          {protocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}
          {protocols.length === 0 && <p className="text-gray-500">{t('protocols.noResults')}</p>}
        </div>
      )}
    </div>
  )
}
```

Note: Tumor site values (Colorectal, Breast, etc.) and authority values (NCCN, SBOC) stay in English because they are sent as API query parameters. Only the sentinel "All" option is translated.

- [ ] **Step 2: Verify in browser**

Navigate to `/protocols`. Switch language — page title, filter labels, and status strings should change. Tumor site/authority option values stay in English (correct).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ProtocolBrowser.jsx
git commit -m "feat: translate ProtocolBrowser"
```

---

### Task 5: Translate ProtocolDetail

**Files:**
- Modify: `frontend/src/pages/ProtocolDetail.jsx`

- [ ] **Step 1: Replace ProtocolDetail.jsx**

Replace the full contents of `frontend/src/pages/ProtocolDetail.jsx`:
```jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

export default function ProtocolDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { data: protocol, isLoading, error } = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => api.protocols.get(id)
  })

  if (isLoading) return <p className="text-gray-500">{t('common.loading')}</p>
  if (error) return <p className="text-red-600">{t('protocols.notFound')}</p>
  if (!protocol) return null

  return (
    <div className="max-w-3xl">
      <Link to="/protocols" className="text-clinical-700 text-sm hover:underline">{t('protocols.backToProtocols')}</Link>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{protocol.name}</h1>
        {protocol.authority.map(a => (
          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{a}</span>
        ))}
      </div>
      <p className="text-gray-500 mt-1">
        {protocol.tumorSite} · {t('protocols.cycleLength', { days: protocol.cycleLength })}
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">{t('protocols.regimen')}</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">{t('protocols.drug')}</th>
                <th className="text-left px-4 py-2">{t('protocols.dose')}</th>
                <th className="text-left px-4 py-2">{t('protocols.route')}</th>
                <th className="text-left px-4 py-2">{t('protocols.days')}</th>
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
                  <td className="px-4 py-2">{t('protocols.day')} {drug.day.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {protocol.supportiveCare && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-1">{t('protocols.supportiveCare')}</h2>
          <p className="text-sm text-gray-700">{protocol.supportiveCare}</p>
        </section>
      )}
      {protocol.notes && (
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-1">{t('protocols.notes')}</h2>
          <p className="text-sm text-gray-700">{protocol.notes}</p>
        </section>
      )}

      <div className="mt-6">
        <Link
          to={`/dose?protocolId=${protocol.id}`}
          className="inline-block bg-clinical-700 text-white px-4 py-2 rounded hover:bg-clinical-900 text-sm"
        >
          {t('protocols.calcDose')}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to any protocol detail page (e.g. `/protocols/folfox`). Switch language — back link, cycle length text, section headers (Regimen, Supportive Care, Notes), table column headers, and "Calculate Dose" button should all change. Drug names, route, and dose values stay in English (correct — they are data, not UI text).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ProtocolDetail.jsx
git commit -m "feat: translate ProtocolDetail"
```

---

### Task 6: Translate DrugSearch

**Files:**
- Modify: `frontend/src/pages/DrugSearch.jsx`

- [ ] **Step 1: Replace DrugSearch.jsx**

Replace the full contents of `frontend/src/pages/DrugSearch.jsx`:
```jsx
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import SearchBar from '../components/SearchBar'

export default function DrugSearch() {
  const { t } = useTranslation()
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
      <h1 className="text-2xl font-bold mb-4">{t('drugs.searchTitle')}</h1>
      <div className="max-w-xl mb-6">
        <SearchBar placeholder={t('drugs.searchPlaceholder')} defaultValue={q} onSearch={handleSearch} />
      </div>
      {isLoading && <p className="text-gray-500">{t('drugs.searching')}</p>}
      {error && <p className="text-red-600">{t('drugs.searchError')}</p>}
      {results && results.length === 0 && query && (
        <p className="text-gray-500">{t('drugs.noResults', { query })}</p>
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

- [ ] **Step 2: Verify in browser**

Navigate to `/drugs`. Switch language — page title, search placeholder, and status strings should change. Search for "fluorouracil" and verify drug name/brand/class stay in English (correct — those are API data).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DrugSearch.jsx
git commit -m "feat: translate DrugSearch"
```

---

### Task 7: Translate DrugDetail

**Files:**
- Modify: `frontend/src/pages/DrugDetail.jsx`

- [ ] **Step 1: Replace DrugDetail.jsx**

Replace the full contents of `frontend/src/pages/DrugDetail.jsx`:
```jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { data: drug, isLoading, error } = useQuery({
    queryKey: ['drug', name],
    queryFn: () => api.drugs.get(name)
  })

  if (isLoading) return <p className="text-gray-500">{t('drugs.loading')}</p>
  if (error) return <p className="text-red-600">{t('drugs.notFound')}</p>
  if (!drug) return null

  return (
    <div className="max-w-3xl">
      <Link to="/drugs" className="text-clinical-700 text-sm hover:underline">{t('drugs.backToSearch')}</Link>
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
      <Section title={t('drugs.definition')}>{drug.definition}</Section>
      <Section title={t('drugs.description')}>{drug.description}</Section>
      <Section title={t('drugs.dosing')}>{drug.dosage}</Section>
      <Section title={t('drugs.adverseReactions')}>{drug.adverseReactions}</Section>
      <Section title={t('drugs.contraindications')}>{drug.contraindications}</Section>
      <Section title={t('drugs.warnings')}>{drug.warnings}</Section>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/drugs/fluorouracil`. Switch language — back link, section headers (Description, Dosing, Adverse Reactions, etc.) should change. Drug name and OpenFDA content stay in English (correct).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DrugDetail.jsx
git commit -m "feat: translate DrugDetail"
```

---

### Task 8: Translate DoseCalculator

**Files:**
- Modify: `frontend/src/pages/DoseCalculator.jsx`

- [ ] **Step 1: Replace DoseCalculator.jsx**

Replace the full contents of `frontend/src/pages/DoseCalculator.jsx`:
```jsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

export default function DoseCalculator() {
  const { t } = useTranslation()
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

  const fields = [
    { label: t('dose.height'), name: 'heightCm', placeholder: '170' },
    { label: t('dose.weight'), name: 'weightKg', placeholder: '70' },
    { label: t('dose.age'), name: 'age', placeholder: '50' },
    { label: t('dose.creatinine'), name: 'creatinineMgDl', placeholder: '1.0', step: '0.1' }
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('dose.title')}</h1>
      <form onSubmit={e => { e.preventDefault(); calculate() }} className="space-y-4 bg-white border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ label, name, placeholder, step }) => (
            <label key={name} className="block">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input type="number" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} step={step}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('dose.sex')}</span>
            <select name="sex" value={form.sex} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="M">{t('dose.male')}</option>
              <option value="F">{t('dose.female')}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('dose.protocol')}</span>
            <select name="protocolId" value={form.protocolId} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="">{t('dose.selectProtocol')}</option>
              {protocols?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tumorSite})</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={!isComplete || isPending}
          className="w-full bg-clinical-700 text-white py-2 rounded hover:bg-clinical-900 disabled:opacity-50 text-sm font-medium">
          {isPending ? t('dose.calculating') : t('dose.calculateDoses')}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">{t('dose.calcError')}</p>}

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
                  <th className="text-left px-4 py-2">{t('protocols.drug')}</th>
                  <th className="text-left px-4 py-2">{t('dose.prescribed')}</th>
                  <th className="text-left px-4 py-2">{t('dose.calculated')}</th>
                  <th className="text-left px-4 py-2">{t('dose.note')}</th>
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
          <p className="text-xs text-gray-400 mt-3">{t('dose.disclaimer')}</p>
        </div>
      )}
    </div>
  )
}
```

Note: BSA and CrCl labels stay as English abbreviations — they are internationally recognized medical abbreviations that clinicians use regardless of language. Protocol names and tumor site values in the protocol dropdown also stay in English (they are data from the API).

- [ ] **Step 2: Verify in browser**

Navigate to `/dose`. Switch language — page title, all form labels, sex options, button text, and results table headers should change. BSA/CrCl abbreviations stay in English. Calculate a dose and verify the results table headers translate.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DoseCalculator.jsx
git commit -m "feat: translate DoseCalculator"
```

---

### Task 9: Translate DrugClasses

**Files:**
- Modify: `frontend/src/pages/DrugClasses.jsx`

- [ ] **Step 1: Replace DrugClasses.jsx**

Replace the full contents of `frontend/src/pages/DrugClasses.jsx`:
```jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const DRUG_CLASSES = [
  {
    tKey: 'drugClasses.chemotherapy',
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
    tKey: 'drugClasses.immunotherapy',
    classes: [
      { name: 'PD-1 Inhibitors', examples: ['Pembrolizumab', 'Nivolumab', 'Cemiplimab'] },
      { name: 'PD-L1 Inhibitors', examples: ['Atezolizumab', 'Durvalumab', 'Avelumab'] },
      { name: 'CTLA-4 Inhibitors', examples: ['Ipilimumab', 'Tremelimumab'] }
    ]
  },
  {
    tKey: 'drugClasses.targetedTherapy',
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
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('drugClasses.title')}</h1>
      <div className="space-y-8">
        {DRUG_CLASSES.map(cat => (
          <section key={cat.tKey}>
            <h2 className="text-xl font-semibold mb-3 text-clinical-900">{t(cat.tKey)}</h2>
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

Note: Class names (Alkylating Agents, PD-1 Inhibitors, etc.) and all drug names stay in English — they are internationally recognized scientific terms and proper nouns used by clinicians across all languages.

- [ ] **Step 2: Verify in browser**

Navigate to `/classes`. Switch language — page title and the three main category headers (Chemotherapy/Immunotherapy/Targeted Therapy) should translate. Class names and drug names stay in English (correct).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DrugClasses.jsx
git commit -m "feat: translate DrugClasses"
```

---

## Self-Review

**Spec coverage:**
- ✅ react-i18next library — Task 1
- ✅ EN / ES / PT-BR locale files — Task 1
- ✅ localStorage persistence — Task 1 (i18next-browser-languagedetector with localStorage cache)
- ✅ Language selector in NavBar — Task 2
- ✅ All 7 pages translated — Tasks 3–9
- ✅ Dynamic OpenFDA content stays English — noted explicitly in Tasks 6, 7, 8
- ✅ Drug names stay English — noted in Tasks 5, 8, 9

**No placeholders found.**

**Type consistency:** `t('key')` calls match the JSON key structure in all locale files. `i18n.changeLanguage(e.target.value)` matches the language codes in `supportedLngs`. `t('protocols.cycleLength', { days: protocol.cycleLength })` matches `{{days}}` in locale files. `t('drugs.noResults', { query })` matches `{{query}}` in locale files.
