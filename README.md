# 🛡️ SENTINEL PRIME (INVISIFY)

Sentinel Prime (branded "INVISIFY") is a powerful forensic steganography detection platform designed to find hidden data concealed inside text, emoji sequences, and images. It operates as an "antivirus for invisible data", scanning content for secret payloads that humans cannot see but computers can exploit.

## 📌 Architecture Overview

This project is a full-stack application built around a **Cascade Detection Pipeline** with three delivery surfaces:

1. **Web App**: Next.js 15 + React 19 + TailwindCSS Dashboard for comprehensive forensic scanning.
2. **Browser Extension**: Chrome Manifest V3 extension for real-time email protection (e.g., Gmail).
3. **API Endpoint**: Next.js Route Handler (`/api/scan`) providing a programmatic scanning interface.

### The Cascade Detection Pipeline
- **Tier 1 (Deterministic)**: Fast character-set checks (zero-width, BIDI, known tool signatures).
- **Tier 2 (Statistical)**: Deep structural analysis (Shannon entropy, Markov chains, Chi-Square, RS Analysis).
- **Tier 3 (Semantic/ML)**: AI-powered semantic analysis via Google Gemini and hooks for ML ensemble validations.

## 🚀 Key Capabilities

### Text & Emoji Forensics
- **Zero-width Detection**: Spots ZWSP, ZWNJ, ZWJ, BOM, LRM/RLM, etc. Includes brute-force decoding.
- **Homoglyph Detection**: Identifies over 80 mappings across Cyrillic, Greek, Armenian, and Hebrew scripts.
- **Emoji Steganalysis**: Analyzes emoji sequences for Nibble steganography, unauthorized Variation Selectors, and decodes custom schemes (like EmojiEncode).
- **Shannon Entropy & Markov Chains**: Flags text with unnatural entropy (e.g., `> 5.5 bits/char`) indicating obfuscated payloads.
- **SNOW Detection**: Detects trailing whitespace steganography.

### Image Steganalysis (LSB & Structural)
- **Chi-Square Attack**: Performs frequency analysis on even/odd pixel pairs to mathematically prove LSB modification.
- **Sample Pair Analysis (SPA)**: Estimates embedding rates via quadratic equations.
- **RS Analysis**: Classifies Regular/Singular groups using flip/invert masks.
- **Structural Analysis**: Detects trailing data after standard EOF markers (PNG IEND, JPEG EOI), non-standard PNG shadow chunks, and tool signatures (StegHide, OutGuess, JPHIDE, F5).

### AI & Semantic Scanning
- **LLM Engine**: Utilizes Google Gemini 1.5 Flash via Genkit.
- **Perplexity Scoring**: Identifies machine-generated stegotext by finding semantic anomalies and suspicious syntactical constructions.

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+ (Required if running the ML Microservice)
- Optional: Firebase account (if using Firestore) and Google Gemini API Key

### Node.js Frontend & API Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by creating a `.env.local` file with the required keys (e.g., Google API Key for Genkit).

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### ML Microservice Setup (Python Backend)

A Python microservice handles the heavy deep learning detection components like SRNet and DistilBERT.

1. Ensure Python 3.11+ is installed.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the microservice server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## ⚠️ Known Limitations & Future Improvements

To make this project production-ready, several limitations must be addressed:
- **Image Decoding Pipeline**: Avoid relying on raw file bytes. Integrate `sharp` or Canvas API for robust pixel extraction.
- **API Security**: Implement authentication (JWT/API Keys), rate limiting, and restrict CORS specifically to trusted domains.
- **Prompt Injection Defense**: Ensure proper sanitization of user text inputs before submitting to the Gemini AI Semantic analyzer.
- **Advanced Machine Learning Integration**: Replace simple threshold simulations with a dedicated, isolated Python ML microservice using PyTorch/TensorFlow (e.g., SRNet for images, DistilBERT for text).
- **Extension Hardening**: Remove `innerHTML` usage in the Chrome extension and migrate to robust DOM manipulation to prevent XSS vulnerabilities.

## 🤝 Contributing
Contributions are welcome. Please ensure your changes pass existing unit tests and follow the architectural guidelines set forth in the platform modules.
