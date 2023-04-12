from flask import Flask, request
import StableFunctions
from dotenv import dotenv_values

Port = dotenv_values(".env")
app = Flask(__name__)

# Configure the remote MySQL server connection


@app.route('/test', methods = ['PUT'])
def call_route_test():
    return StableFunctions.route_test(request)

@app.route('/vibrations', methods = ['GET'])#from server to application
def Call_Get_Vibrations():
    return StableFunctions.Get_Vibrations(request)
    

@app.route('/new', methods = ['PUT'])#from application to server
def Call_New_User():
    return StableFunctions.New_User(request)


@app.route('/new/contact', methods = ['PUT'])#from application to server
def Call_New_Contact():
    return StableFunctions.New_Contact(request)

@app.route('/contacts', methods = ['GET'])#from application to server get the contacts of this person
def Call_Get_Contacts():
    return StableFunctions.Get_Contacts(request)



@app.route('/vibrations', methods = ['PUT'])#from bracelet to server
def Call_Input_Information():
    return StableFunctions.Input_Information(request)

@app.route('/vibrations', methods = ['DELETE'])#from application to server
def Call_Delete_Information():
    return StableFunctions.Delete_Information(request)

@app.route('/alert', methods = ['PUT'])#from bracelet to server
def Call_Input_Alert():
    return StableFunctions.Input_Alert(request)

@app.route('/check_connection', methods = ['POST'])#Check connection between bracelet to server MAYBE PUT?
def Call_Check_Connection():
    return StableFunctions.Check_Connection(request)

@app.route('/check_connection', methods = ['GET'])#status cases: 0- something wrong  1-works good  2-wrong and notified
def Call_Get_Status():
    return StableFunctions.Get_Status(request)

@app.route('/update_user_information', methods = ['POST'])#updating the current_dosage of a user. from application to server
def Call_Update_Information():
    return StableFunctions.Update_Information(request)

@app.route('/dose', methods = ['POST'])#input a new dose into the database. from application to server
def Call_Dose(request):
    return StableFunctions.Input_Dose(request)


@app.route('/last_dose', methods = ['GET'])#get the last dose of a user.
def Call_Last_dose(request):
    return StableFunctions.Last_dose(request)


if __name__ == "__main__":
    app.run(host = "0.0.0.0", debug=True, port= Port["PORT"])


#query = comes with the url and is written at the end of the url
#to get it out: request.args.to_dict()
#body = dictionary that come seperated (assuming it is json type)
#to get it out: dic = json.loads(request.data)

