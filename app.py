from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import re
import pytesseract
from PIL import Image
import firebase_admin
from firebase_admin import db, credentials, firestore

#authenticate to firebase
cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


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
    #return correctText(text)

#{"CEMERLANG TERTINGGI": "A+", "CEMERLANG TINGGI": "A"}
def gradeDictionary():
    gradeData = db.collection('Grade').get()
    grade_dict = {}
    for grade in gradeData:
        grade_name = grade.get('GradeName')
        grade_value = grade.get('GradeValue')

        grade_dict[grade_name] = grade_value

    print(grade_dict)

    grade_custom_order = {'A+': 1, 'A': 2, 'A-': 3, 'B+': 4, 'B': 5, 'C+': 6, 'C': 7, 'D': 8, 'E': 9, 'G': 10, 'TH': 11}

    # Sort the dictionary based on the custom order
    sorted_grades = dict(sorted(grade_dict.items(), key=lambda item: grade_custom_order[item[1]]))
    print(sorted_grades)

#["1103", "1119", "BAHASA", "MELAYU"]
def commonWordsList():
    subjectData = db.collection('Subject').get()
    subject_list = []
    clean_subject_list = []
    for subject in subjectData:
        subject_code = subject.get('SubjectCode')
        subject_list.append(subject_code)
        subject_name = subject.get('SubjectName')
        subject_list.append(subject_name)

    print(subject_list)

    #modify the list and return the list with new element added at the back of the list
    for data in subject_list:
        if bool(re.search(r"\s", data)):
            data_words = data.split()
            clean_subject_list.extend(data_words)
        else:
           clean_subject_list.append(data) 
        
    print(clean_subject_list)

#["BAHASA MELAYU", "BAHASA INGGERIS"]
def pureSubjectList():
    subjectData = db.collection('Subject').get()
    pureSubjectList = []
    for pureSubject in subjectData:
        pure_subject_name = pureSubject.get('SubjectName')
        pureSubjectList.append(pure_subject_name)

    print(pureSubjectList)

#{"1103": "BAHASA MELAYU", "1119": "BAHASA INGGERIS"}
def subjectDictionary():
    subjectData = db.collection('Subject').get()
    subject_dict = {}
    for subject in subjectData:
        subject_code = subject.get('SubjectCode')
        subject_name = subject.get('SubjectName')

        subject_dict[subject_code] = subject_name
    
    print(subject_dict)

#{"BAHASA MELAYU": "BM", "BAHASA INGGERIS": "BI"}
def subjectAbbreviationDictionary(): 
    subjectData = db.collection('Subject').get()
    subjectAbbreviation_dict = {}
    for subjectAbbreviation in subjectData:
        subject_name  = subjectAbbreviation.get('SubjectName')
        subject_abbreviation = subjectAbbreviation.get('SubjectAbbreviation')

        subjectAbbreviation_dict[subject_name] = subject_abbreviation
    
    print(subjectAbbreviation_dict)

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