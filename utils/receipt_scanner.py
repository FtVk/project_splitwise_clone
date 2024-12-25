import cv2
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
import tempfile
import os

# Set the Tesseract command path if needed
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(image_path):
    """
    Preprocess the image for better OCR accuracy.

    Args:
        image_path (str): The path to the image file.

    Returns:
        Image: The preprocessed PIL image.
    """
    image = Image.open(image_path)
    # Convert to grayscale
    image = image.convert("L")
    # Apply a sharpen filter
    image = image.filter(ImageFilter.SHARPEN)
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)
    return image

def capture_image():
    """
    Captures an image using the webcam and saves it to a temporary file.

    Returns:
        str: The path to the saved image.
    """
    print("Press 's' to save the image or 'q' to quit without saving.")
    cap = cv2.VideoCapture(0)  # Open the webcam
    temp_path = None

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture image. Exiting.")
            break

        cv2.imshow("Capture Image", frame)
        key = cv2.waitKey(1)

        # Save the image if 's' is pressed
        if key == ord('s'):
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
                temp_path = temp_file.name
                cv2.imwrite(temp_path, frame)
                print(f"Image saved to {temp_path}")
            break

        # Exit without saving if 'q' is pressed
        if key == ord('q'):
            print("Exiting without saving.")
            break

    cap.release()
    cv2.destroyAllWindows()
    return temp_path

def extract_amount(image_path=None):
    """
    Extracts the total amount from an English receipt image or a captured photo.

    Args:
        image_path (str, optional): The path to the image file. If None, a photo will be taken.

    Returns:
        str: The extracted amount or an error message.
    """
    try:
        # Capture an image if no file is provided
        if image_path is None:
            image_path = capture_image()
            if image_path is None:
                return "No image was captured."

        # Preprocess the image
        image = preprocess_image(image_path)
        
        # Perform OCR
        text = pytesseract.image_to_string(image, lang='eng', config="--psm 6")
        
        # Search for the amount near keywords
        amount_match = re.search(r"(Total|Amount|TOTAL|AMOUNT):?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)", text, re.IGNORECASE)
        if amount_match:
            return f"Extracted Amount: {amount_match.group(2)}"
        else:
            return "No amount found in the receipt text."
    except Exception as e:
        return f"Error processing the image: {str(e)}"

    finally:
        # Cleanup temporary file if created
        if image_path and os.path.exists(image_path) and not os.path.isabs(image_path):
            os.remove(image_path)

if __name__ == "__main__":
    # Provide an image path or pass None to capture a photo
    result = extract_amount(None)  # Pass an image path here if available
    print(result)
