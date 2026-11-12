import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("Groq API key is missing!")

client = Groq(api_key=API_KEY)

MODEL_NAME = "openai/gpt-oss-120b"


def generate_health_response(question):
    print("QUESTION RECEIVED BY AI:", question)

    prompt = f"""
    You are MediVision AI, a healthcare information assistant.

    Explain health information in simple language.
    Do not diagnose diseases or prescribe medicines.
    Encourage users to consult qualified healthcare professionals.
    For potentially life-threatening symptoms, advise immediate
    emergency medical assistance.

    User question: {question}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2000
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Groq API Error:", e)
        return "The AI assistant is temporarily unavailable. Please try again."

def analyze_medical_report(report_text):

    prompt = f"""
    You are MediVision AI, a medical report explanation assistant.

    Explain the following medical report in simple language.

    Include:
    1. Summary of the report.
    2. Important test names and their reported values.
    3. Values marked high or low, including reference ranges if provided.
    4. Simple explanations of medical terms.
    5. Questions the patient may ask their doctor.

    Do not diagnose diseases or prescribe medicines.
    Do not invent missing values or reference ranges.
    Encourage consultation with a qualified healthcare professional.

    Medical Report:
    {report_text[:12000]}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        max_tokens=2000
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Report Analysis Error:", e)
        return "Unable to analyze the report right now. Please try again."

import base64

def analyze_medical_image(image_path, mime_type):

    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(
            image_file.read()
        ).decode("utf-8")

    prompt = """
    You are MediVision AI, a healthcare information assistant.

    Examine the uploaded image and provide:

    1. A general description of what is visible.
    2. Any clearly visible text or labels.
    3. General educational information relevant to the image.
    4. Limitations or image-quality issues.
    5. Questions the user could ask a qualified doctor.

    IMPORTANT:
    - Do not diagnose diseases.
    - Do not prescribe medicines.
    - Do not claim certainty about medical findings.
    - Do not invent information that is not visible.
    - If the image is an X-ray, scan or other clinical image,
      explain that professional interpretation is necessary.
    - Encourage consultation with a qualified healthcare professional.
    """

    try:
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    f"data:{mime_type};base64,"
                                    f"{image_data}"
                                )
                            }
                        }
                    ]
                }
            ],
            temperature=0.3,
            max_completion_tokens=1200
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Image Analysis Error:", e)
        raise