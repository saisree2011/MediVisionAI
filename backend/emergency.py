EMERGENCY_KEYWORDS = [
    "heart attack",
    "stroke",
    "chest pain",
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "breathing difficulty",
    "seizure",
    "unconscious",
    "blood vomiting",
    "paralysis",
    "fainted",
    "severe bleeding",
    "severe pain"
]


def detect_emergency(message):
    message = message.lower()

    detected_keywords = [
        keyword
        for keyword in EMERGENCY_KEYWORDS
        if keyword in message
    ]

    return detected_keywords


def get_emergency_response(detected_keywords):
    symptoms = ", ".join(detected_keywords)

    return f"""
🚨 POTENTIAL MEDICAL EMERGENCY

Your message mentions: {symptoms}

Please take this seriously.

IMMEDIATE ACTIONS:
1. Call emergency services immediately.
2. In India, call 112 for emergency assistance or 108 for an ambulance where available.
3. Do not drive yourself to the hospital.
4. Ask someone nearby to stay with you.
5. Follow instructions from emergency responders.

Do not wait for an AI response or use this application as a substitute
for emergency medical care.

MediVision AI provides educational information and cannot diagnose
or treat medical emergencies.
"""