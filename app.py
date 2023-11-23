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
import openai

#chatgpt init
openai.my_api_key = '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'
messages = [ {
    "role": "system", 
    "content": "You are an intelligent assistant of a career reccomending system. You have two main jobs which is to reccomend five or more different or similar career based on the type of test and result of that test, and from multiple lists of careers sort it into a single list with only five careers sorted by their occurance(or similar jobs) in the lists. "
    } ]

#centroids for KNN
bigfiveCetroids = [
    [[31.45659936, 26.47391025, 31.6864952,  31.92530977, 29.72198911],["labels"]],
    [[30.29006996, 34.79278687, 33.18295628, 28.69416131, 34.96391661],["labels"]],
    [[34.7595419, 30.22745977, 33.66319754, 33.60911407, 35.06978162],["labels"]],
    [[33.32970225, 39.90077732, 35.90322494, 35.64485328, 35.55789559],["labels"]],
    [[28.51662168, 22.96126856, 27.32168241, 31.35465587, 34.71322537],["labels"]],
    [[29.12017345, 40.16675193, 31.40268947, 29.72250238, 30.12336476],["labels"]],
    [[29.480309, 21.48158781, 29.37800454, 27.02223556, 28.94276692],["labels"]],
    [[27.78744939, 37.99665372, 31.11517806, 34.67669173, 35.77871189],["labels"]],
    [[31.99925448, 20.64114889, 33.08253713, 32.01228149, 34.59274882],["labels"]],
    [[28.24580945, 31.87381927, 27.54900355, 31.23809264, 33.65141505],["labels"]],
    [[29.11948232, 31.31482402, 29.9616922 , 27.45915347, 28.01868937],["labels"]],
    [[28.46209224, 28.68905406, 32.83163677, 34.33308199, 35.55122888],["labels"]],
    [[8.7495133,  7.43932511,  8.11291369,  7.6385464,  6.9422453],["labels"]],
    [[30.23849462, 26.69777778, 32.09958781, 27.28792115, 34.33243728],["labels"]]
]

hollandCentroids = [
    [[10.42307252, 12.4207813, 12.02749456, 13.95658151, 12.32214458, 11.13128652],[]],
    [[18.52296604, 19.26227706, 21.32970926, 31.92609333, 29.49376985, 30.74651845],["Sales", "teaching", 'preeducation', 'psychology',' public relation', 'journalist']],
    [[14.2651813, 29.17317606, 17.98217562, 30.48615116, 20.4365225, 20.10275229],["Researcher", 'Lecturer', 'Doctor', 'Therapist', 'Lawyer', "Actuarial Science"]],
    [[13.79007592, 14.79579712, 14.85080867, 22.17724722, 22.3685774, 26.28099901],["Managerial role", 'lab manager', 'Technician', 'Producer', "Business man"]],
    [[22.7535881, 22.92538475, 26.72332699, 26.17888639, 24.65485042, 23.08187792],["Entrepreneur", 'Architect', 'Engineer', "Fashion Designer"]],
    [[19.22268782, 31.9810436, 28.17928764, 20.86770428, 16.96508032, 16.9569989 ],["labels"]],
    [[10.4445105, 16.39803805, 14.72146254, 29.69312327, 15.85741181, 12.71472453],["labels"]],
    [[28.17966501, 31.85645119, 30.86731222, 33.78866789, 30.52617116, 30.89505365],["labels"]],
    [[23.92899753, 19.53295504, 16.12716427, 17.6420777, 17.30961734, 19.19103739],["labels"]],
    [[12.84258361, 17.79722933, 29.09697344, 30.98385247, 25.53269214, 16.62322421],["labels"]],
    [[11.34180698, 16.86827336, 27.44426103, 20.8379003, 15.79509189, 11.78529768],["labels"]],
    [[25.93002605, 30.81944116, 19.37662799, 23.43523561, 21.05671324, 27.44932512],["labels"]],
    [[12.4166246, 29.80052162, 29.84090527, 30.30043749, 16.5415615, 11.91553088],["labels"]],
    [[18.81220849, 32.09426397, 31.97487931, 32.38221095, 25.13697733, 20.05506914],["labels"]],
    [[11.64928335, 29.64542448, 15.13770673, 19.61808159, 12.56901874, 12.68489526],["labels"]],
]

#authenticate to firebase
cred = credentials.Certificate("credentials1.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


app = Flask(__name__)
CORS(app, supports_credentials=True)

#image folder 
imageUploadPath = os.path.join(os.getcwd(), 'uploadImageFolder')
app.config['UPLOAD_IMAGE_FOLDER'] = imageUploadPath

def euclidean(v1, v2):
    return sum((p-q)**2 for p, q in zip(v1, v2)) ** .5
    
def chatGPTAPI(message):
    if message: 
        messages.append( 
            {"role": "user", "content": message}, 
        ) 
        chat = openai.ChatCompletion.create( 
            model="gpt-3.5-turbo", messages=messages 
        ) 
    reply = chat.choices[0].message.content 
    print(f"ChatGPT: {reply}") 
    messages.append({"role": "assistant", "content": reply}) 
    return reply    
    
class ReccomendCareer:
    def ReccomendKNN(centroids, inputTestResult):
        distance = []
        for centroid in centroids:
            distance.append([euclidean(centroid[0], inputTestResult), centroid[1]])  
        reccomendations = sorted(distance, key=lambda x: x[0])
        print(reccomendations[0][1])
        return reccomendations[0][1]
    
    def ProcessGPTResult(resultGPT):
        caughtCareer = re.finditer(r'\[.*?\]', resultGPT)
        return caughtCareer
    
    def ReccomendChatGPT(result, testType):
        inputPrompt = "Following is the test result for " + testType + ". " + result + "\n Reccomend five careers based on it, only provide the careers in an array without code and explanation."
        return chatGPTAPI(inputPrompt) 
    
    def reduceReccomendation(reccomendations):
        inputPrompt = ""
        for reccomend in reccomendations:
            inputPrompt += str(reccomend) + "\n"
        inputPrompt += "Reduce the arrays above into a single array with five pairs of ['career' : occurance ] and sort it from left to right by most occured. Please only provide the array without code and explanation"
        return chatGPTAPI(inputPrompt)
        
        

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
    
@app.route("/Career/Recommend", methods=['POST'])
def recommend():
    data = request.json
    str(data)
    #ReccomendCareer.ReccomendKNN()
    return jsonify({'message': data})


if __name__ == '__main__':
    app.run(debug=True)