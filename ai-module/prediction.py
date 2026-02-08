import argparse
import json
import sys
import os

# Suppress TensorFlow OneDNN logs
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Ensure current directory is in sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_loader import load_model
from preprocess import load_and_preprocess

def predict(image_path):
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        # Load model and preprocess image
        model = load_model()
        _, x = load_and_preprocess(image_path)
        
        # Predict
        # verbose=0 suppresses progress bar output which could break JSON parsing if captured by backend
        prob = float(model.predict(x, verbose=0)[0][0])
        pred = "PNEUMONIA" if prob >= 0.5 else "NORMAL"
        
        result = {
            "prediction": pred,
            "probability": prob,
            "status": "success"
        }
        # Print ONLY the JSON to stdout
        print(json.dumps(result))
        
    except Exception as e:
        # Print error as JSON so backend can parse it
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pneumonia Detection Prediction")
    parser.add_argument("--image", required=True, help="Path to the X-ray image")
    args = parser.parse_args()
    
    predict(args.image)
