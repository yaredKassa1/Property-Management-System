"""
Logo Background Removal Script
Automatically removes white background from Woldia University logo
"""

try:
    from rembg import remove
    from PIL import Image
    import os
    
    print("🔄 Starting background removal...")
    
    # Paths
    input_path = 'Frontend/public/woldia-logo.jpg'
    output_path = 'Frontend/public/woldia-logo.png'
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"❌ Error: Logo file not found at {input_path}")
        print("   Please make sure the logo file exists in Frontend/public/")
        exit(1)
    
    # Open image
    print(f"📂 Reading logo from: {input_path}")
    input_image = Image.open(input_path)
    
    # Remove background
    print("🎨 Removing background... (this may take a few seconds)")
    output_image = remove(input_image)
    
    # Save as PNG
    output_image.save(output_path)
    
    print(f"✅ Success! Transparent logo saved to: {output_path}")
    print(f"📊 File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    print("\n🔄 Next steps:")
    print("   1. Refresh your browser (Ctrl+F5)")
    print("   2. The logo should now blend with the blue background")
    
except ImportError:
    print("❌ Required libraries not installed!")
    print("\n📦 Please install required packages:")
    print("   pip install rembg pillow")
    print("\nOr use one of the online tools mentioned in LOGO_BACKGROUND_REMOVAL_GUIDE.md")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\n💡 Try using one of the online tools instead:")
    print("   - https://www.remove.bg/")
    print("   - https://www.photopea.com/")
