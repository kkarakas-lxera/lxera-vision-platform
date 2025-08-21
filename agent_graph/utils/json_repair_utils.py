from __future__ import annotations

import json
from typing import Any, Tuple, Union

try:
    # Preferred robust repair/parse
    from json_repair import repair_json as _repair_json, loads as _loads
except Exception:  # pragma: no cover - optional at import time
    _repair_json = None
    _loads = None


def repair_to_str(text: str) -> str:
    """Repair malformed JSON text to a valid JSON string using json-repair when available."""
    if not isinstance(text, str):
        return json.dumps(text)
    if _repair_json is not None:
        try:
            return _repair_json(text, ensure_ascii=False)
        except Exception:
            pass
    # Fallback: naive extractions
    cleaned = text
    if "</think>" in cleaned:
        cleaned = cleaned.split("</think>", 1)[1].lstrip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json", 1)[1]
        if "```" in cleaned:
            cleaned = cleaned.split("```", 1)[0]
        cleaned = cleaned.strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```", 1)[1]
        if "```" in cleaned:
            cleaned = cleaned.split("```", 1)[0]
        cleaned = cleaned.strip()
    return cleaned


def repair_to_obj(text: Union[str, Any]) -> Union[dict, list]:
    """Repair and parse to Python object (dict/list)."""
    if not isinstance(text, str):
        return text
    # Try direct strict parse first
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try json-repair parser
    if _loads is not None:
        try:
            return _loads(text)
        except Exception:
            pass
    # Final attempt: repair to string then json.loads
    repaired = repair_to_str(text)
    try:
        return json.loads(repaired)
    except Exception:
        # As a last resort, wrap as object
        return {"raw": repaired}


def try_parse_json(text: Union[str, Any], default: Union[dict, list, str] = "{}") -> Union[dict, list, str]:
    """Best-effort parse; fallback to default if unrecoverable."""
    try:
        obj = repair_to_obj(text)
        return obj if isinstance(obj, (dict, list)) else default
    except Exception:
        return default



