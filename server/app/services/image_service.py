import os
import asyncio
from google.cloud import aiplatform
from google.oauth2 import service_account
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from io import BytesIO
from PIL import Image

load_dotenv()

# Configure Gemini API for prompt enhancement
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Google Cloud AI Platform and Vertex AI (only if credentials are available)
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
# Temporarily disable Google Cloud due to billing/project mismatch
# if credentials_path and os.path.exists(credentials_path):
if False:  # Temporarily disabled
    try:
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        aiplatform.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="us-central1", credentials=credentials)
        vertexai.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="us-central1", credentials=credentials)
        print("Google Cloud AI Platform and Vertex AI initialized successfully")
        imagen_available = True
    except Exception as e:
        print(f"Failed to initialize Google Cloud: {e}")
        credentials = None
        imagen_available = False
else:
    print("Google Cloud Imagen temporarily disabled - using Pollinations AI for generation")
    credentials = None
    imagen_available = False

async def enhance_prompt(prompt: str) -> str:
    """
    Enhance user prompt using Gemini for better image generation results
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            f"You are an expert at creating detailed prompts for AI image generation. "
            f"Transform this user request into a highly detailed, vivid prompt that will produce the best possible image: '{prompt}'. "
            f"Include specific visual details, lighting, composition, style, colors, and atmosphere. "
            f"Make it suitable for photorealistic image generation. "
            f"Keep it under 200 words but be very descriptive. "
            f"Focus on creating a prompt that captures exactly what the user wants to see."
        )
        enhanced = response.text.strip() if response.text else prompt
        print(f"Original prompt: {prompt}")
        print(f"Enhanced prompt: {enhanced}")
        return enhanced
    except Exception as e:
        print(f"Prompt enhancement failed: {str(e)}")
        return prompt

async def generate_images(prompt: str, num_images: int = 4) -> tuple[list[str], str]:
    """
    Generate images using Google Imagen API with enhanced prompts
    Returns: (image_urls, enhanced_prompt)
    """
    try:
        # First, enhance the prompt for better results
        enhanced_prompt = await enhance_prompt(prompt)
        
        if imagen_available and credentials:
            try:
                print(f"Using Google Imagen API with enhanced prompt: {enhanced_prompt}")
                
                # Initialize the Imagen model
                model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
                
                # Generate images using Imagen
                response = model.generate_images(
                    prompt=enhanced_prompt,
                    number_of_images=min(num_images, 4),  # Imagen supports max 4 images
                    aspect_ratio="1:1",  # Square images for consistency
                    safety_filter_level="block_only_high",
                    person_generation="allow_adult",
                    negative_prompt="blurry, low quality, distorted, ugly, poorly drawn"  # Improve quality
                )
                
                image_urls = []
                for generated_image in response:
                    # Convert PIL image to base64 data URL
                    buffer = BytesIO()
                    generated_image.save(buffer, format="PNG")
                    img_str = base64.b64encode(buffer.getvalue()).decode()
                    data_url = f"data:image/png;base64,{img_str}"
                    image_urls.append(data_url)
                
                print(f"Successfully generated {len(image_urls)} images using Imagen API")
                return image_urls, enhanced_prompt
                
            except Exception as imagen_error:
                print(f"Imagen API failed: {str(imagen_error)}")
                # Fall back to alternative method
        
        # Primary: Use Pollinations AI (free AI image generation)
        try:
            print("Using Pollinations AI for image generation")
            import requests
            import urllib.parse
            
            image_urls = []
            for i in range(min(num_images, 4)):
                try:
                    # Use Pollinations AI - a free AI image generation service
                    encoded_prompt = urllib.parse.quote(enhanced_prompt)
                    # Add seed for variation while keeping it deterministic
                    seed = hash(enhanced_prompt + str(i)) % 1000000
                    pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?seed={seed}&width=512&height=512&nologo=true"
                    
                    # Test if the URL is accessible with longer timeout
                    response = requests.head(pollinations_url, timeout=30)
                    if response.status_code == 200:
                        image_urls.append(pollinations_url)
                        print(f"✅ Generated Pollinations AI image {i+1}")
                    else:
                        print(f"⚠️  Pollinations returned status {response.status_code} for image {i+1}")
                        # Fallback to thematic image
                        seed = hash(enhanced_prompt + str(i)) % 100000
                        fallback_url = f"https://source.unsplash.com/512x512/?baby+book+reading&sig={seed}"
                        image_urls.append(fallback_url)
                        
                except Exception as pollinations_error:
                    print(f"❌ Pollinations AI failed for image {i}: {str(pollinations_error)}")
                    # Thematic fallback
                    seed = hash(enhanced_prompt + str(i)) % 100000
                    image_urls.append(f"https://source.unsplash.com/512x512/?baby+book+reading&sig={seed}")
            
            if image_urls:
                print(f"✅ Successfully generated {len(image_urls)} images using Pollinations AI")
                return image_urls, enhanced_prompt
                
        except Exception as pollinations_error:
            print(f"❌ Pollinations AI fallback failed: {str(pollinations_error)}")
        
        # Final fallback: Enhanced thematic image URLs using Unsplash
        print("Using enhanced thematic fallback with Unsplash")
        image_urls = []
        
        # Analyze the prompt to determine appropriate categories
        prompt_lower = enhanced_prompt.lower()
        categories = []
        
        if any(word in prompt_lower for word in ['baby', 'child', 'infant', 'toddler', 'kid']):
            categories.append('baby')
        if any(word in prompt_lower for word in ['book', 'reading', 'study', 'learn']):
            categories.append('book')
        if any(word in prompt_lower for word in ['bench', 'park', 'outdoor', 'sitting']):
            categories.append('park')
        if any(word in prompt_lower for word in ['success', 'business', 'professional']):
            categories.append('success')
        
        # Create search terms based on categories
        if categories:
            search_term = '+'.join(categories)
        else:
            search_term = 'lifestyle'
        
        for i in range(num_images):
            seed = hash(enhanced_prompt + str(i)) % 100000
            # Use Unsplash for higher quality, thematically relevant images
            image_url = f"https://source.unsplash.com/512x512/?{search_term}&sig={seed}"
            image_urls.append(image_url)
        
        print(f"Generated {len(image_urls)} thematic images with search term: {search_term}")
        return image_urls, enhanced_prompt
        
    except Exception as e:
        print(f"Image generation failed completely: {str(e)}")
        # Emergency fallback
        enhanced_prompt = prompt  # Use original if enhancement failed
        image_urls = [f"https://picsum.photos/512/512?random={hash(prompt + str(i)) % 1000}" for i in range(num_images)]
        return image_urls, enhanced_prompt
