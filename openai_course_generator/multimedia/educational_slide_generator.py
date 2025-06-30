#!/usr/bin/env python3
"""
Educational Slide Generator
Creates professional educational slides with synchronized notes and animations
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import requests
from io import BytesIO
import textwrap
import colorsys

logger = logging.getLogger(__name__)

@dataclass
class SlideDesign:
    """Design configuration for a slide"""
    background_color: Tuple[int, int, int]
    accent_color: Tuple[int, int, int]
    text_color: Tuple[int, int, int]
    secondary_color: Tuple[int, int, int]
    font_family: str
    title_font_size: int
    body_font_size: int
    header_font_size: int
    footer_font_size: int
    padding: int
    line_spacing: float
    header_height: int
    footer_height: int
    gradient_overlay: bool = True

class EducationalSlideGenerator:
    """Generates professional educational slides with various templates"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the slide generator"""
        self.openai_api_key = openai_api_key
        
        # Slide dimensions (16:9 aspect ratio)
        self.width = 1920
        self.height = 1080
        
        # Lxera brand-aligned slide design presets optimized for 1920x1080 video
        self.designs = {
            'professional': SlideDesign(
                background_color=(239, 239, 227),  # Smart Beige (#EFEFE3)
                accent_color=(122, 229, 198),      # Future Green (#7AE5C6)
                text_color=(25, 25, 25),           # Business Black (#191919)
                secondary_color=(137, 186, 239),   # Lxera Blue (#89BAEF)
                font_family='Arial',
                title_font_size=140,  # Dramatically increased for visibility
                body_font_size=72,    # Large, readable body text
                header_font_size=48,  # Clear header text
                footer_font_size=28,  # Readable footer
                padding=80,           # Proper margins for 1920x1080
                line_spacing=2.0,     # Fixed spacing to prevent overlap
                header_height=120,    # Adequate header space
                footer_height=100,    # Adequate footer space
                gradient_overlay=False  # No gradients behind text
            ),
            'modern': SlideDesign(
                background_color=(255, 255, 255),  # Lxera White
                accent_color=(122, 229, 198),      # Future Green (#7AE5C6)
                text_color=(25, 25, 25),           # Business Black (#191919)
                secondary_color=(232, 250, 155),   # Light Green (#E8FA9B)
                font_family='Helvetica',
                title_font_size=135,  # Large titles
                body_font_size=70,    # Large body text
                header_font_size=46,  # Clear headers
                footer_font_size=26,  # Readable footers
                padding=85,           # Good margins
                line_spacing=2.0,     # Fixed spacing
                header_height=115,    # Adequate space
                footer_height=95,     # Adequate space
                gradient_overlay=False
            ),
            'educational': SlideDesign(
                background_color=(239, 239, 227),  # Smart Beige (#EFEFE3)
                accent_color=(2, 156, 85),         # Emerald (#029C55)
                text_color=(25, 25, 25),           # Business Black (#191919)
                secondary_color=(122, 229, 198),   # Future Green (#7AE5C6)
                font_family='Georgia',
                title_font_size=140,  # Maximum readability
                body_font_size=72,    # Large, clear body text
                header_font_size=48,  # Professional headers
                footer_font_size=28,  # Clear footers
                padding=80,           # Optimal margins
                line_spacing=2.0,     # Fixed to prevent text overlap
                header_height=120,    # Adequate header area
                footer_height=100,    # Adequate footer area
                gradient_overlay=False  # Clean, no distractions
            )
        }
        
        # Default design
        self.current_design = self.designs['professional']
        
        # Font paths (fallback to system fonts)
        self.font_paths = self._find_system_fonts()
        
    def _find_system_fonts(self) -> Dict[str, str]:
        """Find available system fonts"""
        font_paths = {}
        
        # Common font locations
        font_dirs = [
            '/System/Library/Fonts',  # macOS
            '/usr/share/fonts',       # Linux
            'C:\\Windows\\Fonts',     # Windows
            '/Library/Fonts',         # macOS additional
        ]
        
        # Look for specific fonts
        font_files = {
            'Arial': ['Arial.ttf', 'arial.ttf', 'ArialMT.ttf'],
            'Helvetica': ['Helvetica.ttf', 'Helvetica.ttc', 'HelveticaNeue.ttf'],
            'Georgia': ['Georgia.ttf', 'georgia.ttf'],
            'Times': ['Times.ttf', 'times.ttf', 'TimesNewRoman.ttf']
        }
        
        for font_dir in font_dirs:
            if os.path.exists(font_dir):
                for font_name, possible_files in font_files.items():
                    for font_file in possible_files:
                        font_path = os.path.join(font_dir, font_file)
                        if os.path.exists(font_path):
                            font_paths[font_name] = font_path
                            break
        
        # Fallback to default if not found
        if not font_paths:
            font_paths['default'] = None  # Will use PIL default
            
        return font_paths
    
    def generate_slide_deck(
        self,
        slide_notes: List[Any],  # SlideNote objects from SlideContentExtractor
        output_dir: str,
        design_theme: str = 'professional',
        include_animations: bool = True,
        employee_context: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate a complete slide deck from extracted slide notes
        
        Args:
            slide_notes: List of SlideNote objects with content and timing
            output_dir: Directory to save slide images
            design_theme: Visual theme to use
            include_animations: Whether to include animation metadata
            
        Returns:
            List of slide metadata including paths and animation info
        """
        logger.info(f"Generating slide deck with {len(slide_notes)} slides")
        
        # Set design theme
        if design_theme in self.designs:
            self.current_design = self.designs[design_theme]
        
        # Store employee context for personalization
        self.employee_context = employee_context or {}
        
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Generate each slide
        slide_metadata = []
        
        for i, slide_note in enumerate(slide_notes):
            logger.info(f"Generating slide {i+1}/{len(slide_notes)}: {slide_note.content_section}")
            
            # Determine slide template based on content section
            if slide_note.content_section == 'title':
                slide_path = self._generate_title_slide(
                    slide_note,
                    output_path / f"slide_{i+1:03d}.png"
                )
            elif slide_note.content_section == 'summary':
                slide_path = self._generate_summary_slide(
                    slide_note,
                    output_path / f"slide_{i+1:03d}.png"
                )
            else:
                slide_path = self._generate_content_slide(
                    slide_note,
                    output_path / f"slide_{i+1:03d}.png"
                )
            
            # Create slide metadata
            metadata = {
                'slide_number': i + 1,
                'slide_id': slide_note.slide_id,
                'file_path': str(slide_path),
                'content_section': slide_note.content_section,
                'duration': slide_note.timing_cues[-1]['end'] if slide_note.timing_cues else 20,
                'transitions': slide_note.transitions
            }
            
            # Add animation data if requested
            if include_animations:
                metadata['animations'] = self._create_animation_sequence(slide_note)
            
            slide_metadata.append(metadata)
        
        logger.info(f"Slide deck generation complete: {len(slide_metadata)} slides")
        return slide_metadata
    
    def create_slide_from_script(
        self,
        slide_number: int,
        title: str,
        bullet_points: List[str],
        output_path: str,
        theme: str = 'professional',
        speaker_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a single slide from script content
        
        Args:
            slide_number: Slide number
            title: Slide title
            bullet_points: List of bullet points
            output_path: Path to save the slide
            theme: Design theme to use
            speaker_notes: Optional speaker notes
            
        Returns:
            Slide metadata
        """
        # Set design theme
        if theme in self.designs:
            self.current_design = self.designs[theme]
        
        # Create a mock slide note object for compatibility
        class MockSlideNote:
            def __init__(self, slide_num, slide_title, points, notes):
                self.slide_number = slide_num
                self.content_section = 'content'
                self.main_points = points
                self.speaker_notes = notes or ""
                self.timing_cues = []
        
        slide_note = MockSlideNote(slide_number, title, bullet_points, speaker_notes)
        
        # Generate the slide
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        if slide_number == 1 and 'welcome' in title.lower():
            slide_path = self._generate_title_slide(slide_note, output_file)
        elif 'takeaway' in title.lower() or 'summary' in title.lower():
            slide_path = self._generate_summary_slide(slide_note, output_file)
        else:
            slide_path = self._generate_content_slide(slide_note, output_file)
        
        return {
            'slide_number': slide_number,
            'file_path': str(slide_path),
            'title': title,
            'theme': theme
        }
    
    def _generate_title_slide(self, slide_note: Any, output_path: Path) -> Path:
        """Generate a professional title slide using wireframe layout"""
        # Create base image with clean background
        img = Image.new('RGB', (self.width, self.height), self.current_design.background_color)
        draw = ImageDraw.Draw(img)
        
        # Professional layout areas
        content_margin = self.current_design.padding
        
        header_area = {
            'x': 0, 'y': 0,
            'width': self.width, 'height': self.current_design.header_height
        }
        
        footer_area = {
            'x': 0,
            'y': self.height - self.current_design.footer_height,
            'width': self.width,
            'height': self.current_design.footer_height
        }
        
        # Add professional header and footer
        self._add_professional_header(draw, slide_note, header_area)
        self._add_professional_footer(draw, slide_note, footer_area)
        
        # Calculate main content area
        main_content_y_start = header_area['height'] + 60
        main_content_y_end = footer_area['y'] - 60
        
        # Module title (large and prominent)
        module_title = "Introduction to Business Performance Reporting"
        title_font = self._get_font(self.current_design.title_font_size)
        
        # Center the title
        try:
            title_bbox = title_font.getbbox(module_title)
            title_width = title_bbox[2] - title_bbox[0]
        except:
            title_width = len(module_title) * (self.current_design.title_font_size * 0.7)
        
        title_x = (self.width - title_width) // 2
        title_y = main_content_y_start + 100
        
        draw.text((title_x, title_y), module_title, 
                 fill=self.current_design.accent_color, font=title_font)
        
        # Subtitle
        subtitle = "Building Analytical Excellence"
        subtitle_font = self._get_font(64)  # Fixed subtitle size
        
        try:
            subtitle_bbox = subtitle_font.getbbox(subtitle)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        except:
            subtitle_width = len(subtitle) * 45
        
        subtitle_x = (self.width - subtitle_width) // 2
        subtitle_y = title_y + self.current_design.title_font_size + 50
        
        draw.text((subtitle_x, subtitle_y), subtitle, 
                 fill=self.current_design.secondary_color, font=subtitle_font)
        
        # Employee info card (centered)
        if hasattr(self, 'employee_context') and self.employee_context:
            card_width = 600
            card_height = 200
            card_x = (self.width - card_width) // 2
            card_y = subtitle_y + 120
            
            # Card background
            card_color = self._lighten_color(self.current_design.background_color, 0.95)
            draw.rectangle([card_x, card_y, card_x + card_width, card_y + card_height], 
                          fill=card_color, outline=self.current_design.accent_color, width=2)
            
            # Employee details
            employee_font = self._get_font(48)
            role_font = self._get_font(36)
            
            employee_name = self.employee_context.get('name', 'Learner')
            employee_role = self.employee_context.get('role', 'Professional')
            
            # Center text in card
            name_y = card_y + 40
            role_y = name_y + 60
            date_y = role_y + 50
            
            draw.text((card_x + 50, name_y), f"Welcome, {employee_name}", 
                     fill=self.current_design.text_color, font=employee_font)
            draw.text((card_x + 50, role_y), f"Role: {employee_role}", 
                     fill=self.current_design.secondary_color, font=role_font)
            draw.text((card_x + 50, date_y), f"Date: {datetime.now().strftime('%B %d, %Y')}", 
                     fill=self.current_design.secondary_color, font=role_font)
        
        # Save with high quality
        img.save(output_path, 'PNG', quality=95)
        return output_path
    
    def _generate_content_slide(self, slide_note: Any, output_path: Path) -> Path:
        """Generate a professional content slide using wireframe layout"""
        # Create base image with pure background
        img = Image.new('RGB', (self.width, self.height), self.current_design.background_color)
        draw = ImageDraw.Draw(img)
        
        # Professional layout grid system (no distracting elements)
        content_margin = self.current_design.padding
        content_width = self.width - (2 * content_margin)
        
        # Calculate layout areas based on wireframe
        header_area = {
            'x': 0, 'y': 0,
            'width': self.width, 'height': self.current_design.header_height
        }
        
        title_area = {
            'x': content_margin,
            'y': self.current_design.header_height + 20,
            'width': content_width,
            'height': 200  # Fixed title area height
        }
        
        content_area = {
            'x': content_margin,
            'y': title_area['y'] + title_area['height'],
            'width': content_width,
            'height': self.height - title_area['y'] - title_area['height'] - self.current_design.footer_height - 40
        }
        
        footer_area = {
            'x': 0,
            'y': self.height - self.current_design.footer_height,
            'width': self.width,
            'height': self.current_design.footer_height
        }
        
        # Add clean header and footer
        self._add_professional_header(draw, slide_note, header_area)
        self._add_professional_footer(draw, slide_note, footer_area)
        
        # Draw section title
        section_title = slide_note.content_section.replace('_', ' ').title()
        title_font = self._get_font(self.current_design.title_font_size)
        
        # Position title in title area
        title_x = title_area['x']
        title_y = title_area['y'] + 20
        draw.text((title_x, title_y), section_title, 
                 fill=self.current_design.accent_color, font=title_font)
        
        # Calculate bullet point layout
        bullet_start_y = content_area['y'] + 20
        available_height = content_area['height'] - 40
        
        # Use consistent, large font for body text
        body_font = self._get_font(self.current_design.body_font_size)
        line_height = int(self.current_design.body_font_size * self.current_design.line_spacing)
        
        # Calculate spacing for bullet points with new line spacing
        num_points = min(len(slide_note.main_points), 5)  # Max 5 points
        # Account for multi-line text: assume average 2 lines per point
        bullet_spacing = line_height * 3 + 20  # Space for text + gap between points
        
        # Draw bullet points with professional layout
        for i, point in enumerate(slide_note.main_points[:5]):  # Limit to 5 points
            bullet_y = bullet_start_y + i * bullet_spacing
            
            # Check if we have space
            if bullet_y + line_height > content_area['y'] + available_height:
                break
            
            # Draw professional bullet
            bullet_x = content_area['x'] + 30
            self._draw_professional_bullet(draw, bullet_x, bullet_y + (line_height // 4), i)
            
            # Draw text with proper spacing
            text_x = bullet_x + 60  # Space after bullet
            max_text_width = content_area['width'] - 90  # Account for bullet and margins
            
            # Smart text wrapping for readability
            wrapped_lines = self._smart_wrap_text(point, body_font, max_text_width)
            
            # Draw each line of wrapped text with proper spacing
            for j, line in enumerate(wrapped_lines[:3]):  # Max 3 lines per point
                line_y = bullet_y + (j * line_height)  # Use full line height for proper spacing
                draw.text((text_x, line_y), line, 
                         fill=self.current_design.text_color, font=body_font)
        
        # Save with optimal quality for video
        img.save(output_path, 'PNG', quality=95)
        return output_path
    
    def _generate_summary_slide(self, slide_note: Any, output_path: Path) -> Path:
        """Generate a summary slide"""
        # Create base image
        img = Image.new('RGB', (self.width, self.height), self.current_design.background_color)
        draw = ImageDraw.Draw(img)
        
        # Add gradient background
        self._add_gradient_background(img, self.current_design.background_color,
                                     self._lighten_color(self.current_design.accent_color, 0.95))
        
        # Add decorative elements
        self._add_decorative_shapes(draw, 'summary')
        
        # Get fonts
        title_font = self._get_font(self.current_design.title_font_size)
        body_font = self._get_font(int(self.current_design.body_font_size * 0.9))
        
        # Draw title
        title = "Key Takeaways"
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (self.width - title_width) // 2
        draw.text((title_x, self.current_design.padding), title, 
                 fill=self.current_design.accent_color, font=title_font)
        
        # Draw takeaways in a grid layout
        content_y = self.current_design.padding + self.current_design.title_font_size + 60
        
        for i, takeaway in enumerate(slide_note.main_points):
            # Create a card-like appearance for each takeaway
            card_y = content_y + i * 150
            card_height = 120
            
            # Draw card background
            card_color = self._lighten_color(self.current_design.accent_color, 0.95)
            draw.rounded_rectangle(
                [(self.current_design.padding, card_y),
                 (self.width - self.current_design.padding, card_y + card_height)],
                radius=20,
                fill=card_color
            )
            
            # Draw number
            number_font = self._get_font(60)
            draw.text((self.current_design.padding + 30, card_y + 30), 
                     str(i + 1), fill=self.current_design.accent_color, font=number_font)
            
            # Draw takeaway text
            text_x = self.current_design.padding + 120
            wrapped_text = self._wrap_text(takeaway, body_font, 
                                         self.width - text_x - self.current_design.padding - 30)
            draw.text((text_x, card_y + 35), wrapped_text, 
                     fill=self.current_design.text_color, font=body_font)
        
        # Add thank you message
        thank_you = "Thank you for your attention!"
        thank_font = self._get_font(36)
        thank_bbox = draw.textbbox((0, 0), thank_you, font=thank_font)
        thank_width = thank_bbox[2] - thank_bbox[0]
        draw.text(((self.width - thank_width) // 2, self.height - 150), 
                 thank_you, fill=self.current_design.accent_color, font=thank_font)
        
        # Save image
        img.save(output_path, 'PNG', quality=95)
        return output_path
    
    def _add_gradient_background(self, img: Image.Image, color1: Tuple[int, int, int], 
                                color2: Tuple[int, int, int]) -> None:
        """Add a gradient background to the image"""
        width, height = img.size
        
        # Create gradient
        for y in range(height):
            # Linear interpolation between colors
            ratio = y / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            
            draw = ImageDraw.Draw(img)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    def _add_background_pattern(self, img: Image.Image) -> None:
        """Add a subtle pattern to the background"""
        draw = ImageDraw.Draw(img)
        
        # Create dot pattern
        dot_spacing = 50
        dot_size = 2
        dot_color = self._lighten_color(self.current_design.accent_color, 0.95)
        
        for x in range(0, self.width, dot_spacing):
            for y in range(0, self.height, dot_spacing):
                draw.ellipse([(x, y), (x + dot_size, y + dot_size)], fill=dot_color)
    
    def _add_decorative_shapes(self, draw: ImageDraw.Draw, slide_type: str) -> None:
        """Add decorative shapes based on slide type"""
        if slide_type == 'title':
            # Large circle in top right
            circle_color = self._lighten_color(self.current_design.accent_color, 0.9)
            draw.ellipse([(self.width - 400, -200), (self.width + 200, 400)], 
                        fill=circle_color)
            
            # Small accent shapes
            for i in range(3):
                x = 100 + i * 150
                y = self.height - 200
                draw.rectangle([(x, y), (x + 80, y + 5)], 
                             fill=self.current_design.accent_color)
                
        elif slide_type == 'content':
            # Side accent bar
            draw.rectangle([(0, 0), (10, self.height)], 
                         fill=self.current_design.accent_color)
            
        elif slide_type == 'summary':
            # Decorative corners
            corner_size = 200
            corner_color = self._lighten_color(self.current_design.accent_color, 0.9)
            
            # Top left
            draw.polygon([(0, 0), (corner_size, 0), (0, corner_size)], 
                        fill=corner_color)
            
            # Bottom right
            draw.polygon([(self.width, self.height), 
                         (self.width - corner_size, self.height),
                         (self.width, self.height - corner_size)], 
                        fill=corner_color)
    
    def _draw_custom_bullet(self, draw: ImageDraw.Draw, x: int, y: int, index: int) -> None:
        """Draw a custom bullet point"""
        # Different bullet styles
        bullet_styles = ['circle', 'square', 'diamond', 'arrow']
        style = bullet_styles[index % len(bullet_styles)]
        
        size = 15
        color = self.current_design.accent_color
        
        if style == 'circle':
            draw.ellipse([(x, y), (x + size, y + size)], fill=color)
        elif style == 'square':
            draw.rectangle([(x, y), (x + size, y + size)], fill=color)
        elif style == 'diamond':
            points = [(x + size//2, y), (x + size, y + size//2), 
                     (x + size//2, y + size), (x, y + size//2)]
            draw.polygon(points, fill=color)
        elif style == 'arrow':
            points = [(x, y + size//3), (x + size*2//3, y + size//3),
                     (x + size, y + size//2), (x + size*2//3, y + size*2//3),
                     (x, y + size*2//3)]
            draw.polygon(points, fill=color)
    
    def _add_visual_placeholder(self, draw: ImageDraw.Draw, visual_type: str) -> None:
        """Add a placeholder for visual elements"""
        # Position on right side of slide
        x = self.width - 500
        y = self.height // 2 - 150
        width = 400
        height = 300
        
        # Draw placeholder box
        placeholder_color = self._lighten_color(self.current_design.accent_color, 0.95)
        draw.rounded_rectangle([(x, y), (x + width, y + height)], 
                              radius=20, fill=placeholder_color)
        
        # Add icon based on visual type
        icon_color = self.current_design.accent_color
        if 'diagram' in visual_type.lower():
            # Simple diagram icon
            draw.rectangle([(x + 100, y + 80), (x + 180, y + 120)], fill=icon_color)
            draw.rectangle([(x + 220, y + 60), (x + 300, y + 100)], fill=icon_color)
            draw.rectangle([(x + 160, y + 160), (x + 240, y + 200)], fill=icon_color)
            # Connect with lines
            draw.line([(x + 140, y + 120), (x + 200, y + 160)], fill=icon_color, width=3)
            draw.line([(x + 260, y + 100), (x + 200, y + 160)], fill=icon_color, width=3)
        elif 'chart' in visual_type.lower():
            # Bar chart icon
            bar_width = 40
            bar_spacing = 60
            for i in range(4):
                bar_height = 50 + i * 30
                bar_x = x + 80 + i * bar_spacing
                bar_y = y + height - 80 - bar_height
                draw.rectangle([(bar_x, bar_y), (bar_x + bar_width, y + height - 80)], 
                             fill=icon_color)
        else:
            # Generic image icon
            draw.rectangle([(x + 100, y + 80), (x + 300, y + 220)], 
                         outline=icon_color, width=3)
            # Mountain scene
            points = [(x + 100, y + 220), (x + 180, y + 140), 
                     (x + 260, y + 180), (x + 300, y + 220)]
            draw.polygon(points, fill=icon_color)
            # Sun
            draw.ellipse([(x + 240, y + 100), (x + 280, y + 140)], fill=icon_color)
        
        # Add label
        font = self._get_font(24)
        label = visual_type.split()[0]  # First word only
        label_bbox = draw.textbbox((0, 0), label, font=font)
        label_width = label_bbox[2] - label_bbox[0]
        draw.text((x + (width - label_width) // 2, y + height - 40), 
                 label, fill=icon_color, font=font)
    
    def _add_slide_footer(self, draw: ImageDraw.Draw, slide_num: int, total_points: int) -> None:
        """Add footer with slide number and progress"""
        footer_y = self.height - 50
        
        # Slide number
        font = self._get_font(24)
        slide_text = f"Slide {slide_num}"
        draw.text((self.current_design.padding, footer_y), 
                 slide_text, fill=self._lighten_color(self.current_design.text_color, 0.7), 
                 font=font)
        
        # Progress bar
        bar_width = 200
        bar_height = 6
        bar_x = self.width - self.current_design.padding - bar_width
        bar_y = footer_y + 10
        
        # Background bar
        draw.rounded_rectangle([(bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height)],
                              radius=3, fill=self._lighten_color(self.current_design.text_color, 0.9))
        
        # Progress bar (simulate progress based on slide number)
        progress = min(slide_num * 0.1, 1.0)  # Assume ~10 slides total
        progress_width = int(bar_width * progress)
        if progress_width > 0:
            draw.rounded_rectangle([(bar_x, bar_y), (bar_x + progress_width, bar_y + bar_height)],
                                  radius=3, fill=self.current_design.accent_color)
    
    def _get_font(self, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
        """Get font with proper fallback chain and size validation"""
        # Ensure minimum readable size for 1920x1080
        final_size = max(size, 24)  # Absolute minimum
        
        font_name = self.current_design.font_family
        
        # System font fallback chain
        font_candidates = []
        
        if font_name == 'Arial':
            font_candidates = [
                '/System/Library/Fonts/Arial.ttf',  # macOS
                '/Windows/Fonts/arial.ttf',         # Windows
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',  # Linux
                'Arial'
            ]
        elif font_name == 'Helvetica':
            font_candidates = [
                '/System/Library/Fonts/Helvetica.ttc',  # macOS
                '/Windows/Fonts/calibri.ttf',           # Windows fallback
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',  # Linux
                'Helvetica'
            ]
        elif font_name == 'Georgia':
            font_candidates = [
                '/System/Library/Fonts/Georgia.ttf',    # macOS
                '/Windows/Fonts/georgia.ttf',           # Windows
                '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',  # Linux
                'Georgia'
            ]
        else:
            font_candidates = ['Arial', 'Helvetica', 'Georgia']
        
        # Try each font candidate
        for font_candidate in font_candidates:
            try:
                if font_candidate.startswith('/'):
                    # File path
                    if os.path.exists(font_candidate):
                        return ImageFont.truetype(font_candidate, final_size)
                else:
                    # System font name
                    return ImageFont.truetype(font_candidate, final_size)
            except Exception:
                continue
        
        # Final fallback to PIL default
        try:
            # Try to get a larger default font
            return ImageFont.load_default()
        except Exception as e:
            logger.warning(f"All font loading failed: {e}, using basic default")
            return ImageFont.load_default()
    
    def _calculate_optimal_font_size(self, text: str, max_width: int, max_height: int, base_size: int) -> int:
        """Calculate optimal font size with proper constraints for 1920x1080"""
        if not text or max_width <= 0 or max_height <= 0:
            return base_size
        
        # Start with base size and validate
        test_size = base_size
        test_font = self._get_font(test_size)
        
        # Get text dimensions
        try:
            bbox = test_font.getbbox(text)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except:
            # Fallback if getbbox fails
            text_width = len(text) * (test_size * 0.6)  # Rough estimate
            text_height = test_size * 1.2
        
        # Calculate if text fits
        if text_width <= max_width and text_height <= max_height:
            return test_size
        
        # Scale down if too large
        width_scale = max_width / text_width if text_width > 0 else 1
        height_scale = max_height / text_height if text_height > 0 else 1
        scale_factor = min(width_scale, height_scale)
        
        # Apply scaling with bounds
        optimal_size = int(base_size * scale_factor)
        
        # Ensure reasonable bounds for 1920x1080
        min_size = 24  # Absolute minimum
        max_size = 200  # Reasonable maximum
        
        return max(min_size, min(optimal_size, max_size))
    
    def _wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
        """Wrap text to fit within max width"""
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = font.getbbox(test_line)
            if bbox[2] - bbox[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines)
    
    def _lighten_color(self, color: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
        """Lighten a color by a factor (0-1)"""
        # Convert to HSL
        r, g, b = [x/255.0 for x in color]
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        
        # Lighten
        l = l + (1 - l) * factor
        
        # Convert back to RGB
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        return tuple(int(x * 255) for x in (r, g, b))
    
    def _create_animation_sequence(self, slide_note: Any) -> List[Dict[str, Any]]:
        """Create animation sequence for slide elements"""
        animations = []
        
        # Title animation
        animations.append({
            'element': 'title',
            'type': 'fade_in',
            'start_time': 0,
            'duration': 0.5
        })
        
        # Bullet points appear sequentially
        for i, timing_cue in enumerate(slide_note.timing_cues[1:-1]):  # Skip intro/outro
            animations.append({
                'element': f'bullet_{i+1}',
                'type': 'slide_in_left',
                'start_time': timing_cue['start'],
                'duration': 0.3
            })
        
        # Visual elements
        if slide_note.visual_elements:
            animations.append({
                'element': 'visual',
                'type': 'zoom_in',
                'start_time': slide_note.timing_cues[-2]['start'] if len(slide_note.timing_cues) > 2 else 2,
                'duration': 0.5
            })
        
        return animations
    
    def export_slide_manifest(self, slide_metadata: List[Dict[str, Any]], output_path: str) -> None:
        """Export slide manifest with all metadata"""
        manifest = {
            'generated_at': datetime.now().isoformat(),
            'total_slides': len(slide_metadata),
            'total_duration': sum(s['duration'] for s in slide_metadata),
            'design_theme': self.current_design.font_family,
            'slides': slide_metadata
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
    
    def _add_header_section(self, draw: ImageDraw.Draw, slide_note: Any, employee_context: Dict[str, Any] = None) -> None:
        """Add professional header section to slide"""
        try:
            # Header background
            header_rect = [0, 0, self.width, self.current_design.header_height]
            draw.rectangle(header_rect, fill=self.current_design.accent_color)
            
            # Header gradient overlay
            for i in range(self.current_design.header_height):
                alpha = int(255 * (1 - i / self.current_design.header_height) * 0.2)
                color = (*self.current_design.background_color, alpha)
                if hasattr(draw, 'rectangle'):
                    overlay_rect = [0, i, self.width, i + 1]
                    # Simplified for basic PIL
            
            # Module title in header
            header_font = self._get_font(self.current_design.header_font_size)
            module_name = getattr(slide_note, 'module_name', 'Business Performance Reporting')
            
            # Left side - module name
            draw.text((30, 30), module_name, fill=(255, 255, 255), font=header_font)
            
            # Right side - personalization
            if employee_context and employee_context.get('name'):
                employee_text = f"Learning path for {employee_context['name']}"
                text_bbox = draw.textbbox((0, 0), employee_text, font=header_font)
                text_width = text_bbox[2] - text_bbox[0]
                draw.text((self.width - text_width - 30, 30), employee_text, 
                         fill=(255, 255, 255), font=header_font)
                         
        except Exception as e:
            logger.warning(f"Failed to add header section: {e}")
    
    def _add_footer_section(self, draw: ImageDraw.Draw, slide_note: Any, employee_context: Dict[str, Any] = None) -> None:
        """Add professional footer section to slide"""
        try:
            # Footer background
            footer_y = self.height - self.current_design.footer_height
            footer_rect = [0, footer_y, self.width, self.height]
            
            # Subtle footer background
            footer_color = self._darken_color(self.current_design.background_color, 0.95)
            draw.rectangle(footer_rect, fill=footer_color)
            
            # Accent line at top of footer
            line_rect = [0, footer_y, self.width, footer_y + 3]
            draw.rectangle(line_rect, fill=self.current_design.accent_color)
            
            # Footer content
            footer_font = self._get_font(self.current_design.footer_font_size)
            
            # Left side - section and progress
            section_name = getattr(slide_note, 'content_section', 'Introduction').replace('_', ' ').title()
            progress_text = f"Section: {section_name}"
            draw.text((30, footer_y + 25), progress_text, fill=self.current_design.secondary_color, font=footer_font)
            
            # Center - company branding
            company_text = "Lxera Learning Platform"
            text_bbox = draw.textbbox((0, 0), company_text, font=footer_font)
            text_width = text_bbox[2] - text_bbox[0]
            center_x = (self.width - text_width) // 2
            draw.text((center_x, footer_y + 25), company_text, 
                     fill=self.current_design.secondary_color, font=footer_font)
            
            # Right side - slide number
            slide_num = getattr(slide_note, 'slide_number', 1)
            slide_text = f"Slide {slide_num}"
            text_bbox = draw.textbbox((0, 0), slide_text, font=footer_font)
            text_width = text_bbox[2] - text_bbox[0]
            draw.text((self.width - text_width - 30, footer_y + 25), slide_text, 
                     fill=self.current_design.secondary_color, font=footer_font)
                     
        except Exception as e:
            logger.warning(f"Failed to add footer section: {e}")
    
    def _add_personalized_elements(self, draw: ImageDraw.Draw, slide_note: Any, employee_context: Dict[str, Any]) -> None:
        """Add personalized elements based on employee context"""
        try:
            if not employee_context:
                return
                
            # Add role-specific icons or elements
            role = employee_context.get('role', '').lower()
            if 'analyst' in role:
                self._add_analyst_icons(draw)
            elif 'manager' in role:
                self._add_manager_icons(draw)
            elif 'director' in role:
                self._add_executive_icons(draw)
            
            # Add skill-gap indicators
            skill_gaps = employee_context.get('skill_gaps', [])
            if skill_gaps and hasattr(slide_note, 'content_section'):
                # Highlight relevant sections
                if any(gap in slide_note.content_section.lower() for gap in skill_gaps):
                    self._add_priority_indicator(draw)
                    
        except Exception as e:
            logger.warning(f"Failed to add personalized elements: {e}")
    
    def _add_priority_indicator(self, draw: ImageDraw.Draw) -> None:
        """Add priority indicator for skill gaps"""
        # Small colored indicator in top-right
        indicator_size = 20
        x = self.width - 150
        y = self.current_design.header_height + 20
        
        # Circle indicator
        bbox = [x, y, x + indicator_size, y + indicator_size]
        draw.ellipse(bbox, fill=(255, 165, 0))  # Orange for priority
        
        # "!" symbol
        font = self._get_font(14)
        draw.text((x + 7, y + 2), "!", fill=(255, 255, 255), font=font)
    
    def _darken_color(self, color: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
        """Darken a color by a given factor"""
        return tuple(int(c * factor) for c in color)
    
    def _lighten_color(self, color: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
        """Lighten a color by a given factor"""
        return tuple(min(255, int(c * factor)) for c in color)
    
    
    def _smart_wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> List[str]:
        """Smart text wrapping with better line breaking"""
        try:
            words = text.split()
            lines = []
            current_line = []
            
            for word in words:
                # Test if adding this word exceeds max width
                test_line = ' '.join(current_line + [word])
                bbox = font.getbbox(test_line)
                line_width = bbox[2] - bbox[0]
                
                if line_width <= max_width:
                    current_line.append(word)
                else:
                    # Current line is full, start new line
                    if current_line:
                        lines.append(' '.join(current_line))
                        current_line = [word]
                    else:
                        # Single word is too long, force break
                        lines.append(word)
            
            # Add remaining words
            if current_line:
                lines.append(' '.join(current_line))
            
            return lines
            
        except Exception as e:
            logger.warning(f"Failed to smart wrap text: {e}")
            # Fallback to simple wrap
            return [text]
    
    def _add_professional_header(self, draw: ImageDraw.Draw, slide_note: Any, header_area: Dict) -> None:
        """Add clean, professional header without distracting elements"""
        try:
            # Solid header background with subtle accent
            header_color = self._lighten_color(self.current_design.background_color, 0.95)
            draw.rectangle([header_area['x'], header_area['y'], 
                           header_area['x'] + header_area['width'], 
                           header_area['y'] + header_area['height']], 
                          fill=header_color)
            
            # Thin accent line at bottom
            line_y = header_area['y'] + header_area['height'] - 3
            draw.rectangle([0, line_y, self.width, line_y + 3], 
                          fill=self.current_design.accent_color)
            
            # Header text with proper spacing
            header_font = self._get_font(self.current_design.header_font_size)
            
            # Left: Module name
            module_name = "Business Performance Reporting"
            text_y = header_area['y'] + (header_area['height'] - self.current_design.header_font_size) // 2
            draw.text((40, text_y), module_name, 
                     fill=self.current_design.text_color, font=header_font)
            
            # Right: Employee personalization
            if hasattr(self, 'employee_context') and self.employee_context:
                employee_name = self.employee_context.get('name', 'Learner')
                employee_text = f"Learning path for {employee_name}"
                
                # Calculate text width for right alignment
                try:
                    bbox = header_font.getbbox(employee_text)
                    text_width = bbox[2] - bbox[0]
                except:
                    text_width = len(employee_text) * (self.current_design.header_font_size * 0.6)
                
                text_x = self.width - text_width - 40
                draw.text((text_x, text_y), employee_text, 
                         fill=self.current_design.secondary_color, font=header_font)
                         
        except Exception as e:
            logger.warning(f"Failed to add professional header: {e}")
    
    def _add_professional_footer(self, draw: ImageDraw.Draw, slide_note: Any, footer_area: Dict) -> None:
        """Add clean, professional footer"""
        try:
            # Subtle footer background
            footer_color = self._lighten_color(self.current_design.background_color, 0.98)
            draw.rectangle([footer_area['x'], footer_area['y'], 
                           footer_area['x'] + footer_area['width'], 
                           footer_area['y'] + footer_area['height']], 
                          fill=footer_color)
            
            # Thin accent line at top
            draw.rectangle([0, footer_area['y'], self.width, footer_area['y'] + 2], 
                          fill=self.current_design.accent_color)
            
            # Footer text
            footer_font = self._get_font(self.current_design.footer_font_size)
            text_y = footer_area['y'] + (footer_area['height'] - self.current_design.footer_font_size) // 2
            
            # Left: Section name
            section_name = getattr(slide_note, 'content_section', 'Introduction').replace('_', ' ').title()
            draw.text((40, text_y), f"Section: {section_name}", 
                     fill=self.current_design.secondary_color, font=footer_font)
            
            # Center: Company branding
            company_text = "Lxera Learning Platform"
            try:
                bbox = footer_font.getbbox(company_text)
                text_width = bbox[2] - bbox[0]
            except:
                text_width = len(company_text) * (self.current_design.footer_font_size * 0.6)
            
            center_x = (self.width - text_width) // 2
            draw.text((center_x, text_y), company_text, 
                     fill=self.current_design.secondary_color, font=footer_font)
            
            # Right: Slide number
            slide_num = getattr(slide_note, 'slide_number', 1)
            slide_text = f"Slide {slide_num}"
            try:
                bbox = footer_font.getbbox(slide_text)
                text_width = bbox[2] - bbox[0]
            except:
                text_width = len(slide_text) * (self.current_design.footer_font_size * 0.6)
            
            draw.text((self.width - text_width - 40, text_y), slide_text, 
                     fill=self.current_design.secondary_color, font=footer_font)
                     
        except Exception as e:
            logger.warning(f"Failed to add professional footer: {e}")
    
    def _draw_professional_bullet(self, draw: ImageDraw.Draw, x: int, y: int, index: int) -> None:
        """Draw clean, professional bullet points"""
        try:
            bullet_size = 16  # Larger bullets for visibility
            
            # Simple filled circle for all bullets (consistency)
            bbox = [x - bullet_size//2, y - bullet_size//2, 
                   x + bullet_size//2, y + bullet_size//2]
            draw.ellipse(bbox, fill=self.current_design.accent_color)
            
        except Exception as e:
            logger.warning(f"Failed to draw professional bullet: {e}")
            # Fallback simple bullet
            draw.ellipse([x-8, y-8, x+8, y+8], fill=self.current_design.accent_color)