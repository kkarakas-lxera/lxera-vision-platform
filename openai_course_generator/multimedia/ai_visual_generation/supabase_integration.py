#!/usr/bin/env python3
"""
Supabase Integration for AI Visual Generation
Handles storage, caching, and retrieval of AI-generated visual artifacts
"""

import os
import json
import hashlib
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import aiohttp
import asyncio

# Import our schemas
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import VisualSpec, CanvasInstructions, GenerationResult, RenderingPath

logger = logging.getLogger(__name__)


@dataclass
class SupabaseConfig:
    """Supabase configuration for AI visual integration"""
    url: str
    service_role_key: str
    anon_key: str
    storage_bucket: str = "ai-artifacts"
    
    @classmethod
    def from_env(cls) -> 'SupabaseConfig':
        """Create config from environment variables"""
        return cls(
            url=os.getenv('SUPABASE_URL', ''),
            service_role_key=os.getenv('SUPABASE_SERVICE_ROLE_KEY', ''),
            anon_key=os.getenv('SUPABASE_ANON_KEY', ''),
            storage_bucket=os.getenv('AI_ARTIFACTS_BUCKET', 'ai-artifacts')
        )


@dataclass
class CachedCanvas:
    """Cached Canvas instructions with metadata"""
    cache_key: str
    canvas_instructions: CanvasInstructions
    rendered_image_path: Optional[str]
    generation_time_ms: int
    hit_count: int
    validation_passed: bool
    created_at: datetime


class SupabaseArtifactManager:
    """Manages AI visual artifacts in Supabase storage and database"""
    
    def __init__(self, config: Optional[SupabaseConfig] = None):
        self.config = config or SupabaseConfig.from_env()
        self.session = None
        
        # Validate configuration
        if not all([self.config.url, self.config.service_role_key]):
            raise ValueError("Supabase URL and service role key are required")
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def _get_headers(self, use_service_role: bool = True) -> Dict[str, str]:
        """Get authorization headers for Supabase requests"""
        api_key = self.config.service_role_key if use_service_role else self.config.anon_key
        return {
            'apikey': api_key,
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def _generate_content_hash(self, visual_spec: VisualSpec) -> str:
        """Generate SHA-256 hash of VisualSpec for caching"""
        # Create normalized representation for consistent hashing
        spec_dict = {
            'intent': visual_spec.intent.value,
            'data_points': [
                {'label': dp.label, 'value': dp.value}
                for dp in visual_spec.dataspec.data_points
            ],
            'theme': visual_spec.theme.value,
            'title': visual_spec.title or '',
            'constraints': {
                'max_width': visual_spec.constraints.max_width,
                'max_height': visual_spec.constraints.max_height
            }
        }
        
        content_str = json.dumps(spec_dict, sort_keys=True)
        return hashlib.sha256(content_str.encode()).hexdigest()
    
    def _generate_cache_key(self, visual_spec: VisualSpec, content_hash: str) -> str:
        """Generate cache key for Canvas instructions"""
        return f"{content_hash}_{visual_spec.intent.value}_{visual_spec.theme.value}"
    
    async def check_canvas_cache(self, visual_spec: VisualSpec) -> Optional[CachedCanvas]:
        """Check if Canvas instructions exist in cache"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        content_hash = self._generate_content_hash(visual_spec)
        
        # Query cache table
        params = {
            'content_hash': f'eq.{content_hash}',
            'visual_intent': f'eq.{visual_spec.intent.value}',
            'theme': f'eq.{visual_spec.theme.value}',
            'expires_at': f'gt.{datetime.now().isoformat()}',
            'select': '*',
            'order': 'created_at.desc',
            'limit': '1'
        }
        
        url = f"{self.config.url}/rest/v1/ai_canvas_cache"
        
        try:
            async with self.session.get(
                url, 
                headers=self._get_headers(),
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data:
                        cache_entry = data[0]
                        
                        # Update hit count
                        await self._update_cache_hit_count(cache_entry['id'])
                        
                        # Convert to CanvasInstructions
                        canvas_instructions = CanvasInstructions.model_validate(
                            cache_entry['canvas_instructions']
                        )
                        
                        return CachedCanvas(
                            cache_key=cache_entry['cache_key'],
                            canvas_instructions=canvas_instructions,
                            rendered_image_path=cache_entry.get('rendered_image_path'),
                            generation_time_ms=cache_entry['generation_time_ms'],
                            hit_count=cache_entry['hit_count'],
                            validation_passed=cache_entry['validation_passed'],
                            created_at=datetime.fromisoformat(cache_entry['created_at'].replace('Z', '+00:00'))
                        )
                        
        except Exception as e:
            logger.error(f"Failed to check cache: {str(e)}")
            return None
        
        return None
    
    async def _update_cache_hit_count(self, cache_id: str) -> None:
        """Update cache hit count and last access time"""
        try:
            # Use RPC call for PostgreSQL expression
            url = f"{self.config.url}/rest/v1/rpc/increment_cache_hit"
            
            rpc_data = {
                'cache_id': cache_id
            }
            
            async with self.session.post(
                url,
                headers=self._get_headers(),
                json=rpc_data
            ) as response:
                if response.status not in [200, 204]:
                    # Fallback: get current count and update
                    await self._update_cache_hit_count_fallback(cache_id)
                    
        except Exception as e:
            logger.error(f"Failed to update cache hit count: {str(e)}")
            # Try fallback method
            await self._update_cache_hit_count_fallback(cache_id)
    
    async def _update_cache_hit_count_fallback(self, cache_id: str) -> None:
        """Fallback method to update cache hit count"""
        try:
            # Get current count
            url = f"{self.config.url}/rest/v1/ai_canvas_cache"
            params = {'id': f'eq.{cache_id}', 'select': 'hit_count'}
            
            async with self.session.get(url, headers=self._get_headers(), params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data:
                        current_count = data[0].get('hit_count', 0)
                        
                        # Update with incremented count
                        update_data = {
                            'hit_count': current_count + 1,
                            'last_hit_at': datetime.now().isoformat()
                        }
                        
                        params = {'id': f'eq.{cache_id}'}
                        async with self.session.patch(
                            url, headers=self._get_headers(), params=params, json=update_data
                        ) as update_response:
                            if update_response.status == 204:
                                logger.debug(f"Cache hit count updated for {cache_id}")
                            
        except Exception as e:
            logger.error(f"Fallback cache update failed: {str(e)}")
    
    async def store_canvas_cache(
        self, 
        visual_spec: VisualSpec, 
        canvas_instructions: CanvasInstructions,
        generation_time_ms: int,
        rendered_image_path: Optional[str] = None,
        validation_passed: bool = True
    ) -> bool:
        """Store Canvas instructions in cache"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        try:
            content_hash = self._generate_content_hash(visual_spec)
            cache_key = self._generate_cache_key(visual_spec, content_hash)
            
            cache_data = {
                'cache_key': cache_key,
                'content_hash': content_hash,
                'canvas_instructions': canvas_instructions.model_dump(mode='json'),
                'rendered_image_path': rendered_image_path,
                'visual_intent': visual_spec.intent.value,
                'theme': visual_spec.theme.value,
                'data_point_count': len(visual_spec.dataspec.data_points),
                'complexity_score': min(10, max(1, len(visual_spec.dataspec.data_points) // 5 + 1)),
                'generation_time_ms': generation_time_ms,
                'validation_passed': validation_passed,
                'validation_errors': [],
                'expires_at': (datetime.now() + timedelta(days=30)).isoformat()
            }
            
            url = f"{self.config.url}/rest/v1/ai_canvas_cache"
            
            async with self.session.post(
                url,
                headers=self._get_headers(),
                json=cache_data
            ) as response:
                if response.status in [201, 409]:  # Created or conflict (duplicate)
                    logger.info(f"Canvas instructions cached with key: {cache_key}")
                    return True
                else:
                    logger.error(f"Failed to cache Canvas instructions: {response.status}")
                    error_text = await response.text()
                    logger.error(f"Cache error details: {error_text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to store Canvas cache: {str(e)}")
            return False
    
    async def store_visual_artifact(
        self,
        visual_spec: VisualSpec,
        generation_result: GenerationResult,
        session_id: Optional[str] = None,
        content_id: Optional[str] = None,
        employee_id: Optional[str] = None
    ) -> Optional[str]:
        """Store complete visual artifact with metadata"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        try:
            artifact_id = f"artifact_{int(datetime.now().timestamp())}_{visual_spec.scene_id}"
            content_hash = self._generate_content_hash(visual_spec)
            
            # Prepare artifact data
            artifact_data = {
                'artifact_id': artifact_id,
                'scene_id': visual_spec.scene_id,
                'content_hash': content_hash,
                'visual_intent': visual_spec.intent.value,
                'rendering_path': generation_result.rendering_path.value,
                'theme': visual_spec.theme.value,
                'data_spec': visual_spec.dataspec.model_dump(mode='json'),
                'visual_spec': visual_spec.model_dump(mode='json'),
                'generation_time_ms': generation_result.generation_time_ms,
                'retry_count': generation_result.retry_count,
                'status': 'completed' if generation_result.success else 'failed',
                'session_id': session_id,
                'content_id': content_id,
                'employee_id': employee_id,
                'cache_hit': generation_result.cache_hit
            }
            
            # Add generation-specific data
            if generation_result.rendering_path == RenderingPath.CANVAS_INSTRUCTIONS:
                if isinstance(generation_result.output_data, dict):
                    artifact_data['canvas_instructions'] = generation_result.output_data
                if generation_result.file_path:
                    artifact_data['canvas_file_path'] = generation_result.file_path
            
            # Add quality metrics if available
            if hasattr(generation_result, 'accuracy_score'):
                artifact_data['validation_score'] = generation_result.accuracy_score
            
            if not generation_result.success:
                artifact_data['error_message'] = generation_result.error_message
                artifact_data['error_code'] = generation_result.error_code
            
            # Store in database
            url = f"{self.config.url}/rest/v1/ai_visual_artifacts"
            
            async with self.session.post(
                url,
                headers=self._get_headers(),
                json=artifact_data
            ) as response:
                if response.status == 201:
                    logger.info(f"Visual artifact stored: {artifact_id}")
                    return artifact_id
                else:
                    logger.error(f"Failed to store visual artifact: {response.status}")
                    error_text = await response.text()
                    logger.error(f"Artifact storage error: {error_text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to store visual artifact: {str(e)}")
            return None
    
    async def get_visual_artifacts(
        self,
        scene_id: Optional[str] = None,
        session_id: Optional[str] = None,
        visual_intent: Optional[str] = None,
        employee_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Retrieve visual artifacts with filtering"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        try:
            # Build query parameters
            params = {
                'select': '*',
                'order': 'created_at.desc',
                'limit': str(limit)
            }
            
            if scene_id:
                params['scene_id'] = f'eq.{scene_id}'
            if session_id:
                params['session_id'] = f'eq.{session_id}'
            if visual_intent:
                params['visual_intent'] = f'eq.{visual_intent}'
            if employee_id:
                params['employee_id'] = f'eq.{employee_id}'
            
            url = f"{self.config.url}/rest/v1/ai_visual_artifacts"
            
            async with self.session.get(
                url,
                headers=self._get_headers(),
                params=params
            ) as response:
                if response.status == 200:
                    artifacts = await response.json()
                    logger.info(f"Retrieved {len(artifacts)} visual artifacts")
                    return artifacts
                else:
                    logger.error(f"Failed to retrieve artifacts: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Failed to retrieve visual artifacts: {str(e)}")
            return []
    
    async def track_usage(
        self,
        request_id: str,
        visual_intent: str,
        rendering_path: str,
        generation_time_ms: int,
        success: bool,
        session_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        company_id: Optional[str] = None,
        model_used: Optional[str] = None,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[float] = None,
        cache_hit: bool = False,
        retry_count: int = 0,
        validation_score: Optional[float] = None,
        error_code: Optional[str] = None
    ) -> bool:
        """Track AI visual generation usage and costs"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        try:
            usage_data = {
                'request_id': request_id,
                'session_id': session_id,
                'employee_id': employee_id,
                'company_id': company_id,
                'visual_intent': visual_intent,
                'rendering_path': rendering_path,
                'model_used': model_used,
                'generation_time_ms': generation_time_ms,
                'retry_count': retry_count,
                'cache_hit': cache_hit,
                'tokens_used': tokens_used,
                'cost_usd': cost_usd,
                'success': success,
                'validation_score': validation_score,
                'error_code': error_code
            }
            
            url = f"{self.config.url}/rest/v1/ai_visual_usage"
            
            async with self.session.post(
                url,
                headers=self._get_headers(),
                json=usage_data
            ) as response:
                if response.status == 201:
                    logger.debug(f"Usage tracked for request: {request_id}")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to track usage: {response.status} - {error_text}")
                    print(f"Usage tracking error: {response.status} - {error_text}")  # Debug print
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to track usage: {str(e)}")
            return False
    
    async def clean_expired_cache(self) -> int:
        """Clean expired cache entries"""
        if not self.session:
            raise RuntimeError("SupabaseArtifactManager not initialized as async context")
        
        try:
            # Call the stored procedure
            url = f"{self.config.url}/rest/v1/rpc/clean_expired_ai_cache"
            
            async with self.session.post(
                url,
                headers=self._get_headers(),
                json={}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    cleaned_count = result if isinstance(result, int) else 0
                    logger.info(f"Cleaned {cleaned_count} expired cache entries")
                    return cleaned_count
                else:
                    logger.error(f"Failed to clean cache: {response.status}")
                    return 0
                    
        except Exception as e:
            logger.error(f"Failed to clean expired cache: {str(e)}")
            return 0


# Convenience functions for direct usage
async def get_cached_canvas(visual_spec: VisualSpec) -> Optional[CachedCanvas]:
    """Get cached Canvas instructions if available"""
    async with SupabaseArtifactManager() as manager:
        return await manager.check_canvas_cache(visual_spec)


async def cache_canvas_instructions(
    visual_spec: VisualSpec,
    canvas_instructions: CanvasInstructions,
    generation_time_ms: int,
    rendered_image_path: Optional[str] = None
) -> bool:
    """Cache Canvas instructions for future use"""
    async with SupabaseArtifactManager() as manager:
        return await manager.store_canvas_cache(
            visual_spec, canvas_instructions, generation_time_ms, rendered_image_path
        )


async def store_generation_result(
    visual_spec: VisualSpec,
    generation_result: GenerationResult,
    session_id: Optional[str] = None,
    content_id: Optional[str] = None,
    employee_id: Optional[str] = None
) -> Optional[str]:
    """Store complete generation result in Supabase"""
    async with SupabaseArtifactManager() as manager:
        return await manager.store_visual_artifact(
            visual_spec, generation_result, session_id, content_id, employee_id
        )


if __name__ == "__main__":
    # Simple test
    async def test_supabase_integration():
        from validators.schema import VisualIntent, DataSpec, DataPoint, DataType, Theme
        
        # Create test visual spec
        data_points = [
            DataPoint(label="Q1", value=120),
            DataPoint(label="Q2", value=150),
            DataPoint(label="Q3", value=180),
            DataPoint(label="Q4", value=200)
        ]
        
        data_spec = DataSpec(
            data_type=DataType.NUMERICAL,
            data_points=data_points
        )
        
        visual_spec = VisualSpec(
            scene_id="test_scene_001",
            intent=VisualIntent.BAR_CHART,
            dataspec=data_spec,
            title="Test Chart",
            theme=Theme.PROFESSIONAL
        )
        
        print("🧪 Testing Supabase integration...")
        
        async with SupabaseArtifactManager() as manager:
            # Test cache check
            cached = await manager.check_canvas_cache(visual_spec)
            if cached:
                print(f"✅ Found cached Canvas: {cached.cache_key}")
            else:
                print("ℹ️ No cached Canvas found")
            
            # Test usage tracking
            success = await manager.track_usage(
                request_id="test_request_001",
                visual_intent=visual_spec.intent.value,
                rendering_path="canvas_instructions",
                generation_time_ms=1500,
                success=True,
                cache_hit=cached is not None
            )
            
            if success:
                print("✅ Usage tracking successful")
            else:
                print("❌ Usage tracking failed")
    
    asyncio.run(test_supabase_integration())