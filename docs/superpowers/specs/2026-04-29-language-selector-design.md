# Language Selector Design

**Date:** 2026-04-29
**Feature:** Multilingual UI — English, Spanish, Portuguese (PT-BR)

---

## Overview

Add a language selector to ProtocolMD so clinicians can use the app in English, Spanish, or Brazilian Portuguese. Language preference persists across page reloads via localStorage. Dynamic content from OpenFDA (drug descriptions, dosing text, adverse reactions) stays in English as returned by the API.

---

## Architecture

**Library:** react-i18next (+ i18next + i18next-browser-languagedetector)

**New packages:**
- `i18next` — core i18n engine
- `react-i18next` — React hooks and components
- `i18next-browser-languagedetector` — auto-detects browser language and reads/writes localStorage

**Init file:** `frontend/src/i18n/index.js`
- Configures i18next with language detector, fallback to `en`, single `translation` namespace
- Imported once in `frontend/src/main.jsx`; no Provider needed (module-level init)

**Translation files:**
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/es.json`
- `frontend/src/i18n/locales/pt-BR.json`

**Suspense:** `<App>` is wrapped in `<React.Suspense>` in `main.jsx` to support lazy translation loading.

---

## Translation Key Structure

Single `translation` namespace. Keys organized by page/feature area:

| Prefix | Covers |
|---|---|
| `nav.*` | NavBar links |
| `home.*` | Hero headline, subtext, feature card titles and descriptions |
| `protocols.*` | Page title, filter labels, authority badge text, card labels |
| `drugs.*` | Drug search page, drug detail section headers |
| `dose.*` | Calculator form labels, input placeholders, results table headers |
| `drugClasses.*` | Section headers only (drug names are proper nouns — stay English in all locales) |
| `common.*` | Shared strings: Loading, Error, Not found, Search placeholder |

Dynamic API content (OpenFDA drug labels) is not translated — rendered as-is in English.

---

## Language Selector UI

**Placement:** NavBar, right-aligned alongside existing links.

**Options:**
- 🇺🇸 English (`en`)
- 🇪🇸 Español (`es`)
- 🇧🇷 Português (`pt-BR`)

**Implementation:** `<select>` element calling `i18next.changeLanguage(code)` on change. The language detector plugin handles localStorage persistence automatically.

**Styling:** Matches existing dark NavBar (`bg-clinical-900`, white text). No extra modal or dropdown library needed.

---

## Page Coverage

All components rendering static UI text are updated with `useTranslation()` and `t('key')` calls:

| File | What changes |
|---|---|
| `NavBar.jsx` | Nav links + language selector added |
| `HomePage.jsx` | Hero section, feature cards |
| `ProtocolBrowser.jsx` | Page title, filter labels, empty state |
| `ProtocolDetail.jsx` | Section headers, table column labels, dose calc link text |
| `DrugSearch.jsx` | Heading, placeholder, empty/error states |
| `DrugDetail.jsx` | Section headers (Description, Dosage, Adverse Reactions, etc.) |
| `DoseCalculator.jsx` | All form labels, placeholders, results table headers |
| `DrugClasses.jsx` | Section headers only |

---

## Error Handling

- If a translation key is missing in a locale, i18next falls back to the English value automatically.
- No UI changes needed for fallback handling.

---

## Testing

- Manual: switch language in NavBar, verify all static text changes on each page, verify localStorage retains choice on reload.
- No unit tests needed for translations themselves — the translation JSON files are data, not logic.

---

## Out of Scope

- Right-to-left (RTL) language support
- Translating dynamic API content (OpenFDA drug labels)
- Translating drug names or brand names (proper nouns)
- Backend i18n (API responses stay in English)
