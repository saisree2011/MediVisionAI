from backend.emergency import detect_emergency, get_emergency_response
from werkzeug.utils import secure_filename
from PIL import Image
from backend.ai import analyze_medical_image
from backend.image_analysis import (
    save_image_analysis,
    get_user_image_history
)
from backend.health import save_health_metrics, get_health_history
from backend.report_history import get_user_reports
from werkzeug.utils import secure_filename
from backend.report import extract_text_from_pdf
import uuid
from backend.chat_history import (
    create_conversation,
    save_message,
    get_user_conversations,
    get_conversation_messages
)
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from backend.ai import generate_health_response
from dotenv import load_dotenv
from backend.auth import register_user, login_user
from backend.db import get_db_connection
import os

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form["name"].strip()
        email = request.form["email"].strip().lower()
        password = request.form["password"]

        if not name or not email or len(password) < 8:
            flash("Enter valid details. Password must be at least 8 characters.")
            return redirect(url_for("register"))

        try:
            register_user(name, email, password)
            flash("Registration successful! Please login.")
            return redirect(url_for("login"))

        except Exception as e:
            print("Registration error:", e)
            flash("Registration failed. The email may already exist.")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"].strip().lower()
        password = request.form["password"]

        user = login_user(email, password)

        if user:
            session.clear()
            session["user_id"] = user["user_id"]
            session["name"] = user["name"]

            return redirect(url_for("dashboard"))

        flash("Invalid email or password.")

    return render_template("login.html")


@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template(
        "dashboard.html",
        name=session["name"]
    )


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("home"))

@app.route("/api/chat", methods=["POST"])
def chat():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    data = request.get_json()
    question = data.get("message", "").strip()

    if not question:
        return jsonify({"error": "Please enter a question"}), 400

    try:
        # Create a conversation if one doesn't exist
        if "conversation_id" not in session:

            conversation_id = create_conversation(
                session["user_id"],
                question[:100]
            )

            session["conversation_id"] = conversation_id

        conversation_id = session["conversation_id"]

        # Save user message
        save_message(conversation_id, "user", question)

        # Check for potential emergency
        detected_keywords = detect_emergency(question)

        print("USER QUESTION:", question)
        print("EMERGENCY KEYWORDS:", detected_keywords)

        if detected_keywords:
            answer = get_emergency_response(detected_keywords)
        else:
            answer = generate_health_response(question)

        print("AI ANSWER:", answer)
 
        # Save AI response
        save_message(conversation_id, "assistant", answer)

        return jsonify({
            "question": question,
            "answer": answer
        })

    except Exception as e:
        print("Chat Error:", e)

        return jsonify({
            "error": "Unable to process your message. Please try again."
        }), 500

@app.route("/api/upload-report", methods=["POST"])
def upload_report():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    if "file" not in request.files:
        return jsonify({"error": "No file selected"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    filename = secure_filename(file.filename)

    unique_filename = f"{session['user_id']}_{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    try:
        file.save(file_path)

        report_text = extract_text_from_pdf(file_path)

        if not report_text:
            os.remove(file_path)
            return jsonify({
                "error": "No readable text found. Scanned PDFs are not supported yet."
            }), 400

        from backend.ai import analyze_medical_report

        analysis = analyze_medical_report(report_text)

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO medical_reports (user_id, file_name, analysis)
        VALUES (%s, %s, %s)
        """

        cursor.execute(
            query,
            (session["user_id"], filename, analysis)
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Report uploaded successfully",
            "analysis": analysis
        })

    except Exception as e:
        print("Report Upload Error:", e)

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({"error": "Unable to process the PDF"}), 500

@app.route("/api/report-history", methods=["GET"])
def report_history():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    try:
        reports = get_user_reports(session["user_id"])

        for report in reports:
            report["uploaded_at"] = report["uploaded_at"].strftime(
                "%d-%m-%Y %H:%M"
            )

        return jsonify({"reports": reports})

    except Exception as e:
        print("Report History Error:", e)
        return jsonify({"error": "Unable to retrieve reports"}), 500

@app.route("/api/image-history", methods=["GET"])
def image_history():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    try:
        images = get_user_image_history(session["user_id"])

        for image in images:
            image["uploaded_at"] = image["uploaded_at"].strftime(
                "%d-%m-%Y %H:%M"
            )

        return jsonify({"images": images})

    except Exception as e:
        print("Image History Error:", e)
        return jsonify({"error": "Unable to retrieve image history"}), 500

@app.route("/api/save-health", methods=["POST"])
def save_health():
    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    data = request.get_json()

    try:
        height = float(data.get("height", 0))
        weight = float(data.get("weight", 0))
        
        if height <= 0 or weight <= 0:
            return jsonify({"error": "Invalid height or weight"}), 400

        height_in_meters = height / 100
        bmi = weight / (height_in_meters * height_in_meters)

        save_health_metrics(
            session["user_id"], height, weight, bmi
        )

        return jsonify({
            "message": "Health metrics saved successfully",
            "bmi": round(bmi, 2)
        })

    except Exception as e:
        print("Health Metrics Error:", e)
        return jsonify({"error": "Unable to save health metrics"}), 500

@app.route("/api/health-history", methods=["GET"])
def health_history():
    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    try:
        records = get_health_history(session["user_id"])

        for record in records:
            record["recorded_at"] = record["recorded_at"].strftime("%d-%m-%Y %H:%M")

        return jsonify({"records": records})

    except Exception as e:
        print("Health History Error:", e)
        return jsonify({"error": "Unable to retrieve health history"}), 500

@app.route("/api/chat-history", methods=["GET"])
def chat_history():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    try:
        conversations = get_user_conversations(session["user_id"])

        for conversation in conversations:
            conversation["created_at"] = (
                conversation["created_at"].strftime("%d-%m-%Y %H:%M")
            )

        return jsonify({"conversations": conversations})

    except Exception as e:
        print("Chat History Error:", e)
        return jsonify({"error": "Unable to retrieve chat history"}), 500


@app.route("/api/chat-history/<int:conversation_id>", methods=["GET"])
def chat_conversation_history(conversation_id):

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    try:
        conversations = get_user_conversations(session["user_id"])

        # Ensure this conversation belongs to the logged-in user
        if not any(
            c["conversation_id"] == conversation_id
            for c in conversations
        ):
            return jsonify({"error": "Conversation not found"}), 404

        messages = get_conversation_messages(conversation_id)

        return jsonify({"messages": messages})

    except Exception as e:
        print("Conversation History Error:", e)
        return jsonify({"error": "Unable to retrieve conversation"}), 500

@app.route("/api/analyze-image", methods=["POST"])
def analyze_image():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    if "file" not in request.files:
        return jsonify({"error": "No image selected"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    filename = secure_filename(file.filename)

    allowed_extensions = (".jpg", ".jpeg", ".png", ".webp")

    if not filename.lower().endswith(allowed_extensions):
        return jsonify({
            "error": "Only JPG, JPEG, PNG and WEBP images are allowed."
        }), 400

    unique_filename = (
        f"{session['user_id']}_{uuid.uuid4().hex}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    try:
        file.save(file_path)

        # Validate actual image format
        with Image.open(file_path) as image:
            image.verify()

        with Image.open(file_path) as image:
            image_format = image.format

        mime_types = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp"
        }

        if image_format not in mime_types:
            os.remove(file_path)
            return jsonify({
                "error": "Unsupported image format."
            }), 400

        mime_type = mime_types[image_format]

        analysis = analyze_medical_image(
            file_path,
            mime_type
        )

        save_image_analysis(
            session["user_id"],
            filename,
            analysis
        )

        return jsonify({
            "message": "Image analyzed successfully",
            "analysis": analysis
        })

    except Exception as e:

        print("Image Upload Error:", e)

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({
            "error": "Unable to analyze image. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)