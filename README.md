# Pin2Wear — Virtual Try-On

A web app that lets users upload a photo and see how a selected garment 
looks on them, powered by CatVTON via Hugging Face Spaces.

## How it works
- Frontend: HTML/CSS/JS (no framework)
- Backend: Flask server that calls the CatVTON Gradio Space via `gradio_client`
- Since virtual try-on requires GPU inference, the backend runs on 
  Google Colab (free GPU) and is exposed publicly via ngrok during 
  active sessions — this repo is not continuously deployed.

## Running it yourself
1. Open `backend/colab_server.ipynb` in Google Colab
2. Add your own Hugging Face token and ngrok authtoken
3. Run all cells — this starts the Flask server and prints a public ngrok URL
4. Copy that URL into `API_URL` in `frontend/tryon.html`
5. Open `frontend/index.html` locally (or serve with Live Server) to use the app

## Notes
- CatVTON's public Space has variable reliability (~24-90% success rate 
  depending on endpoint); retry logic is recommended for production use
- Not deployed 24/7 due to GPU cost — demo requires an active Colab session