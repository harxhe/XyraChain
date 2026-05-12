import os
import sys
from pathlib import Path

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

AI_MODULE_ROOT = Path(__file__).resolve().parents[3] / "ai-module"
UPLOADS_ROOT = Path(__file__).resolve().parents[3] / "chatbot" / "uploads"
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)

if str(AI_MODULE_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_MODULE_ROOT))

from model_loader import load_model  # type: ignore  # noqa: E402
from preprocess import load_and_preprocess  # type: ignore  # noqa: E402
from gradcam import (  # type: ignore  # noqa: E402
    build_gradcam_model_from_inner,
    clone_with_unique_names,
    make_heatmap_from_gradcam_model,
    save_gradcam_overlay,
)
import tensorflow as tf  # noqa: E402


class AnalysisService:
    def __init__(self) -> None:
        self._model = None

    def _get_model(self):
        if self._model is None:
            self._model = load_model()
        return self._model

    def predict(self, image_path: str) -> dict:
        model = self._get_model()
        _, tensor = load_and_preprocess(image_path)
        probability = float(model.predict(tensor, verbose=0)[0][0])
        diagnosis = "PNEUMONIA" if probability >= 0.5 else "NORMAL"

        return {
            "prediction": diagnosis,
            "probability": probability,
        }

    def generate_gradcam(self, image_path: str) -> dict:
        model = self._get_model()
        image_bgr, tensor = load_and_preprocess(image_path)

        model_unique = clone_with_unique_names(model, suffix="_gc")
        gc_input = tf.keras.Input(shape=(224, 224, 3), name="gc_input")
        gc_output = model_unique(gc_input, training=False)
        model_gc = tf.keras.Model(inputs=gc_input, outputs=gc_output, name="model_gc")

        _ = model_gc(tf.convert_to_tensor(tensor), training=False)

        gradcam_model = build_gradcam_model_from_inner(
            outer_model=model_gc,
            inner_name="sequential",
            target_conv_name="conv2d_2_gc",
            input_shape=(224, 224, 3),
        )

        heatmap = make_heatmap_from_gradcam_model(tf.convert_to_tensor(tensor), gradcam_model)
        output_path = self._build_gradcam_path(image_path)
        saved_path = save_gradcam_overlay(image_bgr, heatmap, out_path=str(output_path))

        return {
            "output_path": saved_path,
        }

    def _build_gradcam_path(self, image_path: str) -> Path:
        source = Path(image_path)
        return source.with_name(f"{source.stem}_gradcam{source.suffix}")


analysis_service = AnalysisService()
