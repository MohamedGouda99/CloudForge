import json
import os
from typing import Iterable, List, Optional

import anthropic
from anthropic import APIError, AuthenticationError, PermissionDeniedError, RateLimitError

from app.core.config import settings


def _client() -> anthropic.Anthropic:
    api_key = settings.ANTHROPIC_API_KEY or os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    return anthropic.Anthropic(api_key=api_key)


def _extract_text(resp: anthropic.types.Message) -> str:
    if not resp or not getattr(resp, "content", None):
        return ""
    texts: List[str] = []
    for part in resp.content:
        if getattr(part, "type", "") == "text":
            txt = getattr(part, "text", "") or ""
            if txt:
                texts.append(txt)
    return "".join(texts)


def _pick_models(preferred: Optional[str]) -> Iterable[str]:
    candidates = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20240620",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ]
    if preferred:
        return [preferred] + [m for m in candidates if m != preferred]
    return candidates


def _call_claude(prompt: str, model_name: Optional[str] = None, system: Optional[str] = None) -> str:
    client = _client()
    last_error: Optional[Exception] = None
    for model in _pick_models(model_name):
        try:
            resp = client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=0,
                system=system or "",
                messages=[{"role": "user", "content": prompt}],
            )
            text = _extract_text(resp)
            if text:
                return text
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue
    raise RuntimeError(str(last_error) if last_error else "Failed to get Claude response")


def generate_completion(prompt: str, model_name: str | None = None) -> str:
    text = _call_claude(prompt, model_name=model_name)
    if not text:
        raise RuntimeError("Claude returned an empty response")
    return text


def generate_framework_plan(guide_text: str, cloud_provider: str | None = None, model_name: str | None = None) -> dict:
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

    text = _call_claude(prompt, model_name=model_name, system="Return only JSON.")
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


def format_claude_error(exc: Exception) -> str:
    if isinstance(exc, RateLimitError):
        return "Claude rate limit exceeded. Check plan/quota."
    if isinstance(exc, PermissionDeniedError):
        return "Claude API key lacks required permissions."
    if isinstance(exc, AuthenticationError):
        return "Claude authentication failed. Verify ANTHROPIC_API_KEY."
    if isinstance(exc, APIError):
        return f"Claude API error: {exc}"
    return str(exc)
