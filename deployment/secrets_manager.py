#!/usr/bin/env python3
"""
Secure API Key Management for Vast.ai Deployment
Provides multiple methods for managing secrets in production.
"""

import os
import json
import base64
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from pathlib import Path

class SecretsManager:
    """Secure secrets management for production deployment."""
    
    def __init__(self, encryption_key: Optional[str] = None):
        # Use provided key or generate from environment
        if encryption_key:
            self.cipher = Fernet(encryption_key.encode())
        elif os.getenv('SECRETS_ENCRYPTION_KEY'):
            self.cipher = Fernet(os.getenv('SECRETS_ENCRYPTION_KEY').encode())
        else:
            # Generate a new key (store this securely!)
            key = Fernet.generate_key()
            self.cipher = Fernet(key)
            print(f"🔑 Generated new encryption key: {key.decode()}")
            print("⚠️  SAVE THIS KEY SECURELY - Required for decryption!")
    
    def encrypt_secrets(self, secrets: Dict[str, str], output_file: str = "secrets.encrypted") -> None:
        """Encrypt secrets to a file."""
        try:
            secrets_json = json.dumps(secrets)
            encrypted_data = self.cipher.encrypt(secrets_json.encode())
            
            with open(output_file, 'wb') as f:
                f.write(encrypted_data)
            
            print(f"✅ Secrets encrypted and saved to {output_file}")
            
        except Exception as e:
            print(f"❌ Encryption failed: {e}")
    
    def decrypt_secrets(self, encrypted_file: str = "secrets.encrypted") -> Dict[str, str]:
        """Decrypt secrets from a file."""
        try:
            with open(encrypted_file, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = self.cipher.decrypt(encrypted_data)
            secrets = json.loads(decrypted_data.decode())
            
            print(f"✅ Secrets decrypted from {encrypted_file}")
            return secrets
            
        except Exception as e:
            print(f"❌ Decryption failed: {e}")
            return {}
    
    def load_secrets_to_env(self, encrypted_file: str = "secrets.encrypted") -> None:
        """Load encrypted secrets into environment variables."""
        secrets = self.decrypt_secrets(encrypted_file)
        
        for key, value in secrets.items():
            os.environ[key] = value
            print(f"✅ Loaded {key} into environment")

def create_production_secrets() -> Dict[str, str]:
    """Template for production secrets."""
    return {
        # Ollama Configuration
        "OLLAMA_TOKEN": "your_ollama_token_here",
        "OLLAMA_BASE_URL": "http://109.198.107.223:50435",
        "OLLAMA_MODEL": "qwen3:14b",
        
        # Supabase Database
        "SUPABASE_URL": "https://xwfweumeryrgbguwrocr.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key_here",
        "SUPABASE_ANON_KEY": "your_anon_key_here",
        
        # Research APIs
        "FIRECRAWL_API_KEY": "your_firecrawl_key_here",
        
        # Optional Monitoring
        "LANGSMITH_API_KEY": "your_langsmith_key_here",
        "SENTRY_DSN": "your_sentry_dsn_here",
    }

def vast_ai_environment_setup():
    """Generate environment setup commands for Vast.ai."""
    secrets = create_production_secrets()
    
    print("🔐 VAST.AI ENVIRONMENT SETUP COMMANDS")
    print("=" * 50)
    print("Copy and paste these commands in your Vast.ai terminal:")
    print()
    
    for key, value in secrets.items():
        print(f'export {key}="{value}"')
    
    print()
    print("# Make environment persistent")
    print("echo '# Lxera Pipeline Environment' >> ~/.bashrc")
    
    for key, value in secrets.items():
        print(f'echo \'export {key}="{value}"\' >> ~/.bashrc')
    
    print()
    print("# Reload environment")
    print("source ~/.bashrc")
    
    print()
    print("✅ Environment setup complete!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "encrypt":
        # Encrypt secrets
        manager = SecretsManager()
        secrets = create_production_secrets()
        
        print("🔐 Encrypting production secrets...")
        print("⚠️  Replace template values with actual API keys before encrypting!")
        
        manager.encrypt_secrets(secrets, "production_secrets.encrypted")
        
    elif len(sys.argv) > 1 and sys.argv[1] == "decrypt":
        # Decrypt and load secrets
        manager = SecretsManager()
        manager.load_secrets_to_env("production_secrets.encrypted")
        
    elif len(sys.argv) > 1 and sys.argv[1] == "vast-setup":
        # Generate Vast.ai setup commands
        vast_ai_environment_setup()
        
    else:
        print("Usage:")
        print("  python secrets_manager.py encrypt    # Encrypt secrets to file")
        print("  python secrets_manager.py decrypt    # Decrypt and load to environment") 
        print("  python secrets_manager.py vast-setup # Generate Vast.ai setup commands")
