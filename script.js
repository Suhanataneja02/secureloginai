/* SecureLogin AI - Frontend Orchestrator */

document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Matrix Rain Animation ---
    initMatrixCanvas();

    // --- State Variables ---
    let keystrokeHistory = []; // Array of keystroke objects: {key, press, release}
    const activeKeys = {};    // Map to keep track of active keypress down-times
    let isSimulating = false; // Flag to disable interaction during simulation

    // --- DOM Elements ---
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    const btnLogin = document.getElementById('btn-login');
    const btnBotSim = document.getElementById('btn-bot-sim');
    const btnReset = document.getElementById('btn-reset');
    
    // States
    const stateIdle = document.getElementById('state-idle');
    const stateScanning = document.getElementById('state-scanning');
    const stateResults = document.getElementById('state-results');
    
    // Results DOM
    const resultBanner = document.getElementById('result-banner');
    const resultIcon = document.getElementById('result-icon');
    const resultVerdict = document.getElementById('result-verdict');
    const resultDesc = document.getElementById('result-desc');
    const botPercentage = document.getElementById('bot-percentage');
    const botProgressBar = document.getElementById('bot-progress-bar');
    
    const statSpeed = document.getElementById('stat-speed');
    const statVariation = document.getElementById('stat-variation');
    const statPauses = document.getElementById('stat-pauses');
    const statBackspaces = document.getElementById('stat-backspaces');
    const timelineVis = document.getElementById('timeline-visualization');

    // --- Keystroke Dynamics Logging ---
    // Capture time in milliseconds using performance.now() for high precision
    
    function logKeyDown(e, fieldName) {
        if (isSimulating) return;
        
        const key = e.key;
        // Skip keys that are held down continuously (auto-repeat)
        if (e.repeat) return;
        
        const pressTime = performance.now();
        activeKeys[key] = pressTime;
    }

    function logKeyUp(e, fieldName) {
        if (isSimulating) return;
        
        const key = e.key;
        const releaseTime = performance.now();
        
        if (activeKeys[key] !== undefined) {
            const pressTime = activeKeys[key];
            delete activeKeys[key];
            
            // Record the finished keystroke event
            keystrokeHistory.push({
                key: key,
                press: pressTime,
                release: releaseTime
            });
        }
    }

    // Bind event listeners to input fields
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keydown', (e) => logKeyDown(e, input.id));
        input.addEventListener('keyup', (e) => logKeyUp(e, input.id));
    });

    // --- Biometric Authentication Submission ---
    btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Simple form validation
        if (!usernameInput.value || !passwordInput.value) {
            alert("Please enter both secure username and passcode keys.");
            return;
        }
        
        submitKeystrokes();
    });

    function submitKeystrokes() {
        // Transition to Scanning animation state
        changeState('scanning');
        
        // Create an organic cyber feel with scrolling logs
        runConsoleDiagnosticLogs(() => {
            // After logs animation, send to Flask server for AI processing
            fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameInput.value,
                    keystrokes: keystrokeHistory
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderAnalysisResults(data);
                } else {
                    alert('Biometric Core Analysis Error: ' + data.message);
                    changeState('idle');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Connection to Biometric Server timed out.');
                changeState('idle');
            });
        });
    }

    // Transition Helper
    function changeState(state) {
        stateIdle.classList.remove('active');
        stateScanning.classList.remove('active');
        stateResults.classList.remove('active');
        
        if (state === 'idle') {
            stateIdle.classList.add('active');
        } else if (state === 'scanning') {
            stateScanning.classList.add('active');
        } else if (state === 'results') {
            stateResults.classList.add('active');
        }
    }

    // Cyber console animation lines
    function runConsoleDiagnosticLogs(callback) {
        const consoleBox = document.querySelector('.console-box');
        consoleBox.innerHTML = '';
        
        const logs = [
            { text: '> INITIALIZING BIOMETRIC SCAN...', class: 'text-cyan' },
            { text: '> EXTRACTING HIGH-RESOLUTION KEY EVENTS...', class: 'text-purple' },
            { text: `> LOGGED ${keystrokeHistory.length} INDIVIDUAL STROKES SUCCESSFULLY...`, class: 'text-green' },
            { text: '> COMPILING MILLISECOND DWEL TIMING MATRICES...', class: 'text-cyan' },
            { text: '> COMPUTING STANDARD DEVIATION VARIANCES...', class: 'text-yellow' },
            { text: '> SENDING PAYLOAD TO NEURAL CLASSIFIER BACKEND...', class: 'text-purple' },
            { text: '> RECEIVED METRICS. AGGREGATING DIAGNOSTIC VERDICT...', class: 'text-green' }
        ];

        let index = 0;
        function printNextLog() {
            if (index < logs.length) {
                const log = logs[index];
                const p = document.createElement('p');
                p.className = `console-line ${log.class}`;
                p.textContent = log.text;
                consoleBox.appendChild(p);
                consoleBox.scrollTop = consoleBox.scrollHeight;
                index++;
                setTimeout(printNextLog, 240); // Interval between console print logs
            } else {
                setTimeout(callback, 300); // Slight delay after final log
            }
        }
        
        printNextLog();
    }

    // --- Render Results UI ---
    function renderAnalysisResults(res) {
        const isBot = res.classification === 'Bot-like Typing Detected';
        
        // 1. Verdict Banner Style & Text
        if (isBot) {
            resultBanner.className = 'result-banner status-bot';
            resultIcon.className = 'fa-solid fa-robot';
            resultVerdict.textContent = 'BOT-LIKE TYPING DETECTED';
            resultDesc.textContent = 'Malicious automated script pattern recognized. Access Denied.';
            
            // Score Display
            botPercentage.textContent = `${res.bot_score}%`;
            botPercentage.className = 'text-neon-red';
            botProgressBar.className = 'progress-bar bg-red';
            botProgressBar.style.width = `${res.bot_score}%`;
        } else {
            resultBanner.className = 'result-banner status-human';
            resultIcon.className = 'fa-solid fa-user-check';
            resultVerdict.textContent = 'HUMAN TYPING DETECTED';
            resultDesc.textContent = 'Keystroke biometric rhythm matches active human variation. Access Granted.';
            
            // Score Display
            botPercentage.textContent = `${res.bot_score}%`;
            botPercentage.className = 'text-neon-green';
            botProgressBar.className = 'progress-bar bg-green';
            botProgressBar.style.width = `${res.bot_score}%`;
        }

        // 2. Metrics Mini-Cards Info
        const m = res.metrics;
        statSpeed.textContent = `${m.wpm} WPM`;
        statVariation.textContent = `${m.std_dev_ms} ms`;
        statPauses.textContent = `${m.pauses}`;
        statBackspaces.textContent = `${m.backspaces}`;

        // 3. Rhythm Visual Signature (Hold & Flight times diagram)
        drawRhythmTimeline();

        // Switch screen state
        changeState('results');
    }

    // Visualizing the hold vs flight times on the dashboard
    function drawRhythmTimeline() {
        timelineVis.innerHTML = '';
        
        if (keystrokeHistory.length < 2) {
            timelineVis.innerHTML = '<span class="stream-placeholder">Not enough strokes for timeline signature.</span>';
            return;
        }

        // Take a max of 12 keystrokes to display elegantly in the panel
        const dataset = keystrokeHistory.slice(0, 12);
        
        // Draw alternate block nodes showing Key Dwells (Hold) and Gaps (Flight)
        for (let i = 0; i < dataset.length; i++) {
            const keyStroke = dataset[i];
            const dwell = keyStroke.release - keyStroke.press;
            
            // Draw Key Dwell Bar
            const dwellBar = document.createElement('div');
            dwellBar.className = 'timeline-bar dwell-block';
            dwellBar.textContent = keyStroke.key.substring(0, 1);
            dwellBar.title = `Key: ${keyStroke.key} | Hold: ${Math.round(dwell)}ms`;
            
            // Scale width roughly based on dwell (bounded between 15px and 60px)
            const scaledDwellWidth = Math.min(Math.max(dwell / 5, 16), 65);
            dwellBar.style.width = `${scaledDwellWidth}px`;
            timelineVis.appendChild(dwellBar);

            // Draw Flight Timing Gap if there is a next key
            if (i < dataset.length - 1) {
                const nextStroke = dataset[i+1];
                const flight = nextStroke.press - keyStroke.press;
                
                const gap = document.createElement('div');
                gap.className = 'timeline-gap';
                gap.title = `Interval: ${Math.round(flight)}ms`;
                
                // Scale width roughly based on flight timing (bounded between 4px and 45px)
                const scaledFlightWidth = Math.min(Math.max(flight / 8, 4), 48);
                gap.style.width = `${scaledFlightWidth}px`;
                timelineVis.appendChild(gap);
            }
        }
    }

    // --- Reset Controller ---
    btnReset.addEventListener('click', resetSession);
    
    function resetSession() {
        usernameInput.value = '';
        passwordInput.value = '';
        keystrokeHistory = [];
        for (const k in activeKeys) delete activeKeys[k];
        
        changeState('idle');
    }

    // --- Automated Bot Script Simulation ---
    btnBotSim.addEventListener('click', () => {
        if (isSimulating) return;
        resetSession();
        simulateBotTyping();
    });

    function simulateBotTyping() {
        isSimulating = true;
        btnBotSim.disabled = true;
        btnLogin.disabled = true;
        usernameInput.disabled = true;
        passwordInput.disabled = true;

        const botUsername = 'cyber_sentinel';
        const botPassword = 'QuantumSecurity99!';

        // Perfect robotic parameters
        const baseFlightInterval = 18.0; // Perfectly uniform 18ms intervals
        const holdTime = 6.0;            // Perfectly uniform 6ms dwell times
        
        let charIndex = 0;
        let cumulativeTime = 100.0; // Start at 100ms
        
        function typeNextChar() {
            // Determine if typing username or password
            const isPasswordPhase = charIndex >= botUsername.length;
            const targetInput = isPasswordPhase ? passwordInput : usernameInput;
            const textToType = isPasswordPhase ? botPassword : botUsername;
            const index = isPasswordPhase ? charIndex - botUsername.length : charIndex;
            
            if (charIndex < botUsername.length + botPassword.length) {
                const char = textToType.charAt(index);
                
                // Inject character into input element UI
                targetInput.value += char;
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Construct perfect keystroke events
                const press = cumulativeTime;
                const release = press + holdTime;
                
                // Record into history
                keystrokeHistory.push({
                    key: char,
                    press: press,
                    release: release
                });
                
                // Advance counters
                cumulativeTime += baseFlightInterval;
                charIndex++;
                
                // Schedule next character typed
                setTimeout(typeNextChar, baseFlightInterval);
            } else {
                // Done simulation! Restore controls and click login automatically after delay
                setTimeout(() => {
                    isSimulating = false;
                    btnBotSim.disabled = false;
                    btnLogin.disabled = false;
                    usernameInput.disabled = false;
                    passwordInput.disabled = false;
                    
                    submitKeystrokes();
                }, 400);
            }
        }
        
        // Start typing
        typeNextChar();
    }

    // --- Matrix Falling Code Backdrop Animation ---
    function initMatrixCanvas() {
        const canvas = document.getElementById('matrix-canvas');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&0123456789';
        const alphabet = chars.split('');

        const fontSize = 12;
        let columns = Math.floor(canvas.width / fontSize);
        if (columns < 50) columns = 50; // Guard against 0 width
        
        const rainDrops = [];

        for (let x = 0; x < columns; x++) {
            rainDrops[x] = Math.random() * -100; // Offset heights
        }

        function draw() {
            ctx.fillStyle = 'rgba(6, 7, 11, 0.08)'; // Semi-transparent screen clear
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set matrix text colors (harmonious dark cyan / green mix)
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet[Math.floor(Math.random() * alphabet.length)];
                
                // Pick random light blue or purple characters occasionally, else cyber-cyan
                const colorRand = Math.random();
                if (colorRand > 0.95) {
                    ctx.fillStyle = '#d600ff'; // Neon purple spark
                } else if (colorRand > 0.85) {
                    ctx.fillStyle = '#ffffff'; // White spark
                } else {
                    ctx.fillStyle = '#00f0ff'; // Cyan matrix code
                }
                
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        }

        setInterval(draw, 33); // High-performance render tick (approx 30fps)
    }
});
