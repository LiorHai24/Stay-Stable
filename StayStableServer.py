from flask import Flask, json, request
import mysql.connector
app = Flask(__name__)
first=True
#opening the database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password='',
    database="stay_stayble"
)

@app.route('/information', methods = ['GET'])#from server to application
def Get_Information():
    return

@app.route('/information/new', methods = ['PUT'])#from bracelet to server
def New_User():
    dic = json.loads(request.data)
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    currect_dosage = dic["current_dosage"]
    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")

    # Define a record to insert
    #record = (id, first_name, last_name, phone_number, currect_dosage)

    # Execute an SQL statement to insert the record into a table
    # Check if any rows were returned
    if cursor.fetchone() is not None:#not empty
        record = (first_name, last_name, phone_number, currect_dosage)
        sql = "INSERT INTO users (first_name, last_name, phone_number, current_dosage) VALUES (%s, %s, %s, %s)"
    else:
        record = (1, first_name, last_name, phone_number, currect_dosage)
        sql = "INSERT INTO users (id, first_name, last_name, phone_number, current_dosage) VALUES (%s, %s, %s, %s, %s)"
        

    cursor.execute(sql, record)

    # Commit the transaction
    conn.commit()

    # Close the connection
    conn.close()

    AnsJson = json.dumps({"The user was added successfuly!"})
    response = app.response_class(
        response = AnsJson,
        status = 200,
        mimetype = 'application/json')
    return response

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


if __name__ == "__main__":  
    app.run(host="0.0.0.0", port=3306)

#query = comes with the url and is written at the end of the url
#to get it out: request.args.to_dict()
#body = dictionary that come seperated (assuming it is json type)
#to get it out: dic = json.loads(request.data)