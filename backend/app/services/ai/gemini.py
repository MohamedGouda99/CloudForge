import os
import json
import google.generativeai as genai
from app.core.config import settings


def _configure_client() -> None:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)


def generate_framework_plan(guide_text: str, cloud_provider: str | None = None) -> dict:
    _configure_client()
    model = genai.GenerativeModel("gemini-1.5-flash")

    system = (
        "You are an expert cloud solution architect. Read the user guide and produce a JSON plan "
        "for an infrastructure framework suitable for Terraform generation. The JSON MUST be valid, "
        "concise, and structured as: {\n"
        "  'title': str,\n"
        "  'cloud_provider': 'aws'|'azure'|'gcp',\n"
        "  'modules': [ { 'name': str, 'description': str, 'resources': [ { 'type': str, 'name': str, 'config': object } ] } ],\n"
        "  'dependencies': [ { 'from': str, 'to': str, 'type': 'depends_on' } ],\n"
        "  'variables': { key: value },\n"
        "  'outputs': [ { 'name': str, 'description': str } ]\n"
        "} Only output JSON, no markdown, no commentary."
    )

    prompt = system + "\n\nUser Guide:\n" + guide_text
    if cloud_provider:
        prompt += f"\n\nPreferred cloud provider: {cloud_provider}"

    resp = model.generate_content(prompt)
    text = resp.text or "{}"
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
