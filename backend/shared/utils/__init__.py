from __future__ import annotations

import json
from typing import Any, Dict, Optional
from datetime import datetime


def serialize_dt(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def to_json(data: Dict[str, Any], indent: Optional[int] = None) -> str:
    return json.dumps(data, default=serialize_dt, indent=indent)


def from_json(s: str) -> Dict[str, Any]:
    return json.loads(s)


def make_response(
    success: bool,
    data: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    resp: Dict[str, Any] = {"success": success}
    if data is not None:
        resp["data"] = data
    if error is not None:
        resp["error"] = error
    if meta is not None:
        resp["meta"] = meta
    return resp
