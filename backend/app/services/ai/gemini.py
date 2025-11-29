import os
import json
from typing import Iterable, List, Optional

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from app.core.config import settings


def _configure_client() -> None:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)


def _list_models() -> List[str]:
    """Return names of available text generation models."""
    available: List[str] = []
    try:
        for m in genai.list_models():
            methods = getattr(m, "supported_generation_methods", [])
            name = getattr(m, "name", "")
            if isinstance(methods, list) and "generateContent" in methods and isinstance(name, str) and name:
                available.append(name)
    except Exception:
        return []
    return available


def _pick_model(preferred: Optional[str] = None):
    """Pick the best available model, preferring requested/modern options with graceful fallback."""
    _configure_client()
    available = _list_models()

    preferred_names: List[str] = []
    if preferred:
        preferred_names.append(preferred)

    # Add a sensible priority list that covers v2.5 → v1.5 → v1
    priority_candidates: Iterable[str] = (
        preferred_names
        + [
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-pro-exp",
            "gemini-2.0-pro",
            "gemini-2.0-flash",
        ]
        + [n for n in available if "1.5" in n and "flash" in n]
        + [n for n in available if "1.5" in n and "pro" in n]
        + [
            "gemini-1.5-flash-002",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
        ]
        + [n for n in available if n not in preferred_names]
    )

    last_error = None
    model = None
    for mid in priority_candidates:
        if mid not in preferred_names and available and mid not in available:
            # Skip candidates that are clearly unavailable when we have a list
            continue
        try:
            model = genai.GenerativeModel(mid)
            break
        except Exception as e:
            last_error = e
            continue
    if model is None:
        raise RuntimeError(str(last_error) if last_error else "Failed to initialize Gemini model")
    return model


def _extract_text(response) -> str:
    """Safely extract text from the Gemini response."""
    if not response:
        return ""
    if getattr(response, "text", None):
        return response.text
    candidates = getattr(response, "candidates", None)
    if candidates:
        parts = getattr(candidates[0], "content", None)
        if parts and getattr(parts, "parts", None):
            text_parts = [getattr(p, "text", "") for p in parts.parts]
            return "".join(t for t in text_parts if t)
    return ""


def generate_completion(prompt: str, model_name: str | None = None) -> str:
    """Single-shot completion used by the assistant chat."""
    model = _pick_model(model_name)
    resp = model.generate_content(prompt)
    text = _extract_text(resp)
    if not text:
        raise RuntimeError("Gemini returned an empty response")
    return text


def generate_framework_plan(guide_text: str, cloud_provider: str | None = None, model_name: str | None = None) -> dict:
    model = _pick_model(model_name)

    system = (
        "You are an expert cloud solution architect. Read the user guide and produce a JSON plan "
        "for an infrastructure framework suitable for Terraform generation. Use real Terraform resource "
        "types (e.g., aws_vpc, aws_subnet, aws_internet_gateway, aws_route_table, aws_security_group, "
        "aws_instance, azure resources, gcp resources). The JSON MUST be valid, concise, and structured as: {\n"
        "  'title': str,\n"
        "  'cloud_provider': 'aws'|'azure'|'gcp',\n"
        "  'modules': [ { 'name': str, 'description': str, 'resources': [ { 'type': str, 'name': str, 'config': object } ] } ],\n"
        "  'dependencies': [ { 'from': str, 'to': str, 'type': 'depends_on' } ],\n"
        "  'variables': { key: value },\n"
        "  'outputs': [ { 'name': str, 'description': str } ]\n"
        "} Only output JSON, no markdown, no commentary. Ensure 'dependencies' connect resource names that should be wired (e.g., subnet -> vpc, sg -> vpc, instance -> subnet & sg)."
    )

    prompt = system + "\n\nUser Guide:\n" + guide_text
    if cloud_provider:
        prompt += f"\n\nPreferred cloud provider: {cloud_provider}"

    try:
        resp = model.generate_content(prompt)
    except google_exceptions.GoogleAPIError as exc:
        raise
    text = _extract_text(resp) or "{}"
    try:
        data = json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            data = json.loads(text[start : end + 1])
        else:
            raise
    return data


def format_gemini_error(exc: Exception) -> str:
    """Return a user-friendly Gemini error for HTTP responses."""
    if isinstance(exc, google_exceptions.ResourceExhausted):
        return "Gemini quota exceeded or billing disabled. Please check your API key limits."
    if isinstance(exc, google_exceptions.PermissionDenied):
        return "Gemini API key is missing required permissions."
    if isinstance(exc, google_exceptions.Unauthenticated):
        return "Gemini authentication failed. Verify GEMINI_API_KEY."
    return str(exc)
