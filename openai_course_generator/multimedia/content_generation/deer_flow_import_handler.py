#!/usr/bin/env python3
"""
Deer-Flow-Core Import Handler
Handles imports from deer-flow-core with graceful dependency management
"""

import sys
import os
import logging
import importlib.util
from pathlib import Path
from typing import Optional, Any, Dict, List

logger = logging.getLogger(__name__)

class DeerFlowImportHandler:
    """Handles imports from deer-flow-core with dependency management"""
    
    def __init__(self):
        self.deer_flow_path = None
        self.src_path = None
        self.initialized = False
        self.available_modules = {}
        self.failed_modules = {}
        
    def setup_paths(self) -> bool:
        """Setup deer-flow-core paths"""
        try:
            # Get deer-flow-core path
            self.deer_flow_path = Path(__file__).parent.parent.parent / "personalization_deerflow" / "deer-flow-core"
            self.src_path = self.deer_flow_path / "src"
            
            if not self.src_path.exists():
                logger.error(f"deer-flow-core not found at {self.deer_flow_path}")
                return False
            
            # Set PYTHONPATH environment variable
            current_pythonpath = os.environ.get('PYTHONPATH', '')
            if str(self.src_path) not in current_pythonpath:
                if current_pythonpath:
                    os.environ['PYTHONPATH'] = f"{self.src_path}:{current_pythonpath}"
                else:
                    os.environ['PYTHONPATH'] = str(self.src_path)
            
            # Add both paths to sys.path
            if str(self.deer_flow_path) not in sys.path:
                sys.path.insert(0, str(self.deer_flow_path))
            if str(self.src_path) not in sys.path:
                sys.path.insert(0, str(self.src_path))
            
            logger.info(f"📁 deer-flow-core paths configured: {self.deer_flow_path}")
            self.initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup deer-flow-core paths: {e}")
            return False
    
    def safe_import_module(self, module_path: str, module_name: str) -> Optional[Any]:
        """Safely import a module from deer-flow-core"""
        
        if not self.initialized and not self.setup_paths():
            return None
            
        try:
            # Check if already imported
            if module_name in self.available_modules:
                return self.available_modules[module_name]
            
            # Check if previously failed
            if module_name in self.failed_modules:
                return None
            
            # Try to import the module
            spec = importlib.util.spec_from_file_location(
                module_name, 
                str(self.src_path / module_path)
            )
            
            if spec is None:
                logger.warning(f"Could not create spec for {module_name}")
                self.failed_modules[module_name] = "spec_creation_failed"
                return None
            
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            self.available_modules[module_name] = module
            logger.debug(f"✅ Successfully imported {module_name}")
            return module
            
        except Exception as e:
            logger.debug(f"❌ Failed to import {module_name}: {e}")
            self.failed_modules[module_name] = str(e)
            return None
    
    def safe_import_standard_module(self, module_name: str) -> Optional[Any]:
        """Safely import a standard module from deer-flow-core"""
        
        if not self.initialized and not self.setup_paths():
            return None
            
        try:
            # Check if already imported
            if module_name in self.available_modules:
                return self.available_modules[module_name]
            
            # Check if previously failed
            if module_name in self.failed_modules:
                return None
            
            # Try standard import
            module = importlib.import_module(module_name)
            self.available_modules[module_name] = module
            logger.debug(f"✅ Successfully imported {module_name}")
            return module
            
        except Exception as e:
            logger.debug(f"❌ Failed to import {module_name}: {e}")
            self.failed_modules[module_name] = str(e)
            return None
    
    def get_search_tools(self) -> Dict[str, Any]:
        """Get search tools if available"""
        search_module = self.safe_import_module("tools/search.py", "search")
        if search_module:
            return {
                'firecrawl_search_tool': getattr(search_module, 'firecrawl_search_tool', None),
                'LoggedTavilySearch': getattr(search_module, 'LoggedTavilySearch', None),
                'duckduckgo_search_tool': getattr(search_module, 'duckduckgo_search_tool', None),
                'brave_search_tool': getattr(search_module, 'brave_search_tool', None),
                'arxiv_search_tool': getattr(search_module, 'arxiv_search_tool', None)
            }
        return {}
    
    def get_crawl_tools(self) -> Dict[str, Any]:
        """Get crawl tools if available"""
        # First ensure crawler is available
        crawler_module = self.safe_import_standard_module("crawler")
        if not crawler_module:
            return {}
        
        crawl_module = self.safe_import_module("tools/crawl.py", "crawl")
        if crawl_module:
            return {
                'crawl_tool': getattr(crawl_module, 'crawl_tool', None)
            }
        return {}
    
    def get_python_repl_tools(self) -> Dict[str, Any]:
        """Get Python REPL tools if available"""
        repl_module = self.safe_import_module("tools/python_repl.py", "python_repl")
        if repl_module:
            return {
                'python_repl_tool': getattr(repl_module, 'python_repl_tool', None)
            }
        return {}
    
    def get_llm_tools(self) -> Dict[str, Any]:
        """Get LLM tools if available"""
        llm_module = self.safe_import_standard_module("llms.llm")
        if llm_module:
            return {
                'get_llm_by_type': getattr(llm_module, 'get_llm_by_type', None)
            }
        return {}
    
    def get_agent_tools(self) -> Dict[str, Any]:
        """Get agent tools if available"""
        agents_module = self.safe_import_standard_module("agents.agents")
        if agents_module:
            return {
                'create_research_agent': getattr(agents_module, 'create_research_agent', None),
                'create_coder_agent': getattr(agents_module, 'create_coder_agent', None)
            }
        return {}
    
    def get_course_generation_tools(self) -> Dict[str, Any]:
        """Get course generation tools if available"""
        builder_module = self.safe_import_standard_module("course_generation_graph.builder")
        types_module = self.safe_import_standard_module("course_generation_graph.types")
        
        tools = {}
        if builder_module:
            tools['autonomous_course_graph'] = getattr(builder_module, 'autonomous_course_graph', None)
        if types_module:
            tools['CourseState'] = getattr(types_module, 'CourseState', None)
        
        return tools
    
    def get_capability_summary(self) -> Dict[str, Any]:
        """Get summary of available capabilities"""
        search_tools = self.get_search_tools()
        crawl_tools = self.get_crawl_tools()
        repl_tools = self.get_python_repl_tools()
        llm_tools = self.get_llm_tools()
        agent_tools = self.get_agent_tools()
        course_tools = self.get_course_generation_tools()
        
        return {
            'web_search_available': bool(search_tools.get('firecrawl_search_tool')),
            'crawl_available': bool(crawl_tools.get('crawl_tool')),
            'python_repl_available': bool(repl_tools.get('python_repl_tool')),
            'llm_available': bool(llm_tools.get('get_llm_by_type')),
            'agents_available': bool(agent_tools.get('create_research_agent')),
            'course_generation_available': bool(course_tools.get('autonomous_course_graph') and course_tools.get('CourseState')),
            'total_available_modules': len(self.available_modules),
            'total_failed_modules': len(self.failed_modules),
            'available_modules': list(self.available_modules.keys()),
            'failed_modules': list(self.failed_modules.keys())
        }
    
    def test_all_imports(self) -> Dict[str, bool]:
        """Test all possible imports and return results"""
        results = {}
        
        # Test all capability groups
        search_tools = self.get_search_tools()
        results['search_tools'] = bool(search_tools.get('firecrawl_search_tool'))
        
        crawl_tools = self.get_crawl_tools()
        results['crawl_tools'] = bool(crawl_tools.get('crawl_tool'))
        
        repl_tools = self.get_python_repl_tools()
        results['python_repl'] = bool(repl_tools.get('python_repl_tool'))
        
        llm_tools = self.get_llm_tools()
        results['llm_tools'] = bool(llm_tools.get('get_llm_by_type'))
        
        agent_tools = self.get_agent_tools()
        results['agent_tools'] = bool(agent_tools.get('create_research_agent'))
        
        course_tools = self.get_course_generation_tools()
        results['course_generation'] = bool(course_tools.get('autonomous_course_graph') and course_tools.get('CourseState'))
        
        return results

# Global instance
deer_flow_handler = DeerFlowImportHandler()