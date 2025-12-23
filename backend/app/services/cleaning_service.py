from bs4 import BeautifulSoup
import re

def clean_email_body(html_content: str) -> str:
    """
    Strips HTML, removes common signatures and quoted replies.
    """
    if not html_content:
        return ""
        
    soup = BeautifulSoup(html_content, "html.parser")
    text = soup.get_text(separator="\n")
    
    # Remove multiple newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Try to identify quoted text (On ... wrote: or >)
    # This is a naive implementation; production needs a robust parser
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        if line.strip().startswith('>'):
            continue
        if re.match(r'On .* wrote:', line):
            break # Assume everything after this is quoted
        if re.match(r'From: .*', line): # Forwarded/Reply headers
            break
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines).strip()
