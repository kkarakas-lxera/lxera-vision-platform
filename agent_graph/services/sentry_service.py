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
			import sentry_sdk  # Local import to avoid mandatory dependency
			span = sentry_sdk.start_span(op=op, description=description)
			if tags and span:
				for k, v in tags.items():
					span.set_tag(k, v)
		except ImportError:
			# Sentry SDK not installed – simply yield without tracing
			yield
			return

		yield  # Run caller's code within the span context
	except Exception as exc:
		# Mark the span with an error and re-raise so upstream can handle it
		if span is not None:
			span.set_status("internal_error")
			span.set_tag("exception", str(exc))
		raise
	finally:
		# Ensure the span is always finished
		if span is not None:
			span.finish()


