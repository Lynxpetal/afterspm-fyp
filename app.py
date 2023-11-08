from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pytesseract
from PIL import Image

app = Flask(__name__)
CORS(app, supports_credentials=True)

#image folder 
imageUploadPath = os.path.join(os.getcwd(), 'uploadImageFolder')
app.config['UPLOAD_IMAGE_FOLDER'] = imageUploadPath

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

def readImage(filename):
    myconfig = r"--psm 4 --oem 3"
    uploadImage = Image.open(f'{imageUploadPath}/{filename}')
    text = pytesseract.image_to_string(uploadImage, config=myconfig)
    print(text)
    return text

@app.route("/uploadResult", methods=['POST'])
def uploadResult():
    try:
        if 'file' not in request.files:
            print("No file part.")
            return jsonify({'message': 'No file part'})

        inputFile = request.files['file']
        
        if inputFile.filename == "":
            return jsonify({"message": "No selected file"})
        
        if inputFile:
            #return a secure version
            filename = secure_filename(inputFile.filename)
            #place the image under the specified folder
            uploaded_file_path = os.path.join(app.config['UPLOAD_IMAGE_FOLDER'], filename)
            inputFile.save(uploaded_file_path)
            readResults = readImage(filename)
            #remove it so the app wont explode
            os.remove(uploaded_file_path)
            return jsonify(readResults)
        
    except Exception as e:
        print("Error processing request:", str(e))
        return jsonify({"message": "Error processing request"})

 
if __name__ == '__main__':
    app.run(debug=True)