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
	try:
		import sentry_sdk  # type: ignore
		with sentry_sdk.start_span(op=op, description=description) as span:
			if tags and span:
				for k, v in tags.items():
					span.set_tag(k, v)
			yield
	except ImportError:
		# Sentry not available: no-op context
		yield
	except Exception:
		# Other sentry issues: no-op context
		yield


