import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_feature_graphic():
    width, height = 1024, 500
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background gradient (Deep Forest to Vibrant Pitch Green)
    for x in range(width):
        t = x / float(width)
        # Gradient: Left #0F3223 (15, 50, 35) -> Right #1E7A4C (30, 122, 76)
        r = int(15 * (1 - t) + 30 * t)
        g = int(50 * (1 - t) + 122 * t)
        b = int(35 * (1 - t) + 76 * t)
        draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))

    # Stadium pitch lights & boundary rings
    draw.ellipse([-100, -100, 600, 600], outline=(255, 255, 255, 16), width=6)
    draw.ellipse([-50, -50, 550, 550], outline=(244, 185, 66, 30), width=3)
    draw.ellipse([width - 400, height - 300, width + 200, height + 300], outline=(255, 255, 255, 12), width=4)

    # 2. Paste Master Cricket Icon on the Left side
    icon_src = Image.open("app-icon.png").convert("RGBA")
    icon_resized = icon_src.resize((360, 360), resample=Image.Resampling.LANCZOS)

    # Drop shadow for icon
    shadow = Image.new("RGBA", (360, 360), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([10, 10, 350, 350], radius=80, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))

    img.paste(shadow, (76, 76), shadow)
    img.paste(icon_resized, (70, 70), icon_resized)

    # 3. Text & Badges on the Right side
    tx = 470
    # Top Tagline Pill
    tag_w = 480
    tag_h = 36
    draw.rounded_rectangle([tx, 80, tx + tag_w, 80 + tag_h], radius=18, fill=(244, 185, 66, 255))
    
    # Try using default font or drawing decorative elements
    draw.ellipse([tx + 16, 92, tx + 28, 104], fill=(18, 59, 42, 255))
    
    # Right Side Content Cards / Badges
    badge_y = 310
    badges = [
        ("🏆 6 ब्लॉक टूर्नामेंट", (255, 255, 255, 30)),
        ("🛡️ 11-15 खिलाड़ी रोस्टर", (255, 255, 255, 30)),
        ("🔒 100% नंबर गोपनीयता", (244, 185, 66, 50))
    ]

    bx = tx
    for text, bg_col in badges:
        draw.rounded_rectangle([bx, badge_y, bx + 160, badge_y + 44], radius=10, fill=bg_col, outline=(255, 255, 255, 40), width=1)
        bx += 175

    # Footer note
    draw.line([tx, 410, width - 60, 410], fill=(255, 255, 255, 40), width=1)
    
    img.save("playstore-feature-graphic.png", "PNG")
    print("Generated playstore-feature-graphic.png (1024x500)")

if __name__ == "__main__":
    create_feature_graphic()
