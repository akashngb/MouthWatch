from flask import Flask, request, jsonify
from flask import send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

app = Flask(__name__)
CORS(app)

# ── Load Model & Labels ───────────────────────────────────────────────────────
model = None
class_labels = None

def load_model_once():
    global model, class_labels
    if model is None:
        print("Loading model...")
        model = tf.keras.models.load_model("best_model.keras")
        with open("class_labels.json", "r") as f:
            class_labels = json.load(f)
        print("✅ Model ready")

# ── Risk Factor Weights ───────────────────────────────────────────────────────
# These map to your intake form answers
RISK_WEIGHTS = {
    "tobacco_none": 0,
    "tobacco_occasional": 15,
    "tobacco_daily": 30,
    "alcohol_none": 0,
    "alcohol_occasional": 10,
    "alcohol_heavy": 25,
    "hpv_yes": 25,
    "hpv_no": 0,
    "hpv_unknown": 5,
    "prior_cancer_yes": 30,
    "prior_cancer_no": 0,
    "symptoms_pain": 10,
    "symptoms_bleeding": 15,
    "symptoms_numbness": 10,
    "symptoms_sore": 15,
    "symptoms_none": 0,
}

def calculate_risk_factor_score(risk_factors: dict) -> float:
    """Convert intake form answers to a 0-100 score."""
    total = 0
    max_possible = 125  # sum of all worst-case answers
    for key, value in risk_factors.items():
        if isinstance(value, list):
            for item in value:
                total += RISK_WEIGHTS.get(f"{key}_{item}", 0)
        else:
            total += RISK_WEIGHTS.get(f"{key}_{value}", 0)
    return min((total / max_possible) * 100, 100)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Resize and normalize image for model input."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

def get_risk_color(combined_score: float) -> dict:
    """Map combined score to green/yellow/red with messaging."""
    if combined_score < 45:
        return {
            "color": "green",
            "label": "Low Risk",
            "message": "No immediate concern detected. Continue monitoring and maintain regular dental visits.",
            "urgency": "Routine checkup recommended"
        }
    elif combined_score < 72:
        return {
            "color": "yellow",
            "label": "Moderate Risk",
            "message": "Some indicators detected. We recommend booking a dental appointment within the next 2-4 weeks.",
            "urgency": "Non-urgent dental visit recommended"
        }
    else:
        return {
            "color": "red",
            "label": "High Risk",
            "message": "High risk indicators detected. Please seek dental attention as soon as possible.",
            "urgency": "Urgent dental visit recommended"
        }

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    load_model_once()
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route('/three.min.js')
def serve_three():
    return send_from_directory('/Users/akashn/Downloads/smacks/ml_model', 'three.min.js')

@app.route('/GLTFLoader.js')
def serve_gltf_loader():
    return send_from_directory('/Users/akashn/Downloads/smacks/ml_model', 'GLTFLoader.js')

@app.route('/teeth.glb')
def serve_model():
    return send_from_directory('/Users/akashn/Downloads/smacks/mouthwatch-app/assets', 'teeth.glb')

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts multipart/form-data with:
    - image: the photo file
    - risk_factors: JSON string of intake form answers (optional)
    
    Returns full risk assessment.
    """
    load_model_once()
    try:
        # ── Validate image ──
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files["image"]
        image_bytes = image_file.read()
        
        # ── Run ML inference ──
        processed = preprocess_image(image_bytes)
        predictions = model.predict(processed)[0]
        
        # Map predictions to class labels
        pred_dict = {class_labels[str(i)]: float(predictions[i]) 
                    for i in range(len(predictions))}
        
        top_class = max(pred_dict, key=pred_dict.get)
        ml_confidence = pred_dict[top_class]
        
        # Convert class name to a 0-100 ML risk score
        # cancerous = high risk, non_cancerous = medium, normal = low
        class_risk_map = {
            "cancer": 70,
            "non-cancer": 10,
        }
        # Handle any class name variations
        ml_risk_score = 0
        for class_name, risk_val in class_risk_map.items():
            if class_name in top_class.lower():
                ml_risk_score = risk_val * ml_confidence
                break
        else:
            ml_risk_score = 50 * ml_confidence  # fallback
        
        # ── Parse risk factors ──
        risk_factor_score = 0
        risk_factors_raw = {}
        if "risk_factors" in request.form:
            try:
                risk_factors_raw = json.loads(request.form["risk_factors"])
                risk_factor_score = calculate_risk_factor_score(risk_factors_raw)
            except json.JSONDecodeError:
                pass
        
        # ── Combine scores ──
        # ML score = 70% weight, risk factors = 30% weight
        combined_score = (ml_risk_score * 0.7) + (risk_factor_score * 0.3)
        
        # ── Build response ──
        risk_output = get_risk_color(combined_score)
        
        return jsonify({
            "success": True,
            "result": {
                **risk_output,
                "combined_score": round(combined_score, 1),
                "ml_confidence": round(ml_confidence * 100, 1),
                "ml_prediction": top_class,
                "ml_risk_score": round(ml_risk_score, 1),
                "risk_factor_score": round(risk_factor_score, 1),
                "all_predictions": {k: round(v * 100, 1) for k, v in pred_dict.items()},
                "disclaimer": "OralGuard is a screening tool only and does not constitute a medical diagnosis. Always consult a dental professional."
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)