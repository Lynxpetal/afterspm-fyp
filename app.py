import asyncio
import time
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
from openai import OpenAI
import asyncio



#chatgpt init
client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key="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"
)


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
    [[10.42307252, 12.4207813, 12.02749456, 13.95658151, 12.32214458, 11.13128652],["Data Analyst", "Technical Writer", "Event Coordinator", "Digital Marketing Specialist", "Radiologic Technologist"]],
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
cred = credentials.Certificate("credentials4.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


app = Flask(__name__)
CORS(app, supports_credentials=True)

#image folder 
imageUploadPath = os.path.join(os.getcwd(), 'uploadImageFolder')
app.config['UPLOAD_IMAGE_FOLDER'] = imageUploadPath

def euclidean(v1, v2):
    return sum((p-q)**2 for p, q in zip(v1, v2)) ** .5
    
def chatGPTAPI(system,prompt):
    input = [{"role": "system", "content": system}, {"role": "user", "content": prompt}]
    chat = client.chat.completions.create( 
            model="gpt-3.5-turbo", messages=input, temperature=0.3, frequency_penalty=-0.5, presence_penalty=-0.5 
        ) 
    print(f"ChatGPT: {chat.choices[0].message.content}") 
    return str(chat.choices[0].message.content)    
    
class ReccomendCareer:
    def ReccomendKNN(centroids, inputTestResult):
        distance = []
        for centroid in centroids:
            distance.append([euclidean(centroid[0], inputTestResult), centroid[1]]) 
        
        reccomendations = sorted(distance, key=lambda x: x[0])
        print("hello")
        print(reccomendations[0][1])
        return reccomendations[0][1]
    
    def ReccomendChatGPT(result, testType):
        inputSystem = "Based on the input result for the test result for" + testType + "return an array of five careers suitable without any code and explanation but the array."
        inputPrompt = result
        return chatGPTAPI(inputSystem, inputPrompt) 
    
    def reduceReccomendation(reccomendations):
        inputPrompt = "Ignore all previous prompt \n"
        for reccomend in reccomendations:
            print(reccomend)
            if(reccomend != [""] or reccomend != ['']):
                inputPrompt += str(reccomend) + "\n"
        inputSystem = "Based on the arrays of career that the user sends you, you are to reduce it into a single array with five pairs of ['career' : occurance ] and sort it from left to right by most occured. You are to only use the careers provided by the user. Reply it in an array without any explanation or code"          
        return chatGPTAPI(inputSystem, inputPrompt)



@app.route("/finalFilter", methods=['POST'])
def finalFilter():
    if request.method == 'POST':
        data = request.json     
        print(data)
        instituteDataList = completeInstituteData()
        subjectDataList = completeSubjectData()
        filterDistanceDataList = filterDistanceMatrixResultsData(data)

        print(instituteDataList)
        print(filterDistanceDataList)
        if len(data['data']) > 5:
            print("Got location")
            withLocationlist = filterWithLocation(data, instituteDataList, filterDistanceDataList, subjectDataList)
            print(withLocationlist)
            return withLocationlist
        else:
            print("Empty location")
            withoutLocationList = filterWithoutLocation(data, instituteDataList, subjectDataList)
            print(withoutLocationList)
            return withoutLocationList

def completeSubjectData():
    #Subject
    subjectData = db.collection('Subject').get()
    subject_list = []

    for subject in subjectData:
        subject_dict = {}
        subject_dict['SubjectAbbreviation'] = subject.get("SubjectAbbreviation")
        subject_dict['SubjectName'] = subject.get("SubjectName")
        subject_list.append(subject_dict)

    return subject_list


def completeInstituteData():
    #Institute
    instituteData = db.collection('Institute').get()
    institute_list = []

    for institute in instituteData:
        institute_dict = {}
        institute_dict['InstituteName'] = institute.get("InstituteName")
        institute_dict['InstituteImageUrl'] = institute.get("InstituteImageUrl")
        institute_dict['InstituteLocation'] = institute.get("InstituteLocation")
        institute_list.append(institute_dict)

    return institute_list

def completeSubjectData():
    #Subject
    subjectData = db.collection('Subject').get()
    subject_list = []
    
    for subject in subjectData:
        subject_dict = {}
        subject_dict['SubjectAbbreviation'] = subject.get('SubjectAbbreviation')
        subject_dict['SubjectCode'] = subject.get('SubjectCode')
        subject_dict['SubjectName'] = subject.get('SubjectName')
        subject_list.append(subject_dict)

    return subject_list

def filterDistanceMatrixResultsData(data):
    #FilterDistanceMatrixResults
    distanceData = db.collection('FilterDistanceMatrixResults').get()
    distance_list = []

    for distance in distanceData:
        distance_dict = {}
        user = distance.get('user')
        if user == data['data'][4]:
            distance_dict['instituteName'] = distance.get('instituteName')
            distance_dict['distance'] = distance.get('distance')
            distance_dict['duration'] = distance.get('duration')
            distance_list.append(distance_dict)

    return distance_list

def resultData(data):
    #Result
    resultData = db.collection('Result').get()
    for resultUser in resultData:
        userId = resultUser.get("ResultBelongTo")
        if userId == data['data'][4]:
            result_dict = resultUser.get('ResultData')
    
    return result_dict

def distanceData(data):
    #Distance
    distanceData = db.collection('FilterDistanceMatrixResults').get()
    distance_list = []
    for distance in distanceData:
        distance_dict = {}
        user = distance.get("user")
        if user == data['data'][4]:
            distance_dict['InstituteName'] = distance.get('instituteName')
            distance_dict['DistanceInUnit'] = distance.get('distanceInUnit')
            distance_list.append(distance_dict)

    sorted_distance_list = sorted(distance_list, key=lambda item: int(item['DistanceInUnit']) if isinstance(item['DistanceInUnit'], (int, float)) else float('inf'))
    return sorted_distance_list

def programmeData():
    #Programme
    programmeData = db.collection('Programme').get()
    programme_list = []

    for programme in programmeData:
        programme_dict = {}
        programme_dict['ProgrammeName'] = programme.get('ProgrammeName')    #Diploma In Computer Science
        programme_dict['InstituteName'] = programme.get('InstituteName')   #TARC
        programme_dict['ProgrammeCategory'] = programme.get('ProgrammeCategory')    #Computer & Multimedia
        programme_dict['ProgrammePrice'] = programme.get('ProgrammePrice')          #20000
        programme_dict['ProgrammeStudyLevel'] = programme.get('ProgrammeStudyLevel')    #Diploma
        programme_dict['ProgrammeDuration'] = programme.get('ProgrammeDuration')
        programme_dict['ProgrammeMinimumEntryRequirement'] = programme.get('ProgrammeMinimumEntryRequirement')  #{'BM': 'D', 'SEJ': 'E'}
        programme_list.append(programme_dict)

    return programme_list

def filterWithLocation(data, instituteDataList, filterDistanceDataList, subjectDataList):
    #result data
    result_dict = resultData(data)

    #distance data
    sorted_distance_list = distanceData(data)

    #programme data
    programme_list = programmeData()
    sorted_distance_names = [item['InstituteName'] for item in sorted_distance_list]
    print(sorted_distance_names)
    sorted_programme_list = sorted(programme_list, key=lambda item: sorted_distance_names.index(item.get('InstituteName')))
    print(sorted_programme_list)

            
    user_input = {
        "maximum_tuition_fees": data['data'][1],    #30000
        "study_level": data['data'][2],     #Diploma    
        "course": data['data'][3],          #Computer & Multimedia
        "result": result_dict,              #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}
        "distanceFromInstitute": sorted_distance_list   #{'TARC': '33km', 'UCSI': '55km'}                                    
    }

    filterList = filter_programmes(user_input, sorted_programme_list, instituteDataList, filterDistanceDataList, subjectDataList)
    print(filterList)
    return filterList

def filterWithoutLocation(data, instituteDataList, subjectDataList):
    #result data
    result_dict_without_location = resultData(data)

    #programme data
    programme_list = programmeData()

    user_input = {
        "maximum_tuition_fees": data['data'][1],    #30000
        "study_level": data['data'][2],     #Diploma    
        "course": data['data'][3],          #Computer & Multimedia
        "result": result_dict_without_location,  #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}                                    
    }

    filterList = filter_programmes_without_location(user_input, programme_list, instituteDataList, subjectDataList)
    print(filterList)
    return filterList

def filter_programmes_without_location(user_input, programme_list, instituteDataList, subjectDataList):
    recommend_programmes_list_without_location = []

    for programme in programme_list:
        #check if study level matches
        programme_dict_final = {}
        print(programme['ProgrammeStudyLevel'])
        if user_input['study_level'] == programme['ProgrammeStudyLevel']:
            #check if course category matches
            print(programme['ProgrammeCategory'])
            if user_input['course'] == programme['ProgrammeCategory']:
                #check if results meet the minimum entry requirement
                result = user_input['result'] #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}
                entryRequirements = programme['ProgrammeMinimumEntryRequirement'] #{'BM': 'D', 'SEJ': 'E'}
                if requirementsFulfilled(result, entryRequirements):
                    #Check if the price is within budget
                    programme_price = programme['ProgrammePrice']
                    print(programme_price)
                    if programme_price <= user_input['maximum_tuition_fees']:
                        for institute in instituteDataList:
                            if programme['InstituteName'] == institute['InstituteName']:
                                    programme_dict_final['InstituteName'] = institute['InstituteName']
                                    programme_dict_final['Institute Name'] = institute['InstituteImageUrl']
                                    programme_dict_final['Programme Name'] = programme['ProgrammeName']
                                    programme_dict_final['Campus'] = institute['InstituteLocation']
                                    programme_dict_final['Programme Duration'] = f"{programme['ProgrammeDuration']} years"
                                    programme_dict_final['Programme Estimated Price'] = f"RM {programme['ProgrammePrice']}"
                                    programme_dict_final['Programme Study Level'] = programme['ProgrammeStudyLevel']
                                    programme_dict_final['Minimum Entry Requirement'] = {}
                                    for subjectMinimum, entryMinimum in entryRequirements.items():
                                        for subjectData in subjectDataList:
                                            if subjectData['SubjectAbbreviation'] == subjectMinimum:
                                                subjectName = subjectData['SubjectName']
                                                programme_dict_final['Minimum Entry Requirement'][subjectName] = entryMinimum

                                    print(programme_dict_final['Minimum Entry Requirement'])
                                    programme_dict_final['Result'] = {}
                                    for subject, entry_grade in entryRequirements.items(): #{'BM': 'D', 'SEJ': 'E'}
                                        for resultSubjectData in subjectDataList: #{'BM': 'BAHASA MELAYU', 'SEJ': 'SEJARAH'}
                                            if subject in result: #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}
                                                if resultSubjectData['SubjectAbbreviation'] == subject: #if 'BM' == 'BM'
                                                    completeSubjectName = resultSubjectData['SubjectName']     
                                                    programme_dict_final['Result'][completeSubjectName] = result[subject]                              

                                    print(programme_dict_final['Result'])
                                    recommend_programmes_list_without_location.append(programme_dict_final)
    
    print(programme_dict_final)
    print(recommend_programmes_list_without_location)
    return recommend_programmes_list_without_location

def filter_programmes(user_input, programme_list, instituteDataList, filterDistanceDataList, subjectDataList):
    recommend_programmes_list = []

    for programme in programme_list:
        #check if study level matches
        programme_dict_final = {}
        print(programme['ProgrammeStudyLevel'])
        if user_input['study_level'] == programme['ProgrammeStudyLevel']:
            #check if course category matches
            print(programme['ProgrammeCategory'])
            if user_input['course'] == programme['ProgrammeCategory']:
                #check if results meet the minimum entry requirement
                result = user_input['result'] #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}
                entryRequirements = programme['ProgrammeMinimumEntryRequirement'] #{'BM': 'D', 'SEJ': 'E'}
                if requirementsFulfilled(result, entryRequirements):
                    #Check if the price is within budget
                    programme_price = programme['ProgrammePrice']
                    print(programme_price)
                    if programme_price <= user_input['maximum_tuition_fees']:
                        for institute in instituteDataList:
                            if programme['InstituteName'] == institute['InstituteName']:
                                if programme['InstituteName'] == institute['InstituteName']:
                                    programme_dict_final['InstituteName'] = institute['InstituteName']
                                    programme_dict_final['Institute Name'] = institute['InstituteImageUrl']
                                    programme_dict_final['Programme Name'] = programme['ProgrammeName']
                                    programme_dict_final['Campus'] = institute['InstituteLocation']
                                    programme_dict_final['Programme Duration'] = f"{programme['ProgrammeDuration']} years"
                                    programme_dict_final['Programme Estimated Price'] = f"RM {programme['ProgrammePrice']}"
                                    programme_dict_final['Programme Study Level'] = programme['ProgrammeStudyLevel']
                                    for distance in filterDistanceDataList:
                                        if distance['instituteName'] == institute['InstituteName']:
                                            programme_dict_final['Driving Duration'] = distance['distance']
                                            programme_dict_final['duration'] = distance['duration']
                                    programme_dict_final['Minimum Entry Requirement'] = {}
                                    for subjectMinimum, entryMinimum in entryRequirements.items():
                                        for subjectData in subjectDataList:
                                            if subjectData['SubjectAbbreviation'] == subjectMinimum:
                                                subjectName = subjectData['SubjectName']
                                                programme_dict_final['Minimum Entry Requirement'][subjectName] = entryMinimum

                                    print(programme_dict_final['Minimum Entry Requirement'])
                                    programme_dict_final['Result'] = {}
                                    for subject, entry_grade in entryRequirements.items(): #{'BM': 'D', 'SEJ': 'E'}
                                        for resultSubjectData in subjectDataList: #{'BM': 'BAHASA MELAYU', 'SEJ': 'SEJARAH'}
                                            if subject in result: #{'MM': 'A+', 'FZ': 'A+', 'PP': 'A+', 'BI': 'A+', 'PM': 'A', 'BC': 'A+', 'BM': 'A+', 'BIO': 'A+', 'AM': 'A+', 'KM': 'A+', 'SEJ': 'A+'}
                                                if resultSubjectData['SubjectAbbreviation'] == subject: #if 'BM' == 'BM'
                                                    completeSubjectName = resultSubjectData['SubjectName']     
                                                    programme_dict_final['Result'][completeSubjectName] = result[subject]

                                    print(programme_dict_final['Result'])
                                    recommend_programmes_list.append(programme_dict_final)
    
    print(programme_dict_final)
    print(recommend_programmes_list)
    return recommend_programmes_list

grade_mapping = {'A+': 1, 'A': 2, 'A-': 3, 'B+': 4, 'B': 5, 'C+': 6, 'C': 7, 'D': 8, 'E': 9, 'G': 10, 'TH': 11}

def convert_grade(grade):
    return grade_mapping.get(grade)


def requirementsFulfilled(result, entry_requirements):
    for subject, grade in entry_requirements.items():
        if subject not in result or convert_grade(grade) < convert_grade(result[subject]):
            return False 
    return True
        

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
    grade_keys_with_values = list(gradeDictionary().values())
    grade_formatted_string = "|".join(grade_keys_without_values)
    grade_values_formatted_string = "|".join(grade_keys_with_values)

    #Output: CEMERLANG TERTINGGI|CEMERLANG TINGGI|CEMERLANG|....|TIDAK HADIR
    print(grade_formatted_string)
    print(list(subjectDictionary().keys()))
    #Iterate over the list of subjects
    for subject in pureSubjectList():
        #if OCR capture subject name (eg "BAHASA MELAYU") or subject code (eg "1103")
        if subject in corrected_input or any(key in corrected_input and value == subject for key, value in subjectDictionary().items()):
            #Find the grade for the subject
            grade = re.search(grade_formatted_string, corrected_input).group()
            if grade:
                #Print the grade for the subject
                #{"BM": "A+"}
                subject_grade_dict[subjectAbbreviationDictionary()[subject]] = gradeDictionary()[grade]
            else:
                #sometimes the ocr detects value instead
                gradeValue = re.search(grade_values_formatted_string, correct_input).group()
                if gradeValue:
                    subject_grade_dict[subjectAbbreviationDictionary()[subject]] = gradeValue
                else:
                    print(f"No grade found for {subject}")

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
    #check
    if(data["hollands"] == data["bigfive"]):
        return jsonify({'message': "empty input"})
    
    #init for better logic assertion
    hollandFormat = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional']
    bigfiveFormat = ['Extraversion', 'Neuroticism', 'Agreeableness', 'Conscientiousness', 'Openness']
    hollandKNNReccomends = [""]
    hollandGPTReccomends = [""]
    bigfiveKNNReccomends = [""]
    bigfiveGPTReccomends = [""]
    
    if(data["hollands"] != [0,0,0,0,0,0]):
        hollandKNNReccomends = ReccomendCareer.ReccomendKNN(hollandCentroids, data["hollands"])
        gptHolland = "["
        for i in range(6):
            gptHolland += " " + hollandFormat[i] + ":" + str(data["hollands"][i])
        hollandGPTReccomends = ReccomendCareer.ReccomendChatGPT((gptHolland + "]"),  "Holland's Test")
        
    if(data["bigfive"] != [0,0,0,0,0]):
        bigfiveKNNReccomends = ReccomendCareer.ReccomendKNN(bigfiveCetroids, data["bigfive"])
        gptBigFive = "["
        for i in range(5):
            gptBigFive += " " + bigfiveFormat[i] + ":" + str(data["hollands"][i])
        bigfiveGPTReccomends = ReccomendCareer.ReccomendChatGPT((gptHolland + "]"),  "Holland's Test")
    
    output = ReccomendCareer.reduceReccomendation([hollandKNNReccomends, bigfiveKNNReccomends, hollandGPTReccomends, bigfiveGPTReccomends])
    
    return jsonify({'message': output})

@app.route("/Career/Course", methods=['POST'])
def course():
    data = request.json
    inputPrompt = data["input"]
    inputSystem = "Based on the career received you are to reccomend suitable programmes for the user to study in, if there are already programmes inserted by user you are to reccomend programmes only based on the input"
    output = chatGPTAPI(inputSystem, inputPrompt)
    return jsonify({'message': output})

async def async_get_data():
    await asyncio.sleep(1)
    return 'Done!'

@app.route("/get-data")
async def get_data():
    data = await async_get_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)