import tensorflow as tf
import os

_model = None

def load_model(model_path=None):
    """
    Loads the Keras model. Singleton pattern to avoid reloading.
    """
    global _model
    if _model is None:
        if model_path is None:
            # Assume model is in 'model' subdirectory relative to this script
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, 'model', 'best_cnn.keras')
        
        if not os.path.exists(model_path):
             raise FileNotFoundError(f"Model not found at {model_path}")
             
        # Suppress TensorFlow logging if needed
        # os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
        
        try:
            _model = tf.keras.models.load_model(model_path)
            # print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")
            
    return _model
