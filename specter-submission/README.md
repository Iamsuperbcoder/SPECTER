# SPECTER — Insurance Network Auditor

SPECTER audits a health insurer's behavioral-health provider directory and exposes "ghost" listings: providers who can't actually be reached or verified. A 2023 U.S. Senate Finance Committee investigation found that over 80% of listed mental-health providers were unreachable ghosts. SPECTER scores a whole network in seconds.

Built for HackJPS 2026.

## What's here

`specter-auditor.jsx` — the app, a single React component. AI extraction, a 0–100 verification engine, confidence and severity scoring, county network-adequacy, an insurer leaderboard, and a regulator report.

## How it works

Two parts: an AI layer and a verification engine.

- Claude reads the messy, inconsistent directory text and turns each entry into structured data, and it drafts the complaint letter to the regulator.
- The verification engine (plain JavaScript) scores each provider 0 to 100 using the official federal NPI check-digit algorithm, placeholder and out-of-state phone detection, shared-NPI and duplicate-listing detection, and address and specialty checks, weighted by the provider's clinical role.

Those roll up into a network ghost score, a county-level adequacy map, an insurer leaderboard, and an estimate of how many members are affected. It calls the Anthropic API for extraction and the letter when available, and falls back to a built-in parser and a template letter so it always works.

## Running it

It's a single React component (default export). Drop it into any React setup (Vite, Create React App, or Next.js) and render it. It uses `lucide-react` for icons.

## A note on the data

The bundled sample uses synthetic data for demonstration and is not affiliated with any real insurer. SPECTER is a research and transparency tool. It does not diagnose patients or make coverage decisions.
