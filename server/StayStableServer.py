from flask import Flask, json, request
import mysql.connector
import requests

app = Flask(__name__)



# Configure the remote MySQL server connection
config = {
    'user': 'uxbfzkjfzlxiefpm',
    'password': 'o2uM7IOSVhlI0yu2yUF2',
    'host': 'bso1emke9kuwl56sroz2-mysql.services.clever-cloud.com',
    'database': 'bso1emke9kuwl56sroz2',
    'raise_on_warnings': True
}

def get_db_connection():
    return mysql.connector.connect(**config)

@app.route('/test', methods = ['PUT'])
def route_test():
    response = json.loads(request.data)
    print(response)
    return response


@app.route('/information', methods = ['GET'])#from server to application with dynamic input of days
def Get_Information():
    #need to ask matan if information on days will be sent in quary(in the url) or with body
    #קבלת הנתונים תעודת זהות וזמן
    #id, time_to_get
    dic = json.loads(request.data)
    id = dic['id']
    time_to_get = dic['time_to_get']

    conn = get_db_connection()
    cursor = conn.cursor()
    get_information_of_user = f""" SELECT * from vibrations where id = '{id}' AND NOT time_to_get < '{time_to_get}'"""
    cursor.execute(get_information_of_user)
    result_users = cursor.fetchall()
    response = requests.put(request.url, data = result_users)#needs to check what is the url of the application
    return response#200 if success

@app.route('/information/new', methods = ['PUT'])#from application to server
def New_User():
    dic = json.loads(request.data)
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    currect_dosage = dic["current_dosage"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()

    # Execute an SQL statement to insert the record into a table
    '''
    get_users_query = f""" SELECT * from users where first_name = '{first_name}' """

    cursor.execute(get_users_query)
    result_users = cursor.fetchall()

    if result_users:
        print("User Exists, UPDATE")
    
    else:
        print("User does not exist, INSERT")
    '''

    get_users_query = f""" SELECT * from users where first_name = '{first_name}' AND last_name = '{last_name}' AND phone_number = '{phone_number}'"""

    cursor.execute(get_users_query)
    result_users = cursor.fetchall()
    if result_users:#maybe check for change in the current_dosage if needed?
        update_query = f"""UPDATE users SET current_dosage = {currect_dosage} where first_name = '{first_name}' AND last_name = '{last_name}' AND phone_number = '{phone_number}"""
        cursor.execute(update_query)
        conn.commit()
        cursor.close()
        conn.close()
        return json.dumps({'result': "User already exists"})
    
    # Define a record to insert
    record = (first_name, last_name, phone_number, currect_dosage)

    # Check if any rows were returned
    sql = f"""INSERT INTO users (first_name, last_name, phone_number, current_dosage) VALUES (%s, %s, %s, %s)"""

    cursor.execute(sql, record)

    # Commit the transaction
    conn.commit()

    # Close the connection
     # Close the cursor and connection
    cursor.close()
    conn.close()

    AnsJson = json.dumps({'result': "The user was added successfuly!"})
    return AnsJson


# TODO - add body with parameters count, id.
#        need to hash id, as it comes as mac address
#        use sha256 for example https://www.geeksforgeeks.org/sha-in-python/
#the information about users such as password or any sensitive information need to be hashed that way
@app.route('/information', methods = ['PUT'])#from bracelet to server
def Input_Information():
    return
@app.route('/information', methods = ['DELETE'])#from application to server
def Delete_Information():
#use with body requests body
    return

@app.route('/alert', methods = ['GET'])#from server to application
def Get_Alert():#not sure if needed maybe in the PUT method we will send an http request to the application of the fall

    return


#@app.route('/alert', methods = ['PUT'])#from bracelet to server
#def Input_Alert():
#    return

@app.route('/bracelet', methods = ['HEAD'])
def Check_Bracelet():
    return

@app.route('/application', methods = ['HEAD'])
def Check_App():
    return


if __name__ == "__main__":
    #app.run(host="bso1emke9kuwl56sroz2-mysql.services.clever-cloud.com",port=3306)
    app.run(debug=True)

#query = comes with the url and is written at the end of the url
#to get it out: request.args.to_dict()
#body = dictionary that come seperated (assuming it is json type)
#to get it out: dic = json.loads(request.data)
