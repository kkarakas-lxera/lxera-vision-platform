"""
Sentry Configuration for LXERA Agent Pipeline
Provides LLM monitoring for OpenAI agents with Flask integration
"""

import os
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.openai import OpenAIIntegration
import logging

logger = logging.getLogger(__name__)

def initialize_sentry():
    """
    Initialize Sentry with Flask and OpenAI integrations for comprehensive monitoring.
    """
    # Your actual Sentry DSN
    sentry_dsn = os.getenv('SENTRY_DSN', 'https://72603497d4cd6aa808c39674bfd414cf@o4509570042822656.ingest.de.sentry.io/4509570148991056')
    
    if not sentry_dsn:
        logger.warning("SENTRY_DSN not set - Sentry monitoring disabled")
        return False
    
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            
            # Integrations for Flask and OpenAI
            integrations=[
                FlaskIntegration(
                    transaction_style='endpoint',  # Use endpoint names for transactions
                ),
                OpenAIIntegration(
                    include_prompts=True,  # Capture prompts and responses
                    include_token_usage=True,  # Track token usage
                ),
            ],
            
            # Performance monitoring
            traces_sample_rate=1.0,  # Capture 100% of transactions for performance
            
            # Session tracking
            release=os.getenv('RENDER_GIT_COMMIT', 'development'),
            environment=os.getenv('RENDER_ENV', 'production'),
            
            # Additional options
            attach_stacktrace=True,
            send_default_pii=True,  # Send prompts and user data for full monitoring
            
            # Before send hook to add custom context
            before_send=before_send_transaction,
        )
        
        logger.info("✅ Sentry initialized with OpenAI LLM monitoring")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
        return False


def before_send_transaction(event, hint):
    """
    Customize Sentry events before sending.
    Add custom tags and context for better filtering.
    """
    # Add custom tags
    if 'tags' not in event:
        event['tags'] = {}
    
    # Tag LLM-related transactions
    if 'transaction' in event:
        transaction_name = event.get('transaction', '')
        
        # Tag agent transactions
        if 'agent' in transaction_name.lower():
            event['tags']['agent_pipeline'] = True
            
        # Tag specific agents
        for agent_name in ['planning', 'research', 'content', 'quality', 'enhancement', 'multimedia', 'finalizer']:
            if agent_name in transaction_name.lower():
                event['tags']['agent_type'] = agent_name
                break
    
    # Add OpenAI specific context
    if 'extra' in event and 'openai' in event['extra']:
        openai_data = event['extra']['openai']
        if 'model' in openai_data:
            event['tags']['llm_model'] = openai_data['model']
        if 'token_usage' in openai_data:
            event['tags']['total_tokens'] = openai_data['token_usage'].get('total_tokens', 0)
    
    return event


def capture_agent_performance(agent_name: str, phase: str, metadata: dict = None):
    """
    Capture custom performance metrics for agent execution.
    
    Args:
        agent_name: Name of the agent (e.g., 'planning', 'research')
        phase: Phase of execution (e.g., 'start', 'tool_call', 'complete')
        metadata: Additional metadata to capture
    """
    with sentry_sdk.start_transaction(op="agent", name=f"agent.{agent_name}.{phase}") as transaction:
        transaction.set_tag("agent_name", agent_name)
        transaction.set_tag("phase", phase)
        
        if metadata:
            for key, value in metadata.items():
                transaction.set_data(key, value)
        
        return transaction


def track_llm_metrics(func):
    """
    Decorator to automatically track LLM metrics for agent functions.
    """
    def wrapper(*args, **kwargs):
        agent_name = kwargs.get('agent_name', 'unknown')
        
        with sentry_sdk.start_transaction(op="llm.agent", name=f"llm.{agent_name}") as transaction:
            try:
                result = func(*args, **kwargs)
                transaction.set_status("ok")
                return result
            except Exception as e:
                transaction.set_status("internal_error")
                sentry_sdk.capture_exception(e)
                raise
    
    return wrapper