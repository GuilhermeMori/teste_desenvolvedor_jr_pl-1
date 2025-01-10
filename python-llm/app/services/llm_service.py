import os
from langchain_openai import OpenAI


class LLMService:
    def __init__(self):
        # Configura o LLM usando a API do Hugging Face
        self.llm = OpenAI(
            temperature=0.5,
            top_p=0.7,
            api_key=os.getenv("HF_TOKEN"),  # type: ignore
            base_url="https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1",
        )

    def summarize_text(self, text: str, lang: str) -> str:
        """
        Gera um resumo do texto fornecido no idioma solicitado.

        Args:
            text (str): O texto original a ser resumido.
            lang (str): O idioma desejado para o resumo.

        Returns:
            str: O resumo gerado.
        """
        # Construção do prompt para resumo
        prompts_by_language = {
            "pt": f"Resuma o seguinte texto em português, sem usar palavras de outros idiomas:\n\n{text}",
            "en": f"Summarize the following text in English without using words from other languages:\n\n{text}",
            "es": f"Resume el siguiente texto en español, sin usar palabras de otros idiomas:\n\n{text}",
        }


        if lang not in prompts_by_language:
            raise ValueError(f"Unsupported language: {lang}")

        prompt = prompts_by_language[lang]

        # Invoca o LLM com o prompt gerado
        try:
            response = self.llm.invoke(prompt)
            return response.strip()  # Remove espaços desnecessários do resultado
        except Exception as e:
            raise RuntimeError(f"Error invoking LLM: {str(e)}")
