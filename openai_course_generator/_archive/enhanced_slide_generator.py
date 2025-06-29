#!/usr/bin/env python3
"""
Enhanced Slide Generator with Professional Styling
Creates high-quality educational slides with proper content summarization
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap
import logging

logger = logging.getLogger(__name__)

class EnhancedSlideGenerator:
    """Professional slide generator with improved styling and content management"""
    
    def __init__(self):
        # Slide dimensions
        self.width = 1920
        self.height = 1080
        
        # Layout grid system
        self.layout = {
            'margin': 60,
            'header_height': 150,
            'title_zone_start': 150,
            'title_zone_end': 270,
            'content_zone_start': 270,
            'content_zone_end': 900,
            'footer_zone_start': 900,
            'content_padding': 20,
            'bullet_indent': 40,
            'line_spacing': 45,
        }
        
        # Color scheme (professional dark theme)
        self.colors = {
            'bg_primary': '#1a1a2e',      # Dark blue background
            'bg_secondary': '#0f0f23',     # Darker blue
            'bg_gradient_start': '#16213e',
            'bg_gradient_end': '#0f3460',
            'text_primary': '#ffffff',     # White text
            'text_secondary': '#e0e0e0',   # Light gray
            'text_tertiary': '#b0b0b0',   # Medium gray
            'accent': '#4FFFB0',          # Bright green accent
            'accent_secondary': '#00d9ff', # Cyan accent
            'overlay': (26, 26, 46, 200), # Dark overlay with transparency
            'title_bg': (15, 15, 35, 128), # Semi-transparent title background
        }
        
        # Font settings
        self.fonts = self._load_fonts()
        
        # Branding
        self.brand_name = "LXERA AI"
        self.brand_tagline = "Personalized AI Learning"
        
    def _load_fonts(self) -> Dict[str, Any]:
        """Load system fonts with fallbacks"""
        fonts = {}
        
        # Try to load professional fonts
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Avenir.ttc",
            "/System/Library/Fonts/HelveticaNeue.ttc",
            "/Library/Fonts/Arial.ttf",
        ]
        
        font_loaded = False
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    fonts['brand'] = ImageFont.truetype(font_path, 28)
                    fonts['title'] = ImageFont.truetype(font_path, 64)
                    fonts['subtitle'] = ImageFont.truetype(font_path, 42)
                    fonts['body'] = ImageFont.truetype(font_path, 32)
                    fonts['caption'] = ImageFont.truetype(font_path, 24)
                    fonts['sub_body'] = ImageFont.truetype(font_path, 28)
                    font_loaded = True
                    logger.info(f"Loaded font: {font_path}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to load font {font_path}: {e}")
        
        # Fallback to default font
        if not font_loaded:
            logger.warning("Using default font")
            default = ImageFont.load_default()
            fonts = {
                'brand': default,
                'title': default,
                'subtitle': default,
                'body': default,
                'caption': default,
                'sub_body': default,
            }
        
        return fonts
    
    def create_gradient_background(self) -> Image.Image:
        """Create a professional gradient background"""
        img = Image.new('RGB', (self.width, self.height), self.colors['bg_primary'])
        draw = ImageDraw.Draw(img)
        
        # Create gradient effect
        for y in range(self.height):
            # Calculate gradient color
            ratio = y / self.height
            r1, g1, b1 = int(self.colors['bg_gradient_start'][1:3], 16), \
                         int(self.colors['bg_gradient_start'][3:5], 16), \
                         int(self.colors['bg_gradient_start'][5:7], 16)
            r2, g2, b2 = int(self.colors['bg_gradient_end'][1:3], 16), \
                         int(self.colors['bg_gradient_end'][3:5], 16), \
                         int(self.colors['bg_gradient_end'][5:7], 16)
            
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            
            draw.line([(0, y), (self.width, y)], fill=(r, g, b))
        
        # Add subtle texture overlay
        overlay = Image.new('RGBA', (self.width, self.height), (255, 255, 255, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        
        # Add decorative elements
        # Top accent line
        draw_overlay.rectangle([(0, 0), (self.width, 4)], fill=self.colors['accent'])
        
        # Side accent
        draw_overlay.rectangle([(0, 0), (6, self.height)], fill=self.colors['accent'])
        
        # Merge overlay
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        
        return img
    
    def add_brand_header(self, img: Image.Image, draw: ImageDraw.Draw):
        """Add brand header to slide"""
        # Brand name
        draw.text((60, 30), self.brand_name, font=self.fonts['brand'], 
                 fill=self.colors['text_secondary'])
        
        # Separator line
        draw.rectangle([(60, 70), (300, 72)], fill=self.colors['accent'])
    
    def add_slide_footer(self, img: Image.Image, draw: ImageDraw.Draw, slide_number: int, 
                         total_slides: int = 9, module_name: str = "", course_name: str = ""):
        """Add enhanced footer with three-section layout and progress bar"""
        footer_height = 100
        footer_start = self.height - footer_height
        
        # Footer background with gradient
        footer_bg = Image.new('RGBA', (self.width, footer_height), (0, 0, 0, 0))
        footer_draw = ImageDraw.Draw(footer_bg)
        
        # Create gradient footer background
        for y in range(footer_height):
            alpha = int(20 + (y / footer_height) * 30)  # 20-50 alpha gradient
            footer_draw.rectangle([(0, y), (self.width, y + 1)], fill=(0, 0, 0, alpha))
        
        # Apply footer background
        img.paste(footer_bg, (0, footer_start), footer_bg)
        
        # Add separator line
        draw.rectangle([(0, footer_start), (self.width, footer_start + 2)], 
                      fill=self.colors['accent'])
        
        # Progress bar
        progress_width = 300
        progress_x = (self.width - progress_width) // 2
        progress_y = footer_start + 15
        bar_height = 6
        
        # Progress bar background
        draw.rectangle([
            (progress_x, progress_y), 
            (progress_x + progress_width, progress_y + bar_height)
        ], fill=(255, 255, 255, 50))
        
        # Progress bar fill
        progress_percent = slide_number / total_slides
        fill_width = int(progress_width * progress_percent)
        draw.rectangle([
            (progress_x, progress_y), 
            (progress_x + fill_width, progress_y + bar_height)
        ], fill=self.colors['accent'])
        
        # Three-section layout
        text_y = footer_start + 35
        
        # Left section: Module name
        if module_name:
            # Truncate if too long
            max_module_width = 500
            module_display = module_name
            if self.fonts['caption'].getbbox(module_display)[2] > max_module_width:
                module_display = module_display[:40] + "..."
            
            draw.text((self.layout['margin'], text_y), module_display, 
                     font=self.fonts['caption'], fill=self.colors['text_secondary'])
        
        # Center section: Course/Company name or LXERA AI
        center_text = course_name if course_name else "LXERA AI Learning Platform"
        center_bbox = self.fonts['caption'].getbbox(center_text)
        center_x = (self.width - (center_bbox[2] - center_bbox[0])) // 2
        draw.text((center_x, text_y), center_text, 
                 font=self.fonts['caption'], fill=self.colors['text_tertiary'])
        
        # Right section: Page indicator
        page_text = f"Slide {slide_number} of {total_slides}"
        page_bbox = self.fonts['caption'].getbbox(page_text)
        page_x = self.width - self.layout['margin'] - (page_bbox[2] - page_bbox[0])
        draw.text((page_x, text_y), page_text, 
                 font=self.fonts['caption'], fill=self.colors['text_secondary'])
        
        # Bottom attribution
        draw.text((self.layout['margin'], footer_start + 65), "Powered by LXERA AI", 
                 font=self.fonts['caption'], fill=self.colors['text_tertiary'])
    
    def wrap_text(self, text: str, font: Any, max_width: int) -> List[str]:
        """Wrap text to fit within max_width"""
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = font.getbbox(test_line)
            width = bbox[2] - bbox[0]
            
            if width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    # Word is too long, split it
                    lines.append(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def summarize_content(self, content: str, max_words: int = 50) -> str:
        """Summarize content to fit on slide"""
        words = content.split()
        if len(words) <= max_words:
            return content
        
        # Take first max_words and add ellipsis
        summary = ' '.join(words[:max_words])
        # Try to end at a sentence
        last_period = summary.rfind('.')
        if last_period > max_words * 0.7:  # If period is in last 30%
            summary = summary[:last_period + 1]
        else:
            summary += '...'
        
        return summary
    
    def create_title_slide(self, title: str, subtitle: str = "", 
                          employee_name: str = "", slide_number: int = 1) -> Image.Image:
        """Create a professional title slide"""
        # Create background
        img = self.create_gradient_background()
        draw = ImageDraw.Draw(img)
        
        # Add brand header
        self.add_brand_header(img, draw)
        
        # Add decorative element
        draw.rectangle([(60, 300), (800, 308)], fill=self.colors['accent'])
        
        # Title (wrapped if needed)
        title_lines = self.wrap_text(title, self.fonts['title'], self.width - 240)
        y_pos = 400
        for line in title_lines[:2]:  # Max 2 lines for title
            draw.text((120, y_pos), line, font=self.fonts['title'], 
                     fill=self.colors['text_primary'])
            y_pos += 90
        
        # Subtitle
        if subtitle:
            subtitle_lines = self.wrap_text(subtitle, self.fonts['subtitle'], self.width - 240)
            y_pos += 30
            for line in subtitle_lines[:2]:
                draw.text((120, y_pos), line, font=self.fonts['subtitle'], 
                         fill=self.colors['accent'])
                y_pos += 60
        
        # Employee name if provided
        if employee_name:
            draw.text((120, self.height - 200), f"Personalized for {employee_name}", 
                     font=self.fonts['body'], fill=self.colors['text_secondary'])
        
        # Add footer
        self.add_slide_footer(img, draw, slide_number, 9)
        
        return img
    
    def create_content_slide(self, title: str, content: List[str], 
                           slide_number: int = 1, total_slides: int = 9) -> Image.Image:
        """Create a professional content slide with bullet points"""
        # Create background
        img = self.create_gradient_background()
        draw = ImageDraw.Draw(img)
        
        # Add brand header
        self.add_brand_header(img, draw)
        
        # Title section with semi-transparent background
        title_bg = Image.new('RGBA', (self.width - 2 * self.layout['margin'], 100), self.colors['title_bg'])
        img.paste(title_bg, (self.layout['margin'], self.layout['title_zone_start']), title_bg)
        
        # Title with accent line
        title_lines = self.wrap_text(title, self.fonts['subtitle'], self.width - 2 * self.layout['margin'] - 40)
        title_y = self.layout['title_zone_start'] + 25
        draw.text((self.layout['margin'] + 20, title_y), title_lines[0] if title_lines else title, 
                 font=self.fonts['subtitle'], fill=self.colors['text_primary'])
        
        # Accent line under title
        draw.rectangle([
            (self.layout['margin'], self.layout['title_zone_end'] - 5),
            (self.width - self.layout['margin'], self.layout['title_zone_end'] - 2)
        ], fill=self.colors['accent'])
        
        # Content area
        y_pos = self.layout['content_zone_start'] + 10  # Reduced padding
        max_items = 12  # Increased to accommodate sub-bullets
        bullet_x = self.layout['margin'] + self.layout['bullet_indent']
        text_x = bullet_x + 30
        sub_bullet_x = bullet_x + 40  # Indent for sub-bullets
        sub_text_x = sub_bullet_x + 25
        
        # Adjusted spacing
        main_line_spacing = 35  # Reduced from 45
        sub_line_spacing = 28   # Smaller for sub-bullets
        
        item_count = 0
        for i, item in enumerate(content):
            if item_count >= max_items:
                break
                
            if isinstance(item, str):
                # Clean up the item
                item_text = item.strip()
                if item_text.startswith('•'):
                    item_text = item_text[1:].strip()
                
                # Check if it's a sub-bullet (starts with -)
                is_sub_bullet = item_text.startswith('-')
                if is_sub_bullet:
                    item_text = item_text[1:].strip()
                
                # Check for special formatting (case study)
                if item_text.startswith("Scenario:") or item_text.startswith("Challenge:") or \
                   item_text.startswith("Solution:") or item_text.startswith("Result:") or \
                   item_text.startswith("Background:") or item_text.startswith("Approach:") or \
                   item_text.startswith("Lessons Learned:"):
                    # Case study format - use different styling
                    parts = item_text.split(":", 1)
                    if len(parts) == 2:
                        label, text = parts
                        draw.text((self.layout['margin'], y_pos), f"{label}:", 
                                 font=self.fonts['body'], fill=self.colors['accent'])
                        if text.strip():
                            y_pos += sub_line_spacing
                            wrapped_text = self.wrap_text(text.strip(), self.fonts['sub_body'], 
                                                         self.width - text_x - self.layout['margin'])
                            for line in wrapped_text[:2]:
                                draw.text((text_x, y_pos), line, font=self.fonts['sub_body'], 
                                         fill=self.colors['text_secondary'])
                                y_pos += sub_line_spacing
                        else:
                            y_pos += sub_line_spacing
                    y_pos += 5  # Small spacing after section headers
                
                elif is_sub_bullet:
                    # Sub-bullet point
                    # Draw smaller bullet
                    draw.ellipse([
                        (sub_bullet_x - 4, y_pos + 10),
                        (sub_bullet_x + 4, y_pos + 18)
                    ], fill=self.colors['accent_secondary'])
                    
                    # Draw text with smaller font
                    lines = self.wrap_text(item_text, self.fonts['sub_body'], 
                                          self.width - sub_text_x - self.layout['margin'])
                    for j, line in enumerate(lines[:2]):
                        draw.text((sub_text_x, y_pos + j * sub_line_spacing), line, 
                                 font=self.fonts['sub_body'], fill=self.colors['text_secondary'])
                    
                    y_pos += sub_line_spacing * min(len(lines), 2) + 10
                
                else:
                    # Main bullet point
                    # Draw bullet circle
                    draw.ellipse([
                        (bullet_x - 6, y_pos + 10),
                        (bullet_x + 6, y_pos + 22)
                    ], fill=self.colors['accent'])
                    
                    # Draw text
                    lines = self.wrap_text(item_text, self.fonts['body'], 
                                          self.width - text_x - self.layout['margin'])
                    for j, line in enumerate(lines[:2]):
                        draw.text((text_x, y_pos + j * main_line_spacing), line, 
                                 font=self.fonts['body'], fill=self.colors['text_primary'])
                    
                    y_pos += main_line_spacing * min(len(lines), 2) + 15
                
                item_count += 1
                
                # Check if we're running out of space
                if y_pos > self.layout['content_zone_end'] - 50:
                    break
        
        # Add footer with module name (extracted from title if long)
        module_name = title if len(title) < 50 else ""
        self.add_slide_footer(img, draw, slide_number, total_slides, module_name)
        
        return img
    
    def create_educational_slide(self, scene: Dict[str, Any], slide_number: int) -> Image.Image:
        """Create slide based on scene data"""
        title = scene.get('title', '')
        slide_content = scene.get('slide_content', [])
        
        # Determine slide type
        if scene.get('scene_id') in [1, 6]:  # Opening and closing slides
            # Extract subtitle from content if available
            subtitle = ""
            if len(slide_content) > 2:
                subtitle = slide_content[2] if isinstance(slide_content[2], str) else ""
            
            # For opening slide, show module name
            if scene.get('scene_id') == 1 and len(slide_content) > 1:
                module_name = slide_content[1].replace("Module: ", "")
                return self.create_title_slide(title, module_name, slide_number=slide_number)
            else:
                return self.create_title_slide(title, subtitle, slide_number=slide_number)
        else:
            # Content slide
            # Process slide content
            processed_content = []
            for item in slide_content:
                if isinstance(item, str) and item.strip() and not item.endswith(':'):
                    # Skip headers that end with ':'
                    processed_content.append(item)
            
            return self.create_content_slide(title, processed_content, slide_number)
    
    def create_learning_objectives_slide(self, objectives: List[str], slide_number: int = 2, 
                                       total_slides: int = 9) -> Image.Image:
        """Create a learning objectives slide with checkmarks"""
        # Create background
        img = self.create_gradient_background()
        draw = ImageDraw.Draw(img)
        
        # Add brand header
        self.add_brand_header(img, draw)
        
        # Title section
        title = "What You'll Learn"
        title_bg = Image.new('RGBA', (self.width - 2 * self.layout['margin'], 100), self.colors['title_bg'])
        img.paste(title_bg, (self.layout['margin'], self.layout['title_zone_start']), title_bg)
        
        draw.text((self.layout['margin'] + 20, self.layout['title_zone_start'] + 25), title, 
                 font=self.fonts['subtitle'], fill=self.colors['text_primary'])
        
        # Accent line
        draw.rectangle([
            (self.layout['margin'], self.layout['title_zone_end'] - 5),
            (self.width - self.layout['margin'], self.layout['title_zone_end'] - 2)
        ], fill=self.colors['accent'])
        
        # Objectives with checkmarks
        y_pos = self.layout['content_zone_start'] + self.layout['content_padding'] + 20
        check_x = self.layout['margin'] + self.layout['bullet_indent']
        text_x = check_x + 40
        
        for objective in objectives[:5]:
            if isinstance(objective, str):
                obj_text = objective.strip()
                if obj_text.startswith('•'):
                    obj_text = obj_text[1:].strip()
                
                # Draw checkmark
                draw.text((check_x, y_pos), "✓", font=self.fonts['body'], 
                         fill=self.colors['accent'])
                
                # Draw objective text
                lines = self.wrap_text(obj_text, self.fonts['body'], 
                                      self.width - text_x - self.layout['margin'])
                for j, line in enumerate(lines[:2]):
                    draw.text((text_x, y_pos + j * self.layout['line_spacing']), line, 
                             font=self.fonts['body'], fill=self.colors['text_primary'])
                
                y_pos += self.layout['line_spacing'] * min(len(lines), 2) + 25
        
        # Add estimated time
        draw.text((self.layout['margin'], self.layout['content_zone_end'] - 60), 
                 "Estimated completion: 6-7 minutes", 
                 font=self.fonts['caption'], fill=self.colors['text_secondary'])
        
        # Add footer with module name (extracted from title if long)
        module_name = title if len(title) < 50 else ""
        self.add_slide_footer(img, draw, slide_number, total_slides, module_name)
        
        return img
    
    def create_case_study_slide(self, case_content: List[str], slide_number: int = 7, 
                               total_slides: int = 9) -> Image.Image:
        """Create a case study slide with structured format"""
        # Create background
        img = self.create_gradient_background()
        draw = ImageDraw.Draw(img)
        
        # Add brand header
        self.add_brand_header(img, draw)
        
        # Title
        title = "Case Study"
        title_bg = Image.new('RGBA', (self.width - 2 * self.layout['margin'], 100), self.colors['title_bg'])
        img.paste(title_bg, (self.layout['margin'], self.layout['title_zone_start']), title_bg)
        
        draw.text((self.layout['margin'] + 20, self.layout['title_zone_start'] + 25), title, 
                 font=self.fonts['subtitle'], fill=self.colors['text_primary'])
        
        # Accent line
        draw.rectangle([
            (self.layout['margin'], self.layout['title_zone_end'] - 5),
            (self.width - self.layout['margin'], self.layout['title_zone_end'] - 2)
        ], fill=self.colors['accent'])
        
        # Case study content with special formatting
        y_pos = self.layout['content_zone_start'] + self.layout['content_padding'] + 20
        
        for item in case_content:
            if isinstance(item, str) and item.strip():
                item_text = item.strip()
                
                # Check for labeled sections
                if any(item_text.startswith(label) for label in ["Scenario:", "Challenge:", "Solution:", "Result:"]):
                    parts = item_text.split(":", 1)
                    if len(parts) == 2:
                        label, text = parts
                        
                        # Draw label with accent color
                        draw.text((self.layout['margin'] + 20, y_pos), f"{label}:", 
                                 font=self.fonts['body'], fill=self.colors['accent'])
                        y_pos += self.layout['line_spacing'] + 5
                        
                        # Draw content with indentation
                        wrapped_text = self.wrap_text(text.strip(), self.fonts['sub_body'], 
                                                     self.width - 2 * self.layout['margin'] - 80)
                        for line in wrapped_text[:3]:
                            draw.text((self.layout['margin'] + 60, y_pos), line, 
                                     font=self.fonts['sub_body'], fill=self.colors['text_secondary'])
                            y_pos += 35
                        
                        y_pos += 20  # Extra spacing between sections
                else:
                    # Regular text
                    wrapped = self.wrap_text(item_text, self.fonts['body'], 
                                           self.width - 2 * self.layout['margin'] - 40)
                    for line in wrapped[:2]:
                        draw.text((self.layout['margin'] + 20, y_pos), line, 
                                 font=self.fonts['body'], fill=self.colors['text_primary'])
                        y_pos += self.layout['line_spacing']
                    y_pos += 10
        
        # Add footer with module name (extracted from title if long)
        module_name = title if len(title) < 50 else ""
        self.add_slide_footer(img, draw, slide_number, total_slides, module_name)
        
        return img
    
    def create_summary_slide(self, takeaways: List[str], slide_number: int = 8, 
                           total_slides: int = 9) -> Image.Image:
        """Create a summary slide with key takeaways"""
        # Create background
        img = self.create_gradient_background()
        draw = ImageDraw.Draw(img)
        
        # Add brand header
        self.add_brand_header(img, draw)
        
        # Title
        title = "Key Takeaways"
        title_bg = Image.new('RGBA', (self.width - 2 * self.layout['margin'], 100), self.colors['title_bg'])
        img.paste(title_bg, (self.layout['margin'], self.layout['title_zone_start']), title_bg)
        
        draw.text((self.layout['margin'] + 20, self.layout['title_zone_start'] + 25), title, 
                 font=self.fonts['subtitle'], fill=self.colors['text_primary'])
        
        # Accent line
        draw.rectangle([
            (self.layout['margin'], self.layout['title_zone_end'] - 5),
            (self.width - self.layout['margin'], self.layout['title_zone_end'] - 2)
        ], fill=self.colors['accent'])
        
        # Key takeaways with special bullets
        y_pos = self.layout['content_zone_start'] + self.layout['content_padding'] + 20
        bullet_x = self.layout['margin'] + self.layout['bullet_indent']
        text_x = bullet_x + 35
        
        for i, takeaway in enumerate(takeaways[:4]):
            if isinstance(takeaway, str):
                text = takeaway.strip()
                if text.startswith('•'):
                    text = text[1:].strip()
                
                # Draw numbered circle
                draw.ellipse([
                    (bullet_x - 15, y_pos + 8),
                    (bullet_x + 15, y_pos + 38)
                ], fill=self.colors['accent'])
                
                # Draw number
                draw.text((bullet_x - 5, y_pos + 12), str(i + 1), 
                         font=self.fonts['body'], fill=self.colors['bg_primary'])
                
                # Draw takeaway text
                lines = self.wrap_text(text, self.fonts['body'], 
                                      self.width - text_x - self.layout['margin'])
                for j, line in enumerate(lines[:2]):
                    draw.text((text_x, y_pos + j * self.layout['line_spacing']), line, 
                             font=self.fonts['body'], fill=self.colors['text_primary'])
                
                y_pos += self.layout['line_spacing'] * min(len(lines), 2) + 30
        
        # Add call to action
        cta_y = self.layout['content_zone_end'] - 80
        draw.rectangle([
            (self.layout['margin'], cta_y - 5),
            (self.width // 2, cta_y - 2)
        ], fill=self.colors['accent_secondary'])
        
        draw.text((self.layout['margin'], cta_y + 10), 
                 "Ready to apply these concepts? Let's get started!", 
                 font=self.fonts['sub_body'], fill=self.colors['accent_secondary'])
        
        # Add footer with module name (extracted from title if long)
        module_name = title if len(title) < 50 else ""
        self.add_slide_footer(img, draw, slide_number, total_slides, module_name)
        
        return img
    
    def generate_slides(self, podcast_data: Dict[str, Any], output_dir: Path) -> List[Path]:
        """Generate all slides for the podcast"""
        slides_dir = output_dir / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        slide_files = []
        
        for i, scene in enumerate(podcast_data.get('scenes', [])):
            slide_num = i + 1
            
            # Create slide
            slide_img = self.create_educational_slide(scene, slide_num)
            
            # Save slide
            filename = f"slide_{slide_num:02d}_{scene['title'].lower().replace(' ', '_').replace('&', 'and')}.png"
            slide_path = slides_dir / filename
            slide_img.save(slide_path, "PNG", quality=95, optimize=True)
            
            slide_files.append(slide_path)
            logger.info(f"Created slide {slide_num}: {filename}")
        
        return slide_files