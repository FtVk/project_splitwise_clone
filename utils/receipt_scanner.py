import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
import os

# Set the Tesseract OCR command path
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def process_expense_receipt(image_path):
    """
    Processes a receipt image from the given path.

    Args:
        image (PIL.Image): The receipt image.

    Returns:
        dict: A dictionary containing the extracted receipt details.
    """
    
    if not image_path:
        return {"error": "No image provided for OCR processing."}
    
    try:
        # Process the image
        result = extract_receipt_details(image_path)
        if isinstance(result, dict) and "error" in result[0]:
            return result[0]  # Propagate OCR or extraction error
        
    except Exception as e:
        return f"Error processing the image: {str(e)}"
    finally:
        # Cleanup temporary file if created
        if image_path and os.path.exists(image_path) and not os.path.isabs(image_path):
            os.remove(image_path)

    return result

def extract_receipt_details(image_path):
    """
    Extracts food items, quantities, costs, and tax from a restaurant receipt.

    Args:
        image (PIL.Image): The receipt image.

    Returns:
        dict: A dictionary containing items, quantities, and costs, along with tax.

    Raises:
        ValueError: If OCR processing or data extraction fails.
    """
    if not image_path:
        return {"error": "No image provided for OCR processing."}

    try:
        # Preprocess the image
        image = preprocess_image(image_path)
        if isinstance(image, dict) and "error" in image:
            return image  # Propagate preprocessing error
        
        # Perform OCR
        try:
            text = pytesseract.image_to_string(image, lang='eng', config="--psm 6")
        except Exception as ocr_error:
            return {"error": f"OCR failed: {str(ocr_error)}"}
        
        # Normalize and split the text into lines
        lines = text.strip().split("\n")
        if not lines:
            return {"error": "No text found in the image after OCR."}

        items = []
        tax = None

        # Regular expressions for extracting data
        item_regex = re.compile(r"(\d+)\s*[×*]?\s*(.+?)\s*[@\$]?\s*(\d+\.\d{2})")
        tax_regex = re.compile(r"TAX[:\s]+([$]?)([\d.]+)", re.IGNORECASE)

        for line in lines:
            # Check for items
            item_match = item_regex.search(line)
            if item_match:
                try:
                    quantity = int(item_match.group(1))
                    name = item_match.group(2).strip()
                    cost = float(item_match.group(3))
                    items.append({"name": name, "quantity": quantity, "cost": cost})
                except (ValueError, IndexError):
                    return {"error": f"Failed to parse item data: '{line}'"}
            
            # Check for tax
            tax_match = tax_regex.search(line)
            if tax_match:
                try:
                    tax = {"amount": float(tax_match.group(2))}
                except ValueError:
                    return {"error": f"Failed to parse tax value from line: '{line}'"}

        return {
            "items": items,
            "tax": tax,
        }
    except Exception as e:
        return {"error": f"Unexpected error during receipt processing: {str(e)}"}



def preprocess_image(image_path):
    """
    Preprocess the image for better OCR accuracy.

    Args:
        image (PIL.Image): The image to preprocess.

    Returns:
        Image: The preprocessed PIL image.

    Raises:
        ValueError: If the input is not a valid PIL image.
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


def process_payment_receipt(image_path, name):
    """
    Extracts the total amount from an English receipt image and checks for a specific name.
    
    Args:
        image_path: The path to the image file. If None, a photo will be taken.
        name: The name to search for in the receipt text.
        
    Returns:
        tuple: A tuple containing the extracted amount (or an error message) and a boolean indicating if the name was found.
    """
    try:
        image = preprocess_image(image_path)
        
        # Perform OCR
        text = pytesseract.image_to_string(image, lang='eng', config="--psm 6")
        
        # Search for the amount near keywords
        amount_match = re.search(r"(Total|Amount|TOTAL|AMOUNT):?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)", text, re.IGNORECASE)
        amount = amount_match.group(2) if amount_match else "No amount found in the receipt text."
        
        # Check if the name is found in the text
        name_found = name.lower() in text.lower()
        
        if amount is None:
            return None, name_found

        return amount, name_found

    except Exception as e:
        return f"Error processing the image: {str(e)}", False
    finally:
        # Cleanup temporary file if created
        if image_path and os.path.exists(image_path) and not os.path.isabs(image_path):
            os.remove(image_path)
