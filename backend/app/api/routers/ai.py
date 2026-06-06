import json
import urllib.request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/ai", tags=["AI Tutor"])

API_KEY = "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"
API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None

@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    try:
        # Construct messages payload
        system_prompt = {
            "role": "system",
            "content": "You are Taxpilot AI Tutor, an expert Indian tax consultant and educator. You help students practice GST, TDS, and ITR filings. Be encouraging, concise, and provide structural validation advice when asked. Do not provide real legal or financial advice."
        }
        
        messages = [system_prompt]
        if request.context:
            messages.append({
                "role": "system",
                "content": f"Context of the student's current workspace: {request.context}"
            })
            
        # Append user messages
        messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

        payload = {
            "model": "meta/llama3-70b-instruct",
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1024
        }
        
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(API_URL, data=data, headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        })
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            
        ai_reply = result["choices"][0]["message"]["content"]
        
        return {"status": "success", "reply": ai_reply}
        
    except Exception as e:
        print(f"AI API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with AI Tutor")
