"""Shared model catalog for AI analysis."""

from typing import Optional


DEFAULT_CLOUD_MODEL = "deepseek-v3.1:671b-cloud"

CLOUD_MODELS = {
    "deepseek-v3.1:671b-cloud": "DeepSeek V3.1 671B",
    "gpt-oss:120b-cloud": "GPT-OSS 120B",
    "qwen3-coder:480b-cloud": "Qwen3 Coder 480B",
    "qwen3-vl:235b-cloud": "Qwen3 VL 235B",
    "minimax-m2:cloud": "MiniMax M2",
    "glm-4.6:cloud": "GLM 4.6",
    "gpt-oss:20b-cloud": "GPT-OSS 20B",
}


def resolve_cloud_model(model_id: Optional[str]) -> str:
    """Return a supported cloud model, falling back to the default."""
    if model_id in CLOUD_MODELS:
        return model_id
    return DEFAULT_CLOUD_MODEL
