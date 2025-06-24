#!/usr/bin/env python3
"""
Progress Tracker Utility
Tracks pipeline progress and provides status updates
"""

import time
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)

class StageStatus(Enum):
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class StageProgress:
    """Progress information for a pipeline stage"""
    name: str
    status: StageStatus = StageStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    progress_percent: float = 0.0
    current_step: Optional[str] = None
    total_steps: int = 0
    completed_steps: int = 0
    error_message: Optional[str] = None
    outputs: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def duration(self) -> Optional[timedelta]:
        """Get stage duration"""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        elif self.start_time:
            return datetime.now() - self.start_time
        return None
    
    @property
    def is_complete(self) -> bool:
        """Check if stage is complete"""
        return self.status in [StageStatus.COMPLETED, StageStatus.FAILED, StageStatus.SKIPPED]

class ProgressTracker:
    """Tracks progress across the entire pipeline"""
    
    def __init__(self, pipeline_id: str = None):
        self.pipeline_id = pipeline_id or f"pipeline_{int(time.time())}"
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
        
        # Stage tracking
        self.stages: Dict[str, StageProgress] = {}
        self.stage_order: List[str] = []
        self.current_stage: Optional[str] = None
        
        # Overall progress
        self.total_progress: float = 0.0
        self.is_complete: bool = False
        self.has_errors: bool = False
        
        logger.info(f"Progress tracker initialized: {self.pipeline_id}")
    
    def add_stage(self, stage_name: str, total_steps: int = 0):
        """Add a stage to track"""
        self.stages[stage_name] = StageProgress(
            name=stage_name,
            total_steps=total_steps
        )
        
        if stage_name not in self.stage_order:
            self.stage_order.append(stage_name)
        
        logger.debug(f"Added stage: {stage_name} ({total_steps} steps)")
    
    def start_stage(self, stage_name: str, total_steps: int = None):
        """Start a pipeline stage"""
        if stage_name not in self.stages:
            self.add_stage(stage_name, total_steps or 0)
        
        stage = self.stages[stage_name]
        stage.status = StageStatus.RUNNING
        stage.start_time = datetime.now()
        
        if total_steps is not None:
            stage.total_steps = total_steps
        
        self.current_stage = stage_name
        
        logger.info(f"🚀 Started stage: {stage_name}")
        self._update_overall_progress()
    
    def update_stage_progress(self, 
                             stage_name: str, 
                             completed_steps: int = None,
                             progress_percent: float = None,
                             current_step: str = None):
        """Update progress for a stage"""
        if stage_name not in self.stages:
            logger.warning(f"Stage not found: {stage_name}")
            return
        
        stage = self.stages[stage_name]
        
        if completed_steps is not None:
            stage.completed_steps = completed_steps
            # Ensure total_steps is numeric before comparison
            if isinstance(stage.total_steps, (int, float)) and stage.total_steps > 0:
                stage.progress_percent = (completed_steps / stage.total_steps) * 100
        
        if progress_percent is not None:
            stage.progress_percent = min(100.0, max(0.0, progress_percent))
        
        if current_step is not None:
            stage.current_step = current_step
        
        logger.debug(f"Stage {stage_name}: {stage.progress_percent:.1f}% - {stage.current_step}")
        self._update_overall_progress()
    
    def complete_stage(self, stage_name: str, outputs: Dict[str, Any] = None):
        """Mark a stage as completed"""
        if stage_name not in self.stages:
            logger.warning(f"Stage not found: {stage_name}")
            return
        
        stage = self.stages[stage_name]
        stage.status = StageStatus.COMPLETED
        stage.end_time = datetime.now()
        stage.progress_percent = 100.0
        stage.completed_steps = stage.total_steps
        
        if outputs:
            stage.outputs.update(outputs)
        
        duration = stage.duration
        logger.info(f"✅ Completed stage: {stage_name} ({duration})")
        
        self._update_overall_progress()
        self._check_pipeline_completion()
    
    def fail_stage(self, stage_name: str, error_message: str):
        """Mark a stage as failed"""
        if stage_name not in self.stages:
            logger.warning(f"Stage not found: {stage_name}")
            return
        
        stage = self.stages[stage_name]
        stage.status = StageStatus.FAILED
        stage.end_time = datetime.now()
        stage.error_message = error_message
        
        self.has_errors = True
        
        logger.error(f"❌ Failed stage: {stage_name} - {error_message}")
        self._update_overall_progress()
    
    def skip_stage(self, stage_name: str, reason: str = ""):
        """Mark a stage as skipped"""
        if stage_name not in self.stages:
            logger.warning(f"Stage not found: {stage_name}")
            return
        
        stage = self.stages[stage_name]
        stage.status = StageStatus.SKIPPED
        stage.end_time = datetime.now()
        stage.current_step = f"Skipped: {reason}"
        
        logger.info(f"⏭️  Skipped stage: {stage_name} - {reason}")
        self._update_overall_progress()
        self._check_pipeline_completion()
    
    def _update_overall_progress(self):
        """Update overall pipeline progress"""
        if not self.stages:
            self.total_progress = 0.0
            return
        
        # Calculate weighted progress based on completed stages
        total_weight = len(self.stages)
        completed_weight = 0.0
        
        for stage in self.stages.values():
            if stage.status == StageStatus.COMPLETED:
                completed_weight += 1.0
            elif stage.status == StageStatus.RUNNING:
                completed_weight += stage.progress_percent / 100.0
            elif stage.status == StageStatus.FAILED:
                completed_weight += 0.5  # Partial credit for attempted work
        
        self.total_progress = (completed_weight / total_weight) * 100.0
    
    def _check_pipeline_completion(self):
        """Check if the entire pipeline is complete"""
        all_complete = all(stage.is_complete for stage in self.stages.values())
        
        if all_complete and not self.is_complete:
            self.is_complete = True
            self.end_time = datetime.now()
            
            total_duration = self.end_time - self.start_time
            
            if self.has_errors:
                logger.warning(f"⚠️  Pipeline completed with errors: {self.pipeline_id} ({total_duration})")
            else:
                logger.info(f"🎉 Pipeline completed successfully: {self.pipeline_id} ({total_duration})")
    
    def get_status_summary(self) -> Dict[str, Any]:
        """Get a summary of the current status"""
        duration = self.end_time - self.start_time if self.end_time else datetime.now() - self.start_time
        
        stage_summaries = []
        for stage_name in self.stage_order:
            if stage_name in self.stages:
                stage = self.stages[stage_name]
                stage_summaries.append({
                    "name": stage.name,
                    "status": stage.status.value,
                    "progress": stage.progress_percent,
                    "current_step": stage.current_step,
                    "duration": str(stage.duration) if stage.duration else None,
                    "error": stage.error_message
                })
        
        return {
            "pipeline_id": self.pipeline_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration": str(duration),
            "total_progress": round(self.total_progress, 1),
            "is_complete": self.is_complete,
            "has_errors": self.has_errors,
            "current_stage": self.current_stage,
            "stages": stage_summaries
        }
    
    def print_status(self):
        """Print a formatted status report"""
        print(f"\n📊 Pipeline Status: {self.pipeline_id}")
        print("=" * 60)
        print(f"Overall Progress: {self.total_progress:.1f}%")
        print(f"Status: {'✅ Complete' if self.is_complete else '🔄 Running'}")
        
        if self.has_errors:
            print("⚠️  Has Errors")
        
        duration = self.end_time - self.start_time if self.end_time else datetime.now() - self.start_time
        print(f"Duration: {duration}")
        
        print("\n📋 Stages:")
        for stage_name in self.stage_order:
            if stage_name in self.stages:
                stage = self.stages[stage_name]
                status_icon = {
                    StageStatus.PENDING: "⏳",
                    StageStatus.RUNNING: "🔄", 
                    StageStatus.COMPLETED: "✅",
                    StageStatus.FAILED: "❌",
                    StageStatus.SKIPPED: "⏭️"
                }.get(stage.status, "❓")
                
                print(f"  {status_icon} {stage.name}: {stage.progress_percent:.1f}%")
                
                if stage.current_step:
                    print(f"     {stage.current_step}")
                
                if stage.error_message:
                    print(f"     Error: {stage.error_message}")
        
        print()