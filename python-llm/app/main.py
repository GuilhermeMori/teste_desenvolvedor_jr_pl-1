import sys
from dotenv import load_dotenv

load_dotenv()
sys.path = sys.path + ["./app"]

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()


class TextData(BaseModel):
    text: str
    lang: str


@app.post("/summarize")
async def summarize(data: TextData):
    text = data.text
    lang = data.lang

    # Idiomas suportados
    supported_languages = ["pt", "en", "es"]
    if lang not in supported_languages:
        raise HTTPException(status_code=400, detail="Language not supported")

    try:
        # Gerar o resumo com base no texto e idioma
        summary = llm_service.summarize_text(text, lang)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


@app.get("/")
async def root():
    return {"message": "API is running"}
