from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import re
import difflib
import pytesseract
from PIL import Image
import firebase_admin
from firebase_admin import db, credentials, firestore

#authenticate to firebase
cred = credentials.Certificate("credentials1.json")
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
    return correctText(text)

def correctText(text):
    common_words = []
    common_words = commonWordsList()
    corrected_input = correct_input(text, common_words)
    print(corrected_input)
    subject_grade_dict = {}

    #get its key value: CEMERLANG TERTINGGI, CEMERLANG TINGGI, ...
    grade_keys_without_values = list(gradeDictionary().keys())
    grade_formatted_string = "|".join(grade_keys_without_values)

    #Output: CEMERLANG TERTINGGI|CEMERLANG TINGGI|CEMERLANG|....|TIDAK HADIR
    print(grade_formatted_string)
    print(list(subjectDictionary().keys()))
    #Iterate over the list of subjects
    for subject in pureSubjectList():
        #if OCR capture subject name (eg "BAHASA MELAYU") or subject code (eg "1103")
        if subject in corrected_input or any(key in corrected_input and value == subject for key, value in subjectDictionary().items()):
            #Find the grade for the subject
            grade = re.search(grade_formatted_string, corrected_input).group()
            #Print the grade for the subject
            #{"BM": "A+"}
            subject_grade_dict[subjectAbbreviationDictionary()[subject]] = gradeDictionary()[grade]

    print(subject_grade_dict)
    return subject_grade_dict

#Calculate the similarity score by comparing two words
def compare_words(word1, word2):
  # Calculate the similarity score between the two words using the difflib.SequenceMatcher() function
  similarity_score = difflib.SequenceMatcher(None, word1, word2).ratio()
  
  # Return the similarity score
  return similarity_score

#Correct input 
def correct_input(user_input, common_words):
    # Split the OCR-captured text by lines
    lines = user_input.split("\n")

    # For each line, split by the words by spaces
    corrected_lines = []
    for line in lines:
        words = line.split(" ")

        # For each word, compare it with each common word in the list
        corrected_words = []
        for word in words:

            # Calculate the similarity score between the word and each common word
            similarity_score = 0
            common_word = None
            for common_word in common_words:
                similarity_score = compare_words(word, common_word)
                
                # If the similarity score is greater than 0.8, then the word is considered to be correct.
                if similarity_score > 0.8:
                    corrected_words.append(common_word)
        
        # Add the corrected words to the corrected_lines list
        corrected_lines.append(" ".join(corrected_words))
    
    # Return the corrected_lines list
    return "\n".join(corrected_lines)

#{"CEMERLANG TERTINGGI": "A+", "CEMERLANG TINGGI": "A"}
def gradeDictionary():
    gradeData = db.collection('Grade').get()
    grade_dict = {}
    for grade in gradeData:
        grade_name = grade.get('GradeName')
        grade_value = grade.get('GradeValue')

        grade_dict[grade_name] = grade_value

    grade_custom_order = {'A+': 1, 'A': 2, 'A-': 3, 'B+': 4, 'B': 5, 'C+': 6, 'C': 7, 'D': 8, 'E': 9, 'G': 10, 'TH': 11}

    # Sort the dictionary based on the custom order
    sorted_grades = dict(sorted(grade_dict.items(), key=lambda item: grade_custom_order[item[1]]))

    return sorted_grades

#["1103", "1119", "BAHASA", "MELAYU", "A+", "CEMERLANG", "TERTINGGI"]
def commonWordsList():
    subjectData = db.collection('Subject').get()
    common_words_list = []
    clean_common_words_list = []
    for subject in subjectData:
        subject_code = subject.get('SubjectCode')
        common_words_list.append(subject_code)
        subject_name = subject.get('SubjectName')
        common_words_list.append(subject_name)

    gradeData = db.collection('Grade').get()
    for grade in gradeData:
        grade_name = grade.get('GradeName')
        common_words_list.append(grade_name)
        grade_value = grade.get('GradeValue')
        common_words_list.append(grade_value)

    #modify the list and return the list with new element added at the back of the list
    for data in common_words_list:
        if bool(re.search(r"\s", data)):
            data_words = data.split()
            clean_common_words_list.extend(data_words)
        else:
           clean_common_words_list.append(data) 
 
        
    return list(set(clean_common_words_list))

#["BAHASA MELAYU", "BAHASA INGGERIS"]
def pureSubjectList():
    subjectData = db.collection('Subject').get()
    pureSubjectList = []
    for pureSubject in subjectData:
        pure_subject_name = pureSubject.get('SubjectName')
        pureSubjectList.append(pure_subject_name)

    return pureSubjectList

#{"1103": "BAHASA MELAYU", "1119": "BAHASA INGGERIS"}
def subjectDictionary():
    subjectData = db.collection('Subject').get()
    subject_dict = {}
    for subject in subjectData:
        subject_code = subject.get('SubjectCode')
        subject_name = subject.get('SubjectName')

        subject_dict[subject_code] = subject_name
    
    return subject_dict

#{"BAHASA MELAYU": "BM", "BAHASA INGGERIS": "BI"}
def subjectAbbreviationDictionary(): 
    subjectData = db.collection('Subject').get()
    subjectAbbreviation_dict = {}
    for subjectAbbreviation in subjectData:
        subject_name  = subjectAbbreviation.get('SubjectName')
        subject_abbreviation = subjectAbbreviation.get('SubjectAbbreviation')

        subjectAbbreviation_dict[subject_name] = subject_abbreviation

    return subjectAbbreviation_dict

def reccomendCareer():
    return 0

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
    
@app.route("/Career/Recommend")
def recommend():
    return jsonify({'message': 'Hello aaaa Flask!'})


if __name__ == '__main__':
    app.run(debug=True)