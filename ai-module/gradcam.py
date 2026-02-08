import argparse
import sys
import json
import os

# Suppress TensorFlow OneDNN logs
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import numpy as np
import tensorflow as tf

# Ensure current directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_loader import load_model
from preprocess import load_and_preprocess

# --- Helper Functions from Original Notebook ---

def make_heatmap_from_gradcam_model(img_tensor, gradcam_model):
    with tf.GradientTape() as tape:
        conv_outputs, preds = gradcam_model(img_tensor, training=False)
        loss = preds[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0,1,2))

    conv_outputs = conv_outputs[0]  # (H,W,C)
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)

    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()

def save_gradcam_overlay(orig_bgr, heatmap, out_path, alpha=0.40):
    h, w = orig_bgr.shape[:2]

    # Resize heatmap to image size
    hm = cv2.resize(heatmap, (w, h))
    hm = np.uint8(255 * hm)

    # Colorize heatmap
    hm_color = cv2.applyColorMap(hm, cv2.COLORMAP_JET)

    # Overlay
    overlay = cv2.addWeighted(orig_bgr, 1 - alpha, hm_color, alpha, 0)

    cv2.imwrite(out_path, overlay)
    return out_path

def build_gradcam_model_from_inner(outer_model, inner_name, target_conv_name, input_shape=(224,224,3)):
    inner = outer_model.get_layer(inner_name)

    inp = tf.keras.Input(shape=input_shape, name="gc_inp2")
    x = inp
    conv_out = None

    # Replay inner layers so conv_out and preds are in the same graph
    for layer in inner.layers:
        x = layer(x)
        if layer.name == target_conv_name:
            conv_out = x

    if conv_out is None:
        raise ValueError(f"Target conv layer {target_conv_name} not found while replaying.")

    preds = x  # final output after last layer
    return tf.keras.Model(inputs=inp, outputs=[conv_out, preds], name="gradcam_model")

def clone_with_unique_names(m, suffix="_gc"):
    def clone_fn(layer):
        cfg = layer.get_config()
        if "name" in cfg:
            cfg["name"] = cfg["name"] + suffix
        return layer.__class__.from_config(cfg)

    m2 = tf.keras.models.clone_model(m, clone_function=clone_fn)
    m2.set_weights(m.get_weights())
    return m2

# --- Main Logic ---

def generate_gradcam(image_path, output_path):
    try:
        model = load_model()
        img_bgr, x = load_and_preprocess(image_path)
        
        # 1. Prepare Grad-CAM Model (replicating notebook logic)
        # We need to clone to ensure unique names and structure for GradCAM
        model_unique = clone_with_unique_names(model, suffix="_gc")
        
        inp = tf.keras.Input(shape=(224, 224, 3), name="gc_input")
        out = model_unique(inp, training=False)
        model_gc = tf.keras.Model(inputs=inp, outputs=out, name="model_gc")
        
        # Force build
        _ = model_gc(tf.convert_to_tensor(x), training=False)
        
        # Build the specific gradcam model pointing to the target conv layer
        # Hardcoding 'sequential' and 'conv2d_2_gc' as per original notebook findings for this specific model structure
        gradcam_model = build_gradcam_model_from_inner(
            outer_model=model_gc,
            inner_name="sequential",
            target_conv_name="conv2d_2_gc",
            input_shape=(224,224,3)
        )
        
        # 2. Generate Heatmap
        heatmap = make_heatmap_from_gradcam_model(tf.convert_to_tensor(x), gradcam_model)
        
        # 3. Save Overlay
        if output_path is None:
            # Default to same dir as input, with _gradcam suffix
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_gradcam{ext}"
            
        saved_path = save_gradcam_overlay(img_bgr, heatmap, out_path=output_path)
        
        # Print path and success message
        print(json.dumps({
            "status": "success",
            "output_path": saved_path
        }))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pneumonia Detection Grad-CAM")
    parser.add_argument("--image", required=True, help="Path to the X-ray image")
    parser.add_argument("--output", help="Path to save the output image (optional)")
    args = parser.parse_args()
    
    generate_gradcam(args.image, args.output)
