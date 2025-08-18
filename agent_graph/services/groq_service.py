from __future__ import annotations

import os
from typing import Optional


def get_chat_groq(model: Optional[str] = None):
	"""Return a ChatGroq instance from langchain if available.

	Raises a clear error if the integration is missing.
	"""
	chosen_model = model or os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
	try:
		from langchain_groq import ChatGroq  # type: ignore
		api_key = os.environ.get("GROQ_API_KEY")
		if not api_key:
			raise RuntimeError("GROQ_API_KEY is not set")
		return ChatGroq(model=chosen_model, temperature=0.3, max_tokens=None, groq_api_key=api_key)
	except ImportError as exc:  # pragma: no cover
		raise RuntimeError(
			"langchain-groq is not installed. Add `langchain-groq` to requirements.txt"
		) from exc


