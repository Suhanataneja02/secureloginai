# SecureLogin AI - Keystroke Dynamics Shield

SecureLogin AI is a modern, premium cybersecurity web application that leverages biometric behavioral analysis to distinguish between legitimate human authentication and automated bot logins. By measuring high-resolution key event sequences (dwell times, pauses, and flight intervals) in real-time, the system blocks scripts, automated form fillers, and programmatic dictionary attacks.

## Core Features

- **Cyberpunk Dark Theme:** Sleek glassmorphism dashboards with pulsing cyan and purple neon glow accents.
- **Falling Matrix Backdrop:** Active matrix code rain rendered directly on a canvas background.
- **Biometric Logging Stream:** Live rolling stream displaying keystrokes in real-time as they are typed.
- **Precision Metrics Dashboard:** Live WPM speeds, standard deviation variation scores (timing jitter), pause registers, and backspace error counters.
- **Bot Simulator:** An automated script builder that mimics programmatic bots by injecting synthetic events at ultra-fast uniform intervals to verify and demonstrate the detection rules in action.

---

## Tech Stack

- **Backend:** Python, Flask (lightweight, beginner-friendly routing server)
- **Frontend:** HTML5, CSS3 (Vanilla design token styling), JavaScript (High-precision timing & events)
- **Biometrics:** Pure Python standard deviation calculation formulas.

---

## Installation & Setup

Follow these simple steps to run the project locally on your machine:

### 1. Pre-requisites
Ensure you have Python installed. You can verify this by running:
```bash
python --version
```

### 2. Install Dependencies
Install Flask using pip:
```bash
pip install flask
```

### 3. Run the Server
From the project root directory, run the Flask web application:
```bash
python app.py
```

### 4. Open in Browser
Once launched, navigate to the following local address in your web browser:
```
http://127.0.0.1:5000/
```

---

## How It Works

### The Detection Rules
Standard bots input keys at perfectly consistent delays with zero error and zero natural breaks. Humans exhibit variable timing shifts due to cognition, muscles, keyboard layout, and errors.

1. **Typing Speed:** Very fast average timing gaps ($< 50\text{ ms}$ interval transitions) flag automated speed behavior.
2. **Timing Consistency:** Standard Deviation ($S$) calculation measures variation. Low timing jitter ($S < 12\text{ ms}$) triggers automation indicators.
3. **No Pauses:** Automated bots complete submissions continuously without brief rhythm pauses ($> 600\text{ ms}$).
4. **No Mistakes:** Bots enter credentials flawlessly. Humans often utilize corrections (`Backspace` key presses).

If all conditions are triggered (Extreme Speed, Perfect Consistency, Zero Pauses, Zero Mistakes), the login is classified as **“Bot-like Typing Detected”**. Otherwise, it classifies as **“Human Typing Detected”**.
