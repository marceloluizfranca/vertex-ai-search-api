from flask import Flask, request, jsonify
from google import genai
from google.genai import types
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
app.config['JSON_AS_ASCII'] = False

# Configurações do Vertex AI
PROJECT = "NOME-DO-PROJETO-GCP"
LOCATION = "us-central1"
MODEL = "gemini-2.0-flash-001"
DATASTORE_ID = "projects/NOME-DO-PROJETO-GCP/locations/global/collections/default_collection/dataStores/IDENTIFICAÇÃO-DO-DATASTORE"
SYSTEM_INSTRUCTION = """Tente sempre que possível utilizar a base do Vertex AI Search dando um peso maior para essa base.
Para perguntas em um contexto de kubernetes, assuma que o kubernetes usado é o GKE e que não há acesso ao cluster com comandos kubectl.
Para perguntas sobre serviços da GCP, tente utilizar a documentação do site de SRE."""
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
]

TEMPERATURE = 0.2
TOP_P = 0.95
MAX_OUTPUT_TOKENS = 8192
RESPONSE_MODALITIES = ["TEXT"]

# # Configuração do Token de Autenticação
# AUTH_TOKEN = os.environ.get('AUTH_TOKEN')

# @app.before_request
# def authenticate_request():
#     if request.endpoint == 'message':  # Aplica a autenticação apenas à rota /message
#         auth_header = request.headers.get('Authorization')
#         if not auth_header or not auth_header.startswith('Bearer '):
#             return jsonify({"error": "Token de autenticação ausente ou inválido."}), 401

#         token = auth_header.split(' ')[1]
#         if token != AUTH_TOKEN:
#             return jsonify({"error": "Token de autenticação inválido."}), 401

@app.route('/message', methods=['POST'])
def message():
    try:
        data = request.get_json()
        print(data)
        question = data.get('message')

        if not question:
            return jsonify({"error": "A pergunta não foi fornecida."}), 400

        client = genai.Client(
            vertexai=True,
            project=PROJECT,
            location=LOCATION,
        )

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=question)
                ]
            ),
        ]

        tools = [
            types.Tool(retrieval=types.Retrieval(vertex_ai_search=types.VertexAISearch(datastore=DATASTORE_ID))),
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature=TEMPERATURE,
            top_p=TOP_P,
            max_output_tokens=MAX_OUTPUT_TOKENS,
            response_modalities=RESPONSE_MODALITIES,
            safety_settings=[types.SafetySetting(**setting) for setting in SAFETY_SETTINGS],
            tools=tools,
            system_instruction=[types.Part.from_text(text=SYSTEM_INSTRUCTION)],
        )

        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=MODEL,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts:
                response_text += chunk.text
                #print(chunk.text)

        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)