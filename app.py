import os
import subprocess
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {'webm', 'mp4', 'avi', 'mov'}

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_webm_to_mp4(input_path, output_path):
    try:
        print(f"[DEBUG] Converting {input_path} to {output_path}...")
        result = subprocess.run([
            'ffmpeg', '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            '-y',
            output_path
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"[DEBUG] Conversion successful!")
            return True
        else:
            print(f"[ERROR] FFmpeg conversion failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"[ERROR] Conversion exception: {str(e)}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send-alert', methods=['POST'])
def send_alert():
    try:
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        video_file = request.files.get('video')
        
        print(f"[DEBUG] Received alert request - Lat: {latitude}, Lon: {longitude}, Video: {video_file.filename if video_file else 'None'}")
        
        if not latitude or not longitude:
            return jsonify({'success': False, 'error': 'Location data missing'}), 400
        
        if not video_file:
            return jsonify({'success': False, 'error': 'Video file missing'}), 400
        
        if not allowed_file(video_file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename_webm = secure_filename(f'emergency_{timestamp}.webm')
        filepath_webm = os.path.join(app.config['UPLOAD_FOLDER'], filename_webm)
        video_file.save(filepath_webm)
        print(f"[DEBUG] Video saved to: {filepath_webm}")
        
        filename_mp4 = secure_filename(f'emergency_{timestamp}.mp4')
        filepath_mp4 = os.path.join(app.config['UPLOAD_FOLDER'], filename_mp4)
        
        if not convert_webm_to_mp4(filepath_webm, filepath_mp4):
            return jsonify({
                'success': False,
                'error': 'Failed to convert video to MP4 format'
            }), 500
        
        whatsapp_phone_number_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID')
        whatsapp_access_token = os.environ.get('WHATSAPP_ACCESS_TOKEN')
        whatsapp_recipient = os.environ.get('WHATSAPP_RECIPIENT_NUMBER')
        
        if not whatsapp_phone_number_id or not whatsapp_access_token or not whatsapp_recipient:
            return jsonify({
                'success': False, 
                'error': 'WhatsApp credentials not configured. Please set up your WhatsApp Cloud API credentials.'
            }), 500
        
        print(f"[DEBUG] Using WhatsApp Phone Number ID: {whatsapp_phone_number_id[:10]}...")
        
        location_message = f"🚨 I am in danger, please help me! My location is [{latitude}, {longitude}].\n\nGoogle Maps: https://www.google.com/maps?q={latitude},{longitude}"
        
        message_url = f"https://graph.facebook.com/v18.0/{whatsapp_phone_number_id}/messages"
        headers = {
            'Authorization': f'Bearer {whatsapp_access_token}',
            'Content-Type': 'application/json'
        }
        
        message_data = {
            'messaging_product': 'whatsapp',
            'to': whatsapp_recipient,
            'type': 'text',
            'text': {'body': location_message}
        }
        
        print(f"[DEBUG] Sending text message to {whatsapp_recipient}...")
        response = requests.post(message_url, json=message_data, headers=headers)
        print(f"[DEBUG] Text message response: Status {response.status_code}, Body: {response.text}")
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Failed to send WhatsApp message: {response.text}'
            }), 500
        
        upload_url = f"https://graph.facebook.com/v18.0/{whatsapp_phone_number_id}/media"
        
        print(f"[DEBUG] Uploading video to WhatsApp...")
        with open(filepath_mp4, 'rb') as video:
            files = {
                'file': (filename_mp4, video, 'video/mp4'),
                'messaging_product': (None, 'whatsapp'),
                'type': (None, 'video/mp4')
            }
            headers_upload = {
                'Authorization': f'Bearer {whatsapp_access_token}'
            }
            
            upload_response = requests.post(upload_url, files=files, headers=headers_upload)
        
        print(f"[DEBUG] Video upload response: Status {upload_response.status_code}, Body: {upload_response.text}")
        
        if upload_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Failed to upload video: {upload_response.text}'
            }), 500
        
        media_id = upload_response.json().get('id')
        print(f"[DEBUG] Media ID: {media_id}")
        
        video_message_data = {
            'messaging_product': 'whatsapp',
            'to': whatsapp_recipient,
            'type': 'video',
            'video': {
                'id': media_id,
                'caption': 'Emergency video recording'
            }
        }
        
        print(f"[DEBUG] Sending video message...")
        video_response = requests.post(message_url, json=video_message_data, headers=headers)
        print(f"[DEBUG] Video message response: Status {video_response.status_code}, Body: {video_response.text}")
        
        if video_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Failed to send video message: {video_response.text}'
            }), 500
        
        try:
            os.remove(filepath_webm)
            os.remove(filepath_mp4)
        except:
            pass
        
        print("[DEBUG] Emergency alert sent successfully!")
        return jsonify({
            'success': True,
            'message': 'Emergency alert sent successfully!'
        })
        
    except Exception as e:
        print(f"[ERROR] Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
