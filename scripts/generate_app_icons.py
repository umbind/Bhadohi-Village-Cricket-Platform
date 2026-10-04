import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_cricket_icon(size=1024, is_round=False):
    # Create canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2

    # 1. Base Mask (Square with rounded corners OR Circle)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    if is_round:
        mask_draw.ellipse([24, 24, size - 24, size - 24], fill=255)
    else:
        # Beautiful Android squircle (round rect)
        mask_draw.rounded_rectangle([20, 20, size - 20, size - 20], radius=220, fill=255)

    # 2. Background gradient: Deep Forest Green #123B2A to #1E7A4C
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)

    # Draw radial/conical lush grass gradient
    max_r = int(math.hypot(cx, cy))
    for r in range(max_r, 0, -4):
        t = r / float(max_r)
        # Center: #238C57 (35, 140, 87) -> Outer: #0C281C (12, 40, 28)
        cr = int(35 * (1 - t) + 12 * t)
        cg = int(140 * (1 - t) + 40 * t)
        cb = int(87 * (1 - t) + 28 * t)
        bg_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(cr, cg, cb, 255))

    # Add stadium boundary pitch rings
    ring_color = (255, 255, 255, 18)
    bg_draw.ellipse([cx - 420, cy - 420, cx + 420, cy + 420], outline=ring_color, width=4)
    bg_draw.ellipse([cx - 360, cy - 360, cx + 360, cy + 360], outline=ring_color, width=3)
    bg_draw.ellipse([cx - 280, cy - 280, cx + 280, cy + 280], outline=ring_color, width=2)

    # Golden outer shield accent ring
    gold_border = (244, 185, 66, 230)
    gold_glow = (244, 185, 66, 60)
    if is_round:
        bg_draw.ellipse([28, 28, size - 28, size - 28], outline=gold_glow, width=16)
        bg_draw.ellipse([34, 34, size - 34, size - 34], outline=gold_border, width=8)
    else:
        bg_draw.rounded_rectangle([24, 24, size - 24, size - 24], radius=216, outline=gold_glow, width=16)
        bg_draw.rounded_rectangle([30, 30, size - 30, size - 30], radius=210, outline=gold_border, width=8)

    # 3. Wickets & Bails (Stumps) in the upper background
    stump_color = (212, 160, 48, 255)
    stump_highlight = (247, 220, 111, 255)
    stump_shadow = (140, 95, 20, 255)
    stump_w = 22
    stump_top = 220
    stump_bot = 620

    stump_xs = [cx - 70, cx, cx + 70]
    for sx in stump_xs:
        # Stump shadow
        bg_draw.rounded_rectangle([sx - stump_w//2 - 2, stump_top, sx + stump_w//2 + 2, stump_bot], radius=10, fill=stump_shadow)
        # Stump body
        bg_draw.rounded_rectangle([sx - stump_w//2, stump_top, sx + stump_w//2, stump_bot], radius=8, fill=stump_color)
        # Highlight streak
        bg_draw.line([sx - 3, stump_top + 10, sx - 3, stump_bot - 10], fill=stump_highlight, width=4)

    # Two Bails resting on top
    bg_draw.rounded_rectangle([cx - 86, stump_top - 18, cx - 4, stump_top - 4], radius=6, fill=stump_color)
    bg_draw.rounded_rectangle([cx + 4, stump_top - 18, cx + 86, stump_top - 4], radius=6, fill=stump_color)
    bg_draw.line([cx - 80, stump_top - 12, cx + 80, stump_top - 12], fill=stump_highlight, width=3)

    # 4. Crossed Cricket Bats
    bat_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bat_draw = ImageDraw.Draw(bat_img)

    def draw_bat(angle_deg):
        # Create single vertical bat pointing up, then rotate
        single_bat = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(single_bat)

        bx = size // 2
        # Handle (rubber grip with ridges)
        sdraw.rounded_rectangle([bx - 12, 180, bx + 12, 380], radius=8, fill=(244, 185, 66, 255))
        # Handle wraps
        for gy in range(200, 360, 24):
            sdraw.line([bx - 11, gy, bx + 11, gy], fill=(30, 90, 60, 255), width=8)

        # Handle top knob
        sdraw.ellipse([bx - 16, 166, bx + 16, 194], fill=(244, 185, 66, 255))

        # Bat Blade (wooden willow)
        blade_pts = [
            (bx - 18, 380),
            (bx - 36, 420),
            (bx - 42, 780),
            (bx + 42, 780),
            (bx + 36, 420),
            (bx + 18, 380)
        ]
        sdraw.polygon(blade_pts, fill=(235, 195, 115, 255))
        # Bat spine highlight
        sdraw.line([bx, 410, bx, 760], fill=(255, 230, 160, 255), width=10)
        # Bat side edge shadow
        sdraw.line([bx - 38, 430, bx - 38, 770], fill=(180, 140, 70, 255), width=6)
        sdraw.line([bx + 38, 430, bx + 38, 770], fill=(160, 120, 50, 255), width=6)
        # Bat toe curved
        sdraw.chord([bx - 42, 760, bx + 42, 800], start=0, end=180, fill=(160, 120, 50, 255))

        # Rotate around center
        rotated = single_bat.rotate(angle_deg, resample=Image.Resampling.BICUBIC, center=(cx, cy))
        return rotated

    bat1 = draw_bat(-38)
    bat2 = draw_bat(38)

    # Bat drop shadows
    bat_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bat_shadow.paste(bat1, (0, 0), bat1)
    bat_shadow.paste(bat2, (0, 0), bat2)
    shadow_mask = bat_shadow.split()[3].point(lambda a: 120 if a > 0 else 0)
    shadow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 100))
    shadow_layer.putalpha(shadow_mask)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))

    bg.paste(shadow_layer, (6, 12), shadow_layer)
    bg.paste(bat1, (0, 0), bat1)
    bg.paste(bat2, (0, 0), bat2)

    # 5. Foreground Realistic 3D Cricket Ball (with spherical shading & stitched seam)
    ball_r = 160
    ball_cx = cx
    ball_cy = cy + 90

    # Spherical lighting for true 3D look
    ball_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(ball_img)

    # Light direction: from top-left-front
    lx, ly, lz = -0.45, -0.55, 0.70
    mag = math.sqrt(lx*lx + ly*ly + lz*lz)
    lx, ly, lz = lx/mag, ly/mag, lz/mag

    # Ball shadow on background
    ball_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bs_draw = ImageDraw.Draw(ball_shadow)
    bs_draw.ellipse([ball_cx - ball_r - 20, ball_cy - ball_r + 20, ball_cx + ball_r + 20, ball_cy + ball_r + 40], fill=(0, 0, 0, 140))
    ball_shadow = ball_shadow.filter(ImageFilter.GaussianBlur(24))
    bg.paste(ball_shadow, (0, 0), ball_shadow)

    # Render 3D shaded ball pixels
    for y in range(ball_cy - ball_r, ball_cy + ball_r + 1):
        dy = y - ball_cy
        for x in range(ball_cx - ball_r, ball_cx + ball_r + 1):
            dx = x - ball_cx
            dist_sq = dx*dx + dy*dy
            if dist_sq <= ball_r*ball_r:
                dz = math.sqrt(max(0, ball_r*ball_r - dist_sq))
                # Normal vector
                nx, ny, nz = dx / ball_r, dy / ball_r, dz / ball_r

                # Diffuse dot product
                dot = max(0.0, nx*lx + ny*ly + nz*lz)
                # Specular highlight
                # Reflection vector: R = 2*(N.L)*N - L
                rx = 2 * dot * nx - lx
                ry = 2 * dot * ny - ly
                rz = 2 * dot * nz - lz
                spec = max(0.0, rz) ** 14

                # Base crimson red: #D32F2F (211, 47, 47) -> dark shadow: #5F0E0E (95, 14, 14)
                ambient = 0.22
                light = min(1.0, ambient + dot * 0.78)

                red = int(min(255, (220 * light) + (255 * spec * 0.9)))
                green = int(min(255, (38 * light) + (200 * spec * 0.85)))
                blue = int(min(255, (38 * light) + (200 * spec * 0.85)))

                bdraw.point((x, y), fill=(red, green, blue, 255))

    # White Curved Seam with stitches
    seam_pts = []
    stitch_pts = []
    # Parametric curve across the sphere surface
    for step in range(-80, 81):
        t = step / 80.0
        # Curve across the 3D sphere
        sx = ball_cx + t * (ball_r * 0.94)
        # S-curve / arc for seam
        sy = ball_cy - (t * 0.6) * (ball_r * 0.6) + (1 - t*t) * 28

        dx = sx - ball_cx
        dy = sy - ball_cy
        if dx*dx + dy*dy <= (ball_r - 2)*(ball_r - 2):
            seam_pts.append((sx, sy))

            # Add stitch tick marks perpendicular to curve
            if step % 4 == 0:
                nx = -0.5
                ny = 0.85
                stitch_pts.append((sx - nx * 10, sy - ny * 10, sx + nx * 10, sy + ny * 10))

    # Draw seam shadow and center line
    for i in range(len(seam_pts) - 1):
        bdraw.line([seam_pts[i], seam_pts[i+1]], fill=(120, 20, 20, 255), width=10)
    for i in range(len(seam_pts) - 1):
        bdraw.line([seam_pts[i], seam_pts[i+1]], fill=(255, 255, 255, 240), width=5)

    # Draw cross stitches
    for x1, y1, x2, y2 in stitch_pts:
        bdraw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 235), width=3)

    bg.paste(ball_img, (0, 0), ball_img)

    # 6. Golden Crown / Star at Top Center
    def draw_star(sx, sy, r1, r2, fill_col):
        pts = []
        for i in range(10):
            ang = -math.pi / 2 + (i * math.pi / 5)
            r = r1 if i % 2 == 0 else r2
            pts.append((sx + r * math.cos(ang), sy + r * math.sin(ang)))
        bg_draw.polygon(pts, fill=fill_col)

    draw_star(cx, 130, 42, 18, (244, 185, 66, 255))
    draw_star(cx - 80, 142, 26, 11, (244, 185, 66, 220))
    draw_star(cx + 80, 142, 26, 11, (244, 185, 66, 220))

    # Golden ribbon text banner at bottom "भदोही • BVCP"
    ribbon_w = 420
    ribbon_h = 70
    rx1, ry1 = cx - ribbon_w//2, cy + 330
    rx2, ry2 = cx + ribbon_w//2, ry1 + ribbon_h

    # Ribbon background with golden gradient
    bg_draw.rounded_rectangle([rx1 - 4, ry1 - 4, rx2 + 4, ry2 + 4], radius=24, fill=(15, 55, 35, 230))
    bg_draw.rounded_rectangle([rx1, ry1, rx2, ry2], radius=20, fill=(244, 185, 66, 255), outline=(255, 235, 140, 255), width=4)

    # Ribbon decorative cricket icons or text
    # Draw mini crossed bats and text on ribbon
    bg_draw.ellipse([cx - 16, ry1 + ribbon_h//2 - 16, cx + 16, ry1 + ribbon_h//2 + 16], fill=(18, 59, 42, 255))
    bg_draw.ellipse([cx - 6, ry1 + ribbon_h//2 - 6, cx + 6, ry1 + ribbon_h//2 + 6], fill=(244, 185, 66, 255))

    # Wings / laurels on sides of ribbon
    bg_draw.line([rx1 + 30, ry1 + ribbon_h//2, cx - 40, ry1 + ribbon_h//2], fill=(18, 59, 42, 255), width=6)
    bg_draw.line([cx + 40, ry1 + ribbon_h//2, rx2 - 30, ry1 + ribbon_h//2], fill=(18, 59, 42, 255), width=6)

    # Apply the mask
    final = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final.paste(bg, (0, 0), mask)

    return final

def main():
    print("Generating high-resolution master cricket icons...")
    master_square = create_cricket_icon(1024, is_round=False)
    master_round = create_cricket_icon(1024, is_round=True)

    # Base project directory
    base_res = os.path.join("apps", "android", "app", "src", "main", "res")

    targets = [
        ("mipmap-mdpi", 48),
        ("mipmap-hdpi", 72),
        ("mipmap-xhdpi", 96),
        ("mipmap-xxhdpi", 144),
        ("mipmap-xxxhdpi", 192),
    ]

    for folder, px in targets:
        dir_path = os.path.join(base_res, folder)
        os.makedirs(dir_path, exist_ok=True)

        # Standard launcher icon
        sq_icon = master_square.resize((px, px), resample=Image.Resampling.LANCZOS)
        sq_path = os.path.join(dir_path, "ic_launcher.png")
        sq_icon.save(sq_path, "PNG")

        # Round launcher icon
        rd_icon = master_round.resize((px, px), resample=Image.Resampling.LANCZOS)
        rd_path = os.path.join(dir_path, "ic_launcher_round.png")
        rd_icon.save(rd_path, "PNG")

        print(f"Generated {folder}: {px}x{px} (square & round)")

    # Save 512x512 Google Play / High-res store icons
    store_512 = master_square.resize((512, 512), resample=Image.Resampling.LANCZOS)
    store_512.save("app-icon.png", "PNG")
    store_512.save(os.path.join(base_res, "drawable", "app_icon_512.png"), "PNG")

    round_512 = master_round.resize((512, 512), resample=Image.Resampling.LANCZOS)
    round_512.save("app-icon-round.png", "PNG")
    print("Saved 512x512 master app-icon.png and app-icon-round.png")

if __name__ == "__main__":
    main()
