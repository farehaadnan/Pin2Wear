from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client, handle_file
from PIL import Image
import tempfile, os, base64, traceback

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.environ.get("HF_TOKEN")
hf_client = Client("zhengchong/CatVTON", token=HF_TOKEN)

@app.route('/tryon', methods=['POST'])
def tryon():
    try:
        person_file = request.files['person']
        garment_file = request.files['garment']

        person_img = Image.open(person_file.stream).convert('RGB')
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as p:
            person_path = p.name
            person_img.save(person_path, 'PNG')

        garment_img = Image.open(garment_file.stream).convert('RGB')
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as g:
            garment_path = g.name
            garment_img.save(garment_path, 'JPEG')

        result = hf_client.predict(
            person_image={
                "background": handle_file(person_path),
                "layers": [],
                "composite": handle_file(person_path),
                "id": None
            },
            cloth_image=handle_file(garment_path),
            num_inference_steps=20,
            guidance_scale=2.5,
            seed=42,
            api_name="/submit_function_p2p"
        )

        os.unlink(person_path)
        os.unlink(garment_path)

        result_path = result["path"] if isinstance(result, dict) else result

        with open(result_path, 'rb') as f:
            result_b64 = base64.b64encode(f.read()).decode()

        return jsonify({
            'success': True,
            'result_image': f'data:image/webp;base64,{result_b64}'
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)