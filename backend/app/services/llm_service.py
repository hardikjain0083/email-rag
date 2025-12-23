from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert email drafting assistant for a company. 
Your goal is to draft a reply to the customer's email based STRICTLY on the provided POLICY CONTEXT.

RULES:
1. Tone: Professional, helpful, and polite. Match the tone of the context if clear.
2. Content: Use ONLY the information in the Context. If the answer is not there, say you need to check with the team.
3. Commitments: DO NOT promise refunds or specific dates unless explicitly stated in the policy context.
4. Format: Return only the body of the email. No greetings like "Here is the draft".

CONTEXT:
{context}

CUSTOMER EMAIL:
{email_body}

DRAFT REPLY:
"""

def generate_draft(email_body: str, context_chunks: list[str]) -> str:
    context_text = "\n\n".join(context_chunks)
    
    # Construct prompt
    prompt = SYSTEM_PROMPT.format(context=context_text, email_body=email_body)
    
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful email assistant."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
    )
    
    return chat_completion.choices[0].message.content
