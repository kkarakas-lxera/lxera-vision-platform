from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator, Optional, Dict, Any


def init_sentry(dsn: str) -> None:
	"""Initialize Sentry in the hosting service (no-op placeholder)."""
	# The actual initialization should be done in the API service entrypoint to avoid duplicate init.
	_ = dsn


@contextmanager
def start_span(op: str, description: str, tags: Optional[Dict[str, Any]] = None) -> Iterator[None]:
	"""Span context; uses sentry_sdk if available, otherwise no-op."""
	span = None
	try:
		try:
			import sentry_sdk  # type: ignore
			span = sentry_sdk.start_span(op=op, description=description)
			if tags:
				for k, v in tags.items():
					span.set_tag(k, v)
			yield
		except Exception:
			# No sentry or tagging issue: fall back to simple context
			yield
	finally:
		if span is not None:
			try:
				span.finish()
			except Exception:
				pass


