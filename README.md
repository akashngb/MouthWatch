welcome to my project for sm[ile h]acks 2026

# MouthWatch 🦷

AI-powered oral cancer early detection for patients, and a clinical command center for dentists.

Built at SmileHacks 2026 — University of Toronto.

---

## What It Does

MouthWatch keeps the conversation going between dental visits. Patients photograph mouth lesions for instant AI risk screening. Dentists receive the results, annotate a 3D mouth model, and stay connected to their patients between appointments.

- **Patient mobile app** — Risk intake form, AI lesion analysis, scan history, clinic finder, AI chat assistant
- **Dentist web dashboard** — Patient list, 3D annotated mouth model, weekly calendar, PDF reports, clinical notes
- **ML backend** — MobileNetV2 fine-tuned on oral lesion dataset, 92% validation accuracy

---

## Project Structure

```
smacks/
├── ml_model/          # Flask API + TensorFlow ML model
├── mouthwatch-app/    # React Native / Expo mobile app
└── dentist-dashboard/ # React web dashboard
```

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- Expo Go app on your phone
- ngrok account (free)

---

## 1. ML Backend (Flask API)

### Setup

```bash
cd ml_model
python3 -m venv .venv
source .venv/bin/activate
pip install flask flask-cors tensorflow pillow numpy gunicorn
```

### Run

```bash
cd ml_model
source .venv/bin/activate
python3 main.py
```

Flask will start on `http://127.0.0.1:8080`.

### Verify it's working

```bash
curl http://127.0.0.1:8080/health
```

You should see a JSON response confirming the model is loaded.

---

## 2. ngrok Tunnel

The mobile app needs to reach the Flask API over the internet. ngrok creates a public HTTPS tunnel to your local server.

### Install ngrok

Download from [ngrok.com](https://ngrok.com) and authenticate your account.

### Run

```bash
ngrok http 8080
```

You'll get a URL like `https://xxxx-xxxx.ngrok-free.dev`. Copy it.

### Update the app

Open `mouthwatch-app/screens/CameraScreen.tsx` and update:

```typescript
const API_URL = 'https://your-ngrok-url-here.ngrok-free.dev/analyze';
```

Also open `mouthwatch-app/screens/ModelViewerScreen.tsx` and update:

```typescript
const NGROK_URL = 'https://your-ngrok-url-here.ngrok-free.dev';
```

> ⚠️ ngrok gives you the same URL if you restart quickly on the same session. If the URL changes, update both files above.

---

## 3. Mobile App (Expo)

### Setup

```bash
cd mouthwatch-app
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. Make sure your phone and laptop are on the same WiFi network.

---

## 4. Dentist Dashboard (React)

### Setup

```bash
cd dentist-dashboard
npm install
```

### Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Keeping All Three Running

You need three terminals open simultaneously:

| Terminal | Command | Purpose |
|----------|---------|---------|
| Terminal 1 | `python3 main.py` (inside ml_model with venv active) | Flask ML API |
| Terminal 2 | `ngrok http 8080` | Public tunnel to Flask |
| Terminal 3 | `npx expo start` (inside mouthwatch-app) | Mobile app bundler |

The dentist dashboard runs independently and doesn't need the Flask API.

> ⚠️ Do not close your laptop lid — it will kill all terminals. Go to System Settings → Battery → disable automatic sleep when display is off.

---

## API Reference

### POST /analyze

Analyzes a mouth lesion image and returns a risk score.

**Request:** `multipart/form-data`
- `image` — JPG or PNG file
- `risk_factors` — JSON string, e.g. `{"tobacco": "daily", "alcohol": "occasional", "hpv": "unknown", "prior_cancer": "no", "symptoms": []}`

**Response:**
```json
{
  "success": true,
  "result": {
    "color": "red",
    "label": "High Risk",
    "combined_score": 67.6,
    "ml_confidence": 82.8,
    "ml_prediction": "cancer",
    "ml_risk_score": 82.8,
    "risk_factor_score": 32.0,
    "message": "High risk indicators detected. Please seek dental attention as soon as possible.",
    "urgency": "Urgent dental visit recommended",
    "disclaimer": "MouthWatch is a screening tool only and does not constitute a medical diagnosis."
  }
}
```

### GET /health

Returns model status. Hit this before your demo to pre-load the model.

```bash
curl https://your-ngrok-url.ngrok-free.dev/health
```

### GET /teeth.glb

Serves the 3D tooth model to the mobile app's WebView.

---

## Risk Scoring

The combined risk score is calculated as:

```
combined_score = (ml_score × 0.7) + (risk_factor_score × 0.3)
```

| Score | Color | Label |
|-------|-------|-------|
| 0 – 45 | 🟢 Green | Low Risk |
| 45 – 72 | 🟡 Yellow | Moderate Risk |
| 72 – 100 | 🔴 Red | High Risk |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo, TypeScript |
| Navigation | React Navigation (stack + bottom tabs) |
| ML Backend | Flask, TensorFlow, MobileNetV2 |
| Dentist Dashboard | React, TypeScript, Vite |
| 3D Model | Three.js, @react-three/fiber, @react-three/drei |
| AI Chat | Gemini 1.5 Flash |
| Tunnel | ngrok |

---

## Important Notes

- MouthWatch is a **screening tool only** and does not constitute medical advice
- The ML model was trained on 181 images — clinical validation is required before any real-world deployment
- The Gemini chatbot requires a valid API key in `ChatScreen.tsx`
- All patient data in the dentist dashboard is mock data for demonstration purposes

---

## Team

Built overnight at SmileHacks 2026 — University of Toronto.