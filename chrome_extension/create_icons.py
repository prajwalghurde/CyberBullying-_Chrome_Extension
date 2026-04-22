"""
Simple script to create placeholder icons for the Chrome extension
Creates basic colored squares as icons
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename, text="CB"):
    """Create a simple colored icon with text"""
    # Create image
    img = Image.new('RGB', (size, size), color=(66, 133, 244))  # Google blue
    draw = ImageDraw.Draw(img)
    
    # Try to add text (skip if font not available)
    try:
        # Use default font or create without text
        font_size = size // 3
        font = ImageFont.truetype("arial.ttf", font_size)
        # Calculate text position (center)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
    except:
        # If font fails, just create solid color icon
        pass
    
    # Save image
    img.save(filename, 'PNG')

def main():
    """Create all required icon sizes"""
    icons_dir = 'icons'
    
    # Create icons directory if it doesn't exist
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
    
    # Create icons of different sizes
    sizes = [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]
    
    for size, filename in sizes:
        filepath = os.path.join(icons_dir, filename)
        create_icon(size, filepath)
        print(f"Created {filepath}")

if __name__ == "__main__":
    main()