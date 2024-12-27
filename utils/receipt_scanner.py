import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
import cv2  # OpenCV for camera functionality
import os

# Set the Tesseract OCR command path
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

def extract_receipt_details(image_path):
    """
    Extracts food items, quantities, costs, and tax from a restaurant receipt.

    Args:
        image_path (str): The path to the receipt image.

    Returns:
        dict: A dictionary containing items, quantities, and costs, along with tax.
    """
    try:
        # Preprocess the image
        image = preprocess_image(image_path)
        # Perform OCR
        text = pytesseract.image_to_string(image, lang='eng', config="--psm 6")
        
        # Normalize and split the text into lines
        lines = text.strip().split("\n")
        
        items = []
        tax = None

        # Regular expressions for extracting data
        item_regex = re.compile(r"(\d+)\s*[×*]?\s*(.+?)\s*[@\$]?\s*(\d+\.\d{2})")
        tax_regex = re.compile(r"TAX[:\s]+([$]?)([\d.]+)", re.IGNORECASE)

        for line in lines:
            # Check for items
            item_match = item_regex.search(line)
            if item_match:
                quantity = int(item_match.group(1))
                name = item_match.group(2).strip()
                cost = float(item_match.group(3))
                items.append({"name": name, "quantity": quantity, "cost": cost})
            
            # Check for tax
            tax_match = tax_regex.search(line)
            if tax_match:
                tax = {"amount": float(tax_match.group(2))}

        return {
            "items": items,
            "tax": tax,
        }
    except Exception as e:
        return {"error": str(e)}

def process_expense_receipt(image_path=None):
    """
    Processes a receipt image from the given path or captures one using the camera.

    Args:
        image_path (str): Optional. The path to the receipt image. If None, opens the camera.

    Returns:
        dict: A dictionary containing the extracted receipt details.
    """
    if image_path is None:
        print("No image path provided. Opening camera...")
        # Use OpenCV to open the camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise Exception("Could not open camera")

        print("Press 'Space' to take a picture, or 'Esc' to exit.")
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture frame. Exiting...")
                break
            
            cv2.imshow("Camera", frame)
            key = cv2.waitKey(1)
            if key == 32:  # Space key to take a picture
                image_path = "captured_receipt.jpg"
                cv2.imwrite(image_path, frame)
                print(f"Image saved as {image_path}")
                break
            elif key == 27:  # Esc key to exit
                print("Exiting without capturing.")
                cap.release()
                cv2.destroyAllWindows()
                return None
        
        cap.release()
        cv2.destroyAllWindows()

    # Process the image
    if image_path:
        return extract_receipt_details(image_path)

def extract_payment_amount(image_path=None):
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
            return amount_match.group(2)
        else:
            return "No amount found in the receipt text."
    except Exception as e:
        return f"Error processing the image: {str(e)}"
    finally:
        # Cleanup temporary file if created
        if image_path and os.path.exists(image_path) and not os.path.isabs(image_path):
            os.remove(image_path)
