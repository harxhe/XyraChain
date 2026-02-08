import cv2
import numpy as np

def load_and_preprocess(image_path, img_size=224):
    """
    Loads an image, resizes it, and preprocesses it for the model.
    Returns:
        img_bgr: The original image in BGR format (resized).
        x: The preprocessed image tensor (1, H, W, 3).
    """
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    img_bgr = cv2.resize(img_bgr, (img_size, img_size))
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    x = img_rgb.astype(np.float32) / 255.0  # Normalize to [0, 1]
    x = np.expand_dims(x, axis=0)           # Expand dims for batch: (1, H, W, 3)
    return img_bgr, x
