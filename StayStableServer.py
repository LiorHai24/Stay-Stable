from flask import Flask, json, request
app = Flask(__name__)

#opening the database

@app.route('/information', methods = ['GET'])#from server to application
def Get_Information():
    return

@app.route('/information', methods = ['PUT'])#from bracelet to server
def Input_Information():
    return

@app.route('/information', methods = ['DELETE'])
def Delete_Information():
    return

@app.route('/alert', methods = ['GET'])#from server to application
def Get_Alert():
    return


@app.route('/alert', methods = ['PUT'])#from bracelet to server
def Input_Alert():
    return

@app.route('/bracelet', methods = ['HEAD'])
def Check_Bracelet():
    return

@app.route('/application', methods = ['HEAD'])
def Check_App():
    return
