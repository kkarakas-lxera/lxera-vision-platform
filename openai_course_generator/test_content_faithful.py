#!/usr/bin/env python3
"""
Test content-faithful video generation
"""

import os
import asyncio
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from generate_course_video import CourseVideoGenerator

logger = logging.getLogger(__name__)

async def test_content_faithful():
    """Test video generation that stays faithful to source content"""
    
    try:
        generator = CourseVideoGenerator()
        
        # Module details
        module_id = "f7839b56-0239-4b3c-8b5f-798a4030dc4a"
        module_name = "Introduction to Business Performance Reporting"
        employee_name = "Kubilay Cenk Karakas"
        company_id = "67d7bff4-1149-4f37-952e-af1841fb67fa"
        
        logger.info("🎬 Testing FIXED content-faithful video generation")
        logger.info(f"📚 Module: {module_name}")
        logger.info("🎯 Expected: Video content should match source introduction about Business Performance Reporting")
        logger.info("⏱️  Expected: Dynamic duration based on content complexity (3+ minutes)")
        logger.info("🗄️  Expected: Complete database tracking without errors")
        logger.info("🔧 NEW: Broken content fragments should be completely eliminated")
        logger.info("📝 NEW: All bullet points should be grammatically complete sentences")
        logger.info("🎙️ NEW: Narration should flow naturally without repetitive patterns")
        
        # Fetch all sections to provide context
        module_result = generator.supabase.table('cm_module_content').select('*').eq(
            'content_id', module_id
        ).single().execute()
        
        if not module_result.data:
            logger.error("Module not found!")
            return
            
        # Get all sections for context
        all_sections = {}
        for field in ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments']:
            if field in module_result.data and module_result.data[field]:
                all_sections[field] = module_result.data[field]
        
        intro_content = module_result.data['introduction']
        
        # Analyze actual source content structure
        logger.info("📋 ANALYZING SOURCE CONTENT STRUCTURE:")
        import re
        headings = re.findall(r'##\s+(.+)', intro_content)
        objectives_match = re.search(r'(learning objectives?|you will|by the end)[:\n]\s*(.+?)(?=\n\n|\n#|$)', intro_content, re.I | re.DOTALL)
        
        logger.info(f"   📄 Content length: {len(intro_content)} chars")
        logger.info(f"   📑 Markdown headings found: {len(headings)}")
        for i, heading in enumerate(headings, 1):
            logger.info(f"     {i}. ## {heading}")
        
        logger.info(f"   🎯 Learning objectives section: {'Found' if objectives_match else 'Not found'}")
        if objectives_match:
            logger.info(f"     Content: {objectives_match.group(2)[:100]}...")
        
        # Check for specific terms that should appear in generated content
        specific_terms = ['business performance reporting', 'financial analyst', 'strategic thinking', 'personal relevance']
        found_terms = []
        for term in specific_terms:
            if term.lower() in intro_content.lower():
                found_terms.append(term)
                logger.info(f"   ✅ Contains: '{term}'")
        
        logger.info(f"   📊 Content-specific terms: {len(found_terms)}/{len(specific_terms)} found")
        
        # Generate video with content-faithful approach
        result = await generator.generate_section_video(
            employee_name=employee_name,
            module_id=module_id,
            section_name='introduction',
            section_content=intro_content,
            module_name=module_name,
            company_id=company_id
        )
        
        if result['success']:
            logger.info("\n✅ VIDEO GENERATION SUCCESSFUL!")
            logger.info(f"📹 Video URL: {result['video_url']}")
            logger.info(f"⏱️  Duration: {result['duration']:.1f} seconds ({result['duration']/60:.1f} minutes)")
            
            # Check duration improvement
            if result['duration'] >= 180:  # 3+ minutes
                logger.info(f"✅ DURATION IMPROVEMENT: {result['duration']:.1f}s meets engagement requirements (3+ min)")
            else:
                logger.info(f"⚠️  DURATION: {result['duration']:.1f}s is shorter than optimal engagement time")
            
            # Validate database operations
            try:
                session = generator.supabase.table('mm_multimedia_sessions').select('*').eq(
                    'session_id', result['session_id']
                ).single().execute()
                
                if session.data:
                    logger.info(f"✅ DATABASE TRACKING: Session properly stored")
                    logger.info(f"   Status: {session.data.get('status')}")
                    logger.info(f"   Assets Generated: {session.data.get('assets_generated', 0)}")
                    logger.info(f"   Success Rate: {session.data.get('success_rate', 0):.1f}%")
                else:
                    logger.warning("⚠️  DATABASE: Session not found in database")
            except Exception as db_error:
                logger.warning(f"⚠️  DATABASE: Could not validate session tracking: {db_error}")
            
            # Query the generated slides to check content alignment
            slides = generator.supabase.table('mm_multimedia_assets').select(
                'asset_name, slide_number'
            ).eq(
                'session_id', result['session_id']
            ).eq(
                'asset_type', 'slide'
            ).order('slide_number').execute()
            
            logger.info("\n📊 DETAILED CONTENT ALIGNMENT CHECK:")
            
            # Check generated slide titles against source headings
            alignment_score = 0
            total_checks = 0
            
            for slide in slides.data:
                slide_title = slide['asset_name']
                logger.info(f"   Slide {slide['slide_number']}: '{slide_title}'")
                
                # Check alignment with source headings
                is_aligned = False
                for heading in headings:
                    if any(word.lower() in slide_title.lower() for word in heading.split() if len(word) > 3):
                        logger.info(f"     ✅ ALIGNED with source heading: '{heading}'")
                        is_aligned = True
                        alignment_score += 1
                        break
                
                if not is_aligned:
                    # Check for source-specific terms
                    found_source_terms = [term for term in found_terms if term.lower() in slide_title.lower()]
                    if found_source_terms:
                        logger.info(f"     ✅ Contains source terms: {found_source_terms}")
                        alignment_score += 0.5
                    elif slide['slide_number'] == 1 and any(word in slide_title.lower() for word in ['introduction', 'welcome', module_name.lower()]):
                        logger.info("     ✅ Appropriate title slide")
                        alignment_score += 1
                    else:
                        logger.info("     ❌ MISALIGNED - Generic or interpretive content")
                
                total_checks += 1
            
            # Calculate content faithfulness score
            faithfulness_score = (alignment_score / total_checks) * 10 if total_checks > 0 else 0
            logger.info(f"\n🎯 CONTENT FAITHFULNESS SCORE: {faithfulness_score:.1f}/10")
            
            if faithfulness_score >= 8:
                logger.info("   ✅ EXCELLENT - Content is highly faithful to source")
            elif faithfulness_score >= 6:
                logger.info("   ⚠️  GOOD - Content mostly aligned with minor interpretations")
            elif faithfulness_score >= 4:
                logger.info("   ⚠️  FAIR - Some alignment but significant interpretive content")
            else:
                logger.info("   ❌ POOR - Content heavily interpretive, not faithful to source")
            
            # Check if generated content uses exact source headings
            logger.info("\n📑 HEADING PRESERVATION CHECK:")
            for i, heading in enumerate(headings, 1):
                heading_preserved = any(heading.lower() in slide['asset_name'].lower() for slide in slides.data)
                if heading_preserved:
                    logger.info(f"   ✅ '{heading}' - PRESERVED in slide titles")
                else:
                    logger.info(f"   ❌ '{heading}' - NOT preserved in generated content")
            
            # NEW: Comprehensive content quality verification
            logger.info("\n🔧 CONTENT QUALITY VERIFICATION (NEW FIXES):")
            
            # Check script content from the generated session
            try:
                import json
                from pathlib import Path
                
                # Find the temporary directory for this session
                session_id = result['session_id']
                script_path = Path(f"/tmp/section_video_{session_id}/section_script.json")
                
                if script_path.exists():
                    with open(script_path, 'r') as f:
                        script_data = json.load(f)
                    
                    # Verify bullet points
                    total_bullets = 0
                    broken_bullets = 0
                    incomplete_sentences = 0
                    colon_fragments = 0
                    
                    for slide in script_data.get('slides', []):
                        for bullet in slide.get('bullet_points', []):
                            total_bullets += 1
                            
                            # Check for broken colon fragments
                            if ':' in bullet and not bullet.strip().endswith(('.', '!', '?')):
                                colon_fragments += 1
                                logger.error(f"   ❌ COLON FRAGMENT: '{bullet}'")
                            elif ':' in bullet:
                                # Even with periods, check for fragment patterns
                                import re
                                if re.match(r'^[a-z\s]+:', bullet.lower()):
                                    colon_fragments += 1
                                    logger.error(f"   ❌ FRAGMENT PATTERN: '{bullet}'")
                            
                            # Check for incomplete sentences
                            if not bullet.strip().endswith(('.', '!', '?')):
                                incomplete_sentences += 1
                                logger.warning(f"   ⚠️  MISSING PUNCTUATION: '{bullet}'")
                            
                            # Check for broken grammar patterns
                            if re.search(r'\w+\s+that:\s+\w+', bullet):
                                broken_bullets += 1
                                logger.error(f"   ❌ BROKEN GRAMMAR: '{bullet}'")
                    
                    # Check narration for repetitive patterns
                    narration = script_data.get('full_narration', '')
                    pay_attention_count = narration.lower().count('pay attention')
                    broken_narration_patterns = len(re.findall(r'\w+\s+that:\s+\w+', narration, re.IGNORECASE))
                    
                    logger.info(f"   📊 BULLET POINT ANALYSIS:")
                    logger.info(f"      Total bullet points: {total_bullets}")
                    logger.info(f"      Colon fragments: {colon_fragments}")
                    logger.info(f"      Incomplete sentences: {incomplete_sentences}")
                    logger.info(f"      Broken grammar: {broken_bullets}")
                    
                    logger.info(f"   🎙️ NARRATION ANALYSIS:")
                    logger.info(f"      'Pay attention' count: {pay_attention_count}")
                    logger.info(f"      Broken patterns: {broken_narration_patterns}")
                    
                    # Overall quality assessment
                    total_issues = colon_fragments + incomplete_sentences + broken_bullets + pay_attention_count + broken_narration_patterns
                    
                    if total_issues == 0:
                        logger.info(f"\n🎉 CONTENT QUALITY: PERFECT! All fixes successfully applied!")
                        logger.info(f"   ✅ No broken colon fragments")
                        logger.info(f"   ✅ All sentences properly punctuated")  
                        logger.info(f"   ✅ No broken grammar patterns")
                        logger.info(f"   ✅ No repetitive narration")
                        logger.info(f"   ✅ Professional, cohesive content throughout")
                    else:
                        logger.error(f"\n❌ CONTENT QUALITY: {total_issues} issues remain!")
                        logger.error(f"   The fixes did not completely resolve all content issues")
                
                else:
                    logger.warning("   ⚠️  Script file not found for detailed verification")
                    
            except Exception as e:
                logger.warning(f"   ⚠️  Could not verify script content: {e}")
                
        else:
            logger.error(f"❌ Video generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_content_faithful())