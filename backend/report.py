import pymupdf


def extract_text_from_pdf(file_path):

    document = pymupdf.open(file_path)

    extracted_text = ""

    for page in document:
        extracted_text += page.get_text()

    document.close()

    if not extracted_text.strip():
        return None

    return extracted_text