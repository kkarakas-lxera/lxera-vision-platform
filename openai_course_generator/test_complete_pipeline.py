#!/usr/bin/env python3
"""
Complete Pipeline Test - Full End-to-End Content Generation.

This test validates the entire pipeline:
1. Employee Personalization Analysis
2. Web Research (Tavily + Firecrawl)
3. Content Generation (7,500+ words)
4. Quality Validation and Enhancement
5. Final Content Assembly
"""

import json
import time
import asyncio
from datetime import datetime
from typing import Dict, Any, List
import sys
from pathlib import Path

# Add project to path
sys.path.append(str(Path(__file__).parent))

class CompletePipelineTest:
    """Test the complete content generation pipeline."""
    
    def __init__(self):
        self.start_time = time.time()
        self.results = {}
        
    async def run_complete_pipeline(self):
        """Run the complete pipeline test."""
        
        print("🚀 COMPLETE CONTENT GENERATION PIPELINE TEST")
        print("=" * 80)
        print("Testing: Employee → Research → Content → Quality → Final Output")
        print("=" * 80)
        
        # Step 1: Employee Personalization
        employee_data = await self.test_employee_personalization()
        
        # Step 2: Web Research
        research_data = await self.test_web_research(employee_data)
        
        # Step 3: Content Generation
        content_data = await self.test_content_generation(employee_data, research_data)
        
        # Step 4: Quality Validation
        quality_data = await self.test_quality_validation(content_data, employee_data)
        
        # Step 5: Final Assembly
        final_output = await self.test_final_assembly(content_data, quality_data)
        
        # Generate comprehensive report
        self.generate_pipeline_report()
        
        return self.results
    
    async def test_employee_personalization(self) -> Dict[str, Any]:
        """Step 1: Test employee personalization analysis."""
        print("\n📋 STEP 1: Employee Personalization Analysis")
        print("-" * 60)
        
        try:
            # Import personalization tools
            from tools.personalization_tools import employee_analyzer
            
            # Test employee profile
            employee_profile = {
                "employee_id": "EMP-2024-001",
                "full_name": "Sarah Chen",
                "job_title_current": "Financial Analyst",
                "job_title_specific": "Senior Financial Analyst - Corporate Finance",
                "department": "Finance",
                "years_experience": 5,
                "career_aspirations_next_role": "Finance Manager",
                "career_aspirations_long_term": "Chief Financial Officer",
                "skills": [
                    "Financial Modeling",
                    "Data Analysis", 
                    "Financial Reporting",
                    "Budget Planning",
                    "Excel Advanced"
                ],
                "skill_gaps": [
                    "Strategic Planning",
                    "Team Leadership",
                    "Advanced Financial Analytics",
                    "Risk Management"
                ],
                "tools_software_used_regularly": [
                    "Microsoft Excel",
                    "PowerBI",
                    "SAP",
                    "Bloomberg Terminal"
                ],
                "learning_style": "Visual learner with preference for practical examples",
                "industry": "Technology",
                "company_size": "Enterprise (5000+ employees)"
            }
            
            # Analyze employee profile
            print(f"👤 Analyzing profile for: {employee_profile['full_name']}")
            analysis_result = employee_analyzer(json.dumps(employee_profile))
            analysis_data = json.loads(analysis_result)
            
            if analysis_data.get("success"):
                print(f"✅ Profile analysis complete")
                print(f"  • Current Role: {employee_profile['job_title_current']}")
                print(f"  • Career Goal: {employee_profile['career_aspirations_next_role']}")
                print(f"  • Key Skills: {len(employee_profile['skills'])} identified")
                print(f"  • Skill Gaps: {len(employee_profile['skill_gaps'])} identified")
                print(f"  • Primary Tools: {', '.join(employee_profile['tools_software_used_regularly'][:2])}")
                
                personalization_context = {
                    "employee_name": employee_profile["full_name"],
                    "current_role": employee_profile["job_title_current"],
                    "career_goal": employee_profile["career_aspirations_next_role"],
                    "key_tools": employee_profile["tools_software_used_regularly"],
                    "skill_gaps": employee_profile["skill_gaps"],
                    "industry": employee_profile["industry"],
                    "learning_focus": "Advanced Financial Analysis and Strategic Planning"
                }
                
                self.results["personalization"] = {
                    "success": True,
                    "employee_profile": employee_profile,
                    "personalization_context": personalization_context,
                    "analysis_data": analysis_data
                }
                
                return personalization_context
            else:
                raise Exception("Employee analysis failed")
                
        except Exception as e:
            print(f"❌ Personalization failed: {e}")
            self.results["personalization"] = {
                "success": False,
                "error": str(e)
            }
            # Return default context to continue testing
            return {
                "employee_name": "Test Employee",
                "current_role": "Financial Analyst",
                "career_goal": "Finance Manager",
                "key_tools": ["Excel", "PowerBI"],
                "industry": "Technology"
            }
    
    async def test_web_research(self, employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Step 2: Test web research with Tavily and Firecrawl."""
        print("\n🔍 STEP 2: Web Research (Tavily + Firecrawl)")
        print("-" * 60)
        
        try:
            from tools.research_tools import tavily_search, firecrawl_extract
            
            # Generate research queries based on employee context
            research_queries = [
                f"advanced financial analysis techniques for {employee_context['industry']} industry",
                f"financial modeling best practices {employee_context['current_role']}",
                f"strategic planning skills for {employee_context['career_goal']}",
                "financial risk management frameworks enterprise"
            ]
            
            all_research_data = {
                "tavily_results": [],
                "firecrawl_extracts": [],
                "total_sources": 0,
                "total_content_words": 0
            }
            
            # Tavily searches
            print("  🔍 Conducting Tavily searches...")
            for query in research_queries[:2]:  # Limit to 2 queries for testing
                try:
                    print(f"    • Searching: {query[:50]}...")
                    result = tavily_search(query, json.dumps({"max_results": 3}))
                    if isinstance(result, str):
                        try:
                            result_data = json.loads(result)
                            if result_data.get("success"):
                                all_research_data["tavily_results"].append(result_data)
                                source_count = result_data.get("result_count", 0)
                                all_research_data["total_sources"] += source_count
                                print(f"      ✅ Found {source_count} sources")
                        except:
                            print(f"      ⚠️  Non-JSON response")
                except Exception as e:
                    print(f"      ❌ Search failed: {str(e)[:50]}")
            
            # Firecrawl extraction (simplified for testing)
            print("  📄 Extracting content with Firecrawl...")
            test_urls = [
                "https://www.investopedia.com/terms/f/financial-analysis.asp",
                "https://www.wallstreetmojo.com/financial-modeling/"
            ]
            
            for url in test_urls[:1]:  # Limit to 1 URL for testing
                try:
                    print(f"    • Extracting: {url[:50]}...")
                    result = firecrawl_extract(url, "markdown")
                    if isinstance(result, str):
                        try:
                            result_data = json.loads(result)
                            if result_data.get("success"):
                                content = result_data.get("content", "")
                                word_count = len(content.split()) if content else 0
                                all_research_data["firecrawl_extracts"].append({
                                    "url": url,
                                    "word_count": word_count,
                                    "success": True
                                })
                                all_research_data["total_content_words"] += word_count
                                print(f"      ✅ Extracted {word_count} words")
                        except:
                            print(f"      ⚠️  Non-JSON response")
                except Exception as e:
                    print(f"      ❌ Extraction failed: {str(e)[:50]}")
            
            # Summarize research results
            print(f"\n  📊 Research Summary:")
            print(f"    • Total sources found: {all_research_data['total_sources']}")
            print(f"    • Content extracted: {all_research_data['total_content_words']} words")
            print(f"    • Tavily searches: {len(all_research_data['tavily_results'])} successful")
            print(f"    • Firecrawl extracts: {len(all_research_data['firecrawl_extracts'])} successful")
            
            self.results["research"] = {
                "success": all_research_data["total_sources"] > 0,
                "research_data": all_research_data,
                "queries_used": research_queries
            }
            
            return all_research_data
            
        except Exception as e:
            print(f"❌ Research phase failed: {e}")
            self.results["research"] = {
                "success": False,
                "error": str(e)
            }
            return {"total_sources": 0, "total_content_words": 0}
    
    async def test_content_generation(self, employee_context: Dict[str, Any], research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Step 3: Test content generation with 7,500+ words."""
        print("\n📝 STEP 3: Content Generation (7,500+ Words)")
        print("-" * 60)
        
        try:
            from comprehensive_content_generator import ComprehensiveContentGenerator
            
            generator = ComprehensiveContentGenerator()
            
            # Generate module content
            print(f"  📚 Generating module for {employee_context['employee_name']}...")
            print(f"    • Module: Advanced Financial Analysis")
            print(f"    • Target: 7,500+ words")
            print(f"    • Personalization: {employee_context['current_role']} → {employee_context['career_goal']}")
            
            start_time = time.time()
            
            result = generator.generate_full_module(
                module_name="Advanced Financial Analysis and Strategic Planning",
                employee_name=employee_context["employee_name"],
                current_role=employee_context["current_role"],
                career_goal=employee_context["career_goal"],
                key_tools=employee_context["key_tools"]
            )
            
            generation_time = time.time() - start_time
            
            if result.get("success"):
                word_count = result.get("word_count", 0)
                print(f"\n  ✅ Content generated successfully!")
                print(f"    • Word count: {word_count:,} words")
                print(f"    • Generation time: {generation_time:.1f} seconds")
                print(f"    • Target achieved: {'✅' if word_count >= 7500 else '❌'}")
                
                # Check content sections
                sections = result.get("content_sections", {})
                print(f"    • Content sections: {len(sections)}")
                for section, content in sections.items():
                    section_words = len(content.split()) if content else 0
                    print(f"      - {section}: {section_words:,} words")
                
                self.results["content_generation"] = {
                    "success": True,
                    "word_count": word_count,
                    "generation_time": generation_time,
                    "content_data": result,
                    "meets_target": word_count >= 7500
                }
                
                return result
            else:
                raise Exception("Content generation failed")
                
        except Exception as e:
            print(f"❌ Content generation failed: {e}")
            self.results["content_generation"] = {
                "success": False,
                "error": str(e)
            }
            return {"success": False, "generated_content": "Test content", "word_count": 0}
    
    async def test_quality_validation(self, content_data: Dict[str, Any], employee_context: Dict[str, Any]) -> Dict[str, Any]:
        """Step 4: Test quality validation with enhanced tools."""
        print("\n🔍 STEP 4: Quality Validation and Enhancement")
        print("-" * 60)
        
        try:
            from tools.quality_tools import (
                quality_assessor, blueprint_validator, 
                personalization_checker, enhancement_suggester
            )
            
            content = content_data.get("generated_content", "")
            
            # Define blueprint for validation
            blueprint = {
                "learning_objectives": [
                    "Master advanced financial analysis techniques",
                    "Develop strategic planning capabilities",
                    "Apply financial modeling best practices",
                    "Understand risk management frameworks"
                ],
                "key_concepts": [
                    "Financial Statement Analysis",
                    "Ratio Analysis",
                    "Financial Modeling",
                    "Strategic Planning",
                    "Risk Assessment"
                ],
                "required_topics": [
                    "Advanced ratio analysis",
                    "Financial forecasting",
                    "Strategic financial planning",
                    "Risk management strategies"
                ],
                "target_word_count": 7500
            }
            
            # 1. Quality Assessment
            print("  📊 Running quality assessment...")
            quality_result = quality_assessor(content)
            quality_data = json.loads(quality_result)
            
            if quality_data.get("success"):
                overall_score = quality_data.get("overall_score", 0)
                word_count = quality_data.get("word_count", 0)
                print(f"    • Overall quality score: {overall_score}/10")
                print(f"    • Word count: {word_count:,}")
                
                # Individual scores
                scores = quality_data.get("individual_scores", {})
                for dimension, score in scores.items():
                    print(f"    • {dimension.title()}: {score}/10")
            
            # 2. Blueprint Validation
            print("\n  📋 Validating blueprint compliance...")
            blueprint_result = blueprint_validator(content, json.dumps(blueprint))
            blueprint_data = json.loads(blueprint_result)
            
            if blueprint_data.get("success"):
                compliance = blueprint_data.get("blueprint_compliance", 0)
                print(f"    • Blueprint compliance: {compliance}%")
                print(f"    • Missing elements: {len(blueprint_data.get('missing_elements', []))}")
                print(f"    • Covered elements: {len(blueprint_data.get('covered_elements', []))}")
            
            # 3. Personalization Check
            print("\n  👤 Checking personalization...")
            personalization_result = personalization_checker(content, json.dumps(employee_context))
            personalization_data = json.loads(personalization_result)
            
            if personalization_data.get("success"):
                p_score = personalization_data.get("personalization_score", 0)
                print(f"    • Personalization score: {p_score}%")
                found_elements = personalization_data.get("found_elements", [])
                print(f"    • Personalized elements: {len(found_elements)}")
                for element in found_elements[:3]:
                    print(f"      - {element}")
            
            # 4. Enhancement Suggestions
            print("\n  💡 Generating enhancement suggestions...")
            enhancement_result = enhancement_suggester(quality_result, blueprint_result)
            enhancement_data = json.loads(enhancement_result)
            
            if enhancement_data.get("success"):
                suggestions = enhancement_data.get("enhancement_suggestions", [])
                print(f"    • Total suggestions: {len(suggestions)}")
                
                action_plan = enhancement_data.get("action_plan", {})
                immediate = action_plan.get("immediate_actions", [])
                if immediate:
                    print(f"    • High priority actions:")
                    for action in immediate[:2]:
                        print(f"      - {action.get('suggestion', 'N/A')[:70]}...")
            
            # Overall quality assessment
            quality_passed = (
                quality_data.get("overall_score", 0) >= 7.5 and
                blueprint_data.get("blueprint_compliance", 0) >= 85 and
                personalization_data.get("personalization_score", 0) >= 60
            )
            
            print(f"\n  {'✅' if quality_passed else '❌'} Quality Gate: {'PASSED' if quality_passed else 'NEEDS IMPROVEMENT'}")
            
            self.results["quality_validation"] = {
                "success": True,
                "quality_passed": quality_passed,
                "quality_score": quality_data.get("overall_score", 0),
                "blueprint_compliance": blueprint_data.get("blueprint_compliance", 0),
                "personalization_score": personalization_data.get("personalization_score", 0),
                "enhancement_suggestions": len(suggestions) if 'suggestions' in locals() else 0
            }
            
            return {
                "quality_data": quality_data,
                "blueprint_data": blueprint_data,
                "personalization_data": personalization_data,
                "enhancement_data": enhancement_data
            }
            
        except Exception as e:
            print(f"❌ Quality validation failed: {e}")
            self.results["quality_validation"] = {
                "success": False,
                "error": str(e)
            }
            return {"quality_passed": False}
    
    async def test_final_assembly(self, content_data: Dict[str, Any], quality_data: Dict[str, Any]) -> Dict[str, Any]:
        """Step 5: Test final content assembly and output."""
        print("\n📦 STEP 5: Final Content Assembly")
        print("-" * 60)
        
        try:
            # Simulate final assembly
            final_output = {
                "module_id": f"MOD-{int(time.time())}",
                "module_name": "Advanced Financial Analysis and Strategic Planning",
                "generation_timestamp": datetime.now().isoformat(),
                "content": {
                    "main_content": content_data.get("generated_content", ""),
                    "word_count": content_data.get("word_count", 0),
                    "sections": content_data.get("content_sections", {})
                },
                "quality_metrics": {
                    "overall_score": quality_data.get("quality_data", {}).get("overall_score", 0),
                    "blueprint_compliance": quality_data.get("blueprint_data", {}).get("blueprint_compliance", 0),
                    "personalization_score": quality_data.get("personalization_data", {}).get("personalization_score", 0)
                },
                "metadata": {
                    "employee_name": self.results.get("personalization", {}).get("personalization_context", {}).get("employee_name", "Unknown"),
                    "generation_pipeline": "OpenAI Agents v1.0",
                    "total_processing_time": time.time() - self.start_time
                }
            }
            
            print(f"  ✅ Final assembly complete!")
            print(f"    • Module ID: {final_output['module_id']}")
            print(f"    • Total processing time: {final_output['metadata']['total_processing_time']:.1f} seconds")
            print(f"    • Final word count: {final_output['content']['word_count']:,}")
            
            # Save output
            from pathlib import Path
            output_dir = Path("./output/pipeline_test")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            output_file = output_dir / f"complete_pipeline_test_{int(time.time())}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(final_output, f, indent=2, default=str)
            
            print(f"    • Output saved: {output_file}")
            
            self.results["final_assembly"] = {
                "success": True,
                "output_file": str(output_file),
                "module_id": final_output["module_id"],
                "total_time": final_output["metadata"]["total_processing_time"]
            }
            
            return final_output
            
        except Exception as e:
            print(f"❌ Final assembly failed: {e}")
            self.results["final_assembly"] = {
                "success": False,
                "error": str(e)
            }
            return {}
    
    def generate_pipeline_report(self):
        """Generate comprehensive pipeline test report."""
        total_time = time.time() - self.start_time
        
        print("\n" + "=" * 80)
        print("🎯 COMPLETE PIPELINE TEST REPORT")
        print("=" * 80)
        
        # Overall metrics
        steps_completed = sum(1 for r in self.results.values() if r.get("success", False))
        total_steps = len(self.results)
        success_rate = (steps_completed / total_steps * 100) if total_steps > 0 else 0
        
        print(f"⏱️  Total Pipeline Time: {total_time:.1f} seconds ({total_time/60:.1f} minutes)")
        print(f"✅ Steps Completed: {steps_completed}/{total_steps} ({success_rate:.1f}%)")
        
        # Step-by-step results
        print("\n📋 Pipeline Step Results:")
        
        step_names = {
            "personalization": "Employee Personalization",
            "research": "Web Research",
            "content_generation": "Content Generation",
            "quality_validation": "Quality Validation", 
            "final_assembly": "Final Assembly"
        }
        
        for step_key, step_name in step_names.items():
            if step_key in self.results:
                result = self.results[step_key]
                status = "✅ PASS" if result.get("success", False) else "❌ FAIL"
                print(f"  {status} - {step_name}")
                
                # Step-specific metrics
                if step_key == "personalization" and result.get("success"):
                    print(f"       Employee: {result.get('personalization_context', {}).get('employee_name', 'Unknown')}")
                elif step_key == "research" and result.get("success"):
                    data = result.get("research_data", {})
                    print(f"       Sources: {data.get('total_sources', 0)}, Content: {data.get('total_content_words', 0)} words")
                elif step_key == "content_generation" and result.get("success"):
                    print(f"       Word Count: {result.get('word_count', 0):,} words")
                    print(f"       Target Met: {'✅' if result.get('meets_target', False) else '❌'}")
                elif step_key == "quality_validation" and result.get("success"):
                    print(f"       Quality Score: {result.get('quality_score', 0)}/10")
                    print(f"       Compliance: {result.get('blueprint_compliance', 0)}%")
                    print(f"       Quality Gate: {'✅ PASSED' if result.get('quality_passed', False) else '❌ FAILED'}")
        
        # Overall assessment
        print("\n🏆 Overall Pipeline Assessment:")
        
        if success_rate >= 100:
            print("  🎉 EXCELLENT - All pipeline steps completed successfully!")
            print("  ✅ Ready for production deployment")
        elif success_rate >= 80:
            print("  ✅ GOOD - Pipeline mostly functional")
            print("  ⚠️  Minor issues to address before production")
        elif success_rate >= 60:
            print("  ⚠️  SATISFACTORY - Core pipeline working")
            print("  🔧 Several components need attention")
        else:
            print("  ❌ NEEDS IMPROVEMENT - Pipeline has critical issues")
            print("  🔧 Major fixes required before production")
        
        # Key achievements
        if self.results.get("content_generation", {}).get("meets_target"):
            print("\n🎯 Key Achievements:")
            print("  ✅ 7,500+ word generation target achieved")
        if self.results.get("quality_validation", {}).get("quality_passed"):
            print("  ✅ Quality standards met (7.5+ score)")
        if self.results.get("personalization", {}).get("success"):
            print("  ✅ Full employee personalization active")
        if self.results.get("research", {}).get("success"):
            print("  ✅ Web research APIs functional")
        
        print("=" * 80)


async def main():
    """Run the complete pipeline test."""
    test = CompletePipelineTest()
    results = await test.run_complete_pipeline()
    return results


if __name__ == "__main__":
    asyncio.run(main())