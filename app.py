import math
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def calculate_std_dev(values):
    """
    Calculates the standard deviation of a list of numeric values.
    Uses pure Python to keep it beginner-friendly and dependency-free.
    """
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)

@app.route('/')
def index():
    """Renders the main cyber-security authentication page."""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyzes the typing patterns (keystroke dynamics) sent from the frontend.
    Computes analytics and runs human vs bot classification rules.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data received'}), 400

        keystrokes = data.get('keystrokes', [])
        
        # Guard clause for empty or extremely short inputs
        if len(keystrokes) < 2:
            return jsonify({
                'success': True,
                'classification': 'Human Typing Detected',
                'bot_score': 5.0,
                'metrics': {
                    'keystroke_count': len(keystrokes),
                    'avg_interval': 0.0,
                    'std_dev': 0.0,
                    'pauses': 0,
                    'backspaces': 0,
                    'wpm': 0.0,
                    'message': 'Insufficient typing data for complete biometric analysis.'
                }
            })

        # 1. Calculate Hold/Dwell Times (Key Down to Key Up)
        dwell_times = []
        for k in keystrokes:
            if 'press' in k and 'release' in k:
                dwell_times.append(k['release'] - k['press'])

        # 2. Calculate Flight Times (Key Intervals between consecutive Down events)
        intervals = []
        for i in range(len(keystrokes) - 1):
            interval = keystrokes[i+1]['press'] - keystrokes[i]['press']
            intervals.append(interval)

        # 3. Analyze Key Metrics
        total_keys = len(keystrokes)
        avg_interval = sum(intervals) / len(intervals) if intervals else 0.0
        std_dev = calculate_std_dev(intervals) if len(intervals) >= 2 else 0.0
        
        # A pause is defined as a gap of more than 600ms between key presses
        pauses = sum(1 for interval in intervals if interval > 600.0)
        
        # Count Backspace usage (user correcting their typing)
        backspaces = sum(1 for k in keystrokes if k.get('key') == 'Backspace')

        # 4. Calculate Speed (WPM & CPS)
        start_time = keystrokes[0]['press']
        end_time = keystrokes[-1]['release'] if 'release' in keystrokes[-1] else keystrokes[-1]['press']
        duration_ms = end_time - start_time
        
        if duration_ms <= 0:
            duration_ms = 1.0 # Avoid division by zero

        duration_sec = duration_ms / 1000.0
        keys_per_second = total_keys / duration_sec
        # standard formula: WPM = (keys / 5) / (minutes)
        wpm = (total_keys / 5.0) / (duration_ms / 60000.0)

        # 5. Keystroke Dynamics Bot Score Logic
        # A modular scoring algorithm that outputs percentage likelihood of a Bot
        speed_score = 0.0
        consistency_score = 0.0
        pauses_score = 0.0
        mistakes_score = 0.0

        # Speed component (fast intervals indicate bot)
        if avg_interval <= 25.0:
            speed_score = 30.0
        elif avg_interval <= 50.0:
            # Linear scaling between 50ms and 25ms
            speed_score = 15.0 + (15.0 * (50.0 - avg_interval) / 25.0)
        elif avg_interval <= 80.0:
            speed_score = 10.0
        else:
            speed_score = 0.0

        # Consistency component (lower standard deviation indicates extreme uniformity)
        if std_dev <= 4.0:
            consistency_score = 40.0
        elif std_dev <= 12.0:
            # Linear scaling between 12ms and 4ms
            consistency_score = 15.0 + (25.0 * (12.0 - std_dev) / 8.0)
        elif std_dev <= 25.0:
            consistency_score = 10.0
        else:
            consistency_score = 0.0

        # Pauses component (bots don't pause)
        if pauses == 0:
            pauses_score = 15.0
        else:
            pauses_score = 0.0

        # Mistakes component (bots don't make backspace corrections)
        if backspaces == 0:
            mistakes_score = 15.0
        else:
            mistakes_score = 0.0

        # Calculate final bot score
        bot_score = speed_score + consistency_score + pauses_score + mistakes_score
        
        # Cap/Scale according to length
        if len(keystrokes) < 4:
            bot_score = min(bot_score, 25.0) # Not enough keystrokes to make a confident Bot assertion

        # 6. Apply Classification Rules
        # IF: typing is extremely fast, intervals are highly consistent, no pauses, and no mistakes
        # THEN: classify as "Bot-like Typing Detected"
        # OTHERWISE: "Human Typing Detected"
        is_extremely_fast = avg_interval < 50.0
        is_highly_consistent = std_dev < 12.0
        no_pauses = pauses == 0
        no_mistakes = backspaces == 0
        
        # We require at least 4 keystrokes to classify as a bot to prevent false flags on single/double keypresses
        if is_extremely_fast and is_highly_consistent and no_pauses and no_mistakes and total_keys >= 4:
            classification = "Bot-like Typing Detected"
            # Ensure bot score reflects classification
            bot_score = max(bot_score, 85.0)
        else:
            classification = "Human Typing Detected"
            # Ensure human score does not exceed 75% unless it's borderline
            if bot_score > 75.0:
                bot_score = 70.0

        # Format responses elegantly
        return jsonify({
            'success': True,
            'classification': classification,
            'bot_score': round(bot_score, 1),
            'metrics': {
                'keystroke_count': total_keys,
                'avg_interval_ms': round(avg_interval, 1),
                'std_dev_ms': round(std_dev, 1),
                'pauses': pauses,
                'backspaces': backspaces,
                'wpm': round(wpm, 1)
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    # Running locally in debug mode
    app.run(debug=True, port=5000)
