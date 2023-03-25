import mysql.connector
from flask import Flask, json, request
import requests
import hashlib
from datetime import datetime ,timedelta
import StableFunctions

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


#matan - did you mean from app to server? 
#app need to get info of the vibrations not the other way around
@app.route('/information', methods = ['GET'])#from server to application with dynamic input of days
def Get_Information():
    dic = json.loads(request.data)
    id = dic['id']
    time_to_get = dic['time_to_get']

    conn = get_db_connection()
    cursor = conn.cursor()
    mac_query = f"SELECT crypted_mac FROM users WHERE id = {id}"
    cursor.execute(mac_query)
    mac_table = cursor.fetchall()
    if mac_table is not None:
        mac = mac_table[0]
        get_information_of_user = f""" SELECT dosage_id, current_date FROM vibrations WHERE id = '{mac}' AND  time_to_get >= '{time_to_get}'"""
        cursor.execute(get_information_of_user)
        result_users = cursor.fetchall()

        return StableFunctions.jsonize(cursor, result_users)
    
    return json.dumps({'result': 'Something went wrong: could not find mac for the given id'})
    
    

@app.route('/information/new', methods = ['PUT'])#from application to server
def New_User():
    dic = json.loads(request.data)
    mac = dic["mac"]
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    currect_dosage = dic["current_dosage"]
    email = dic["email"]

    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Define a record to insert
    mac = str(mac)
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    record = (first_name, last_name, phone_number, email, currect_dosage, crypted_mac)

    # Check if any rows were returned
    sql = f"""INSERT INTO users (first_name, last_name, phone_number, email, current_dosage, crypted_mac) VALUES (%s, %s, %s, %s, %s, %s)"""

    cursor.execute(sql, record)

    # Commit the transaction
    conn.commit()

    # Close the connection
    # Close the cursor and connection
    cursor.close()
    conn.close()

    AnsJson = json.dumps({'result': "The user was added successfuly!"})
    return AnsJson



@app.route('/information/new/contact', methods = ['PUT'])#from application to server
def New_Contact():
    dic = json.loads(request.data)
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    email = dic["email"]
    id = dic["id"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()
    record = (phone_number, email, id, first_name, last_name)

    # Check if any rows were returned
    sql = f"""INSERT INTO contacts (phone_number, email, id, first_name, last_name) VALUES (%s, %s, %s, %s, %s)"""

    cursor.execute(sql, record)

    # Commit the transaction
    conn.commit()

    # Close the connection
    # Close the cursor and connection
    cursor.close()
    conn.close()

    AnsJson = json.dumps({'result': "The contact was added successfuly!"})
    return AnsJson


@app.route('/information/contacts', methods = ['GET'])#from application to server get the contacts of this person
def Get_Contacts():
    dic = json.loads(request.data)
    id = dic["id"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if any rows were returned
    contacts_query = f"""SELECT phone_number, email, first_name, last_name FROM contacts WHERE id = '{id}'"""

    cursor.execute(contacts_query)
    contacts_table = cursor.fetchall()
    cursor.close()
    conn.close()

    return StableFunctions.jsonize(cursor, contacts_table)

        

    

# TODO - add body with parameters count, id.
#        need to hash id, as it comes as mac address
#        use sha256 for example https://www.geeksforgeeks.org/sha-in-python/
# the information about users such as password or any sensitive information need to be hashed that way

@app.route('/information', methods = ['PUT'])#from bracelet to server
def Input_Information():
    dic = json.loads(request.data)
    print(dic)
    vibrations = dic["vibrations"]
    mac = dic["mac"]
    #
    #NEED to process the vibrations
    #for this code is saved in sum_vibrations

    # datetime object containing current date and time
    now = datetime.now()
    conn = get_db_connection()
    cursor = conn.cursor()
    mac = str(mac)
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    dt_string = now.strftime("%Y/%m/%d %H:%M")
    record = (crypted_mac, sum_vibrations, dt_string)
    sql = f"""INSERT INTO vibrations (id, dosage_id, current_date) VALUES (%s, %s, %s)"""

    cursor.execute(sql, record)

    # Commit the transaction
    conn.commit()
    cursor.close()
    conn.close()

    return

@app.route('/information', methods = ['DELETE'])#from application to server
def Delete_Information():
#use with body requests body
    dic = json.loads(request.data)
    time_to_delete = dic["time_to_delete"]#in days
    id = dic["id"]
    time_to_delete = int(time_to_delete)
    cutoff_date = datetime.now() - timedelta(days=time_to_delete)

    conn = get_db_connection()
    cursor = conn.cursor()
    get_crypted_mac = f""" SELECT crypted_mac FROM users where id = '{id}' """
    cursor.execute(get_crypted_mac)
    result_mac = cursor.fetchall()

    query = f"DELETE FROM vibrations WHERE current_time < '{cutoff_date.strftime('%Y/%m/%d %H:%M')} AND id = {result_mac}';"
    cursor.execute(query)

    cursor.close()
    conn.close()
    return json.dumps({'result': f'All information that is older than {time_to_delete} days was deleted successfuly.'})


@app.route('/alert', methods = ['PUT'])#from bracelet to server
def Input_Alert():
    dic = json.loads(request.data)
    mac = str(dic["mac"])
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor()
    
    user_query = f"SELECT id, first_name, last_name FROM users WHERE crypted_mac = '{crypted_mac}';"
    cursor.execute(user_query)
    user_row = cursor.fetchall()
    if user_row is not None:
        user_id = user_row[0][0]
        user_first_name = user_row[0][1]
        user_last_name = user_row[0][2]
        contacts_query = f"SELECT email FROM contacts WHERE id = {user_id}"
        cursor.execute(contacts_query)#the table
        contacts_table = cursor.fetchall()
        #need to check how to email these addresses
        StableFunctions.send_email(contacts_table, user_first_name, user_last_name)


    cursor.close()
    conn.close()

    return json.dumps({'result': 'Message about a fall was sent to all your contacts'})


if __name__ == "__main__":
    #app.run(host="bso1emke9kuwl56sroz2-mysql.services.clever-cloud.com",port=3306)
    app.run(host = "0.0.0.0", debug=True, port= 3306)
    #TODO add a call to braclet, get method, no parameters, endpoint "check_connection", to get mpu6050 connection


#query = comes with the url and is written at the end of the url
#to get it out: request.args.to_dict()
#body = dictionary that come seperated (assuming it is json type)
#to get it out: dic = json.loads(request.data)

    '''
    SQL EXAMPLES:
    get_users_query = f""" SELECT * from users where first_name = '{first_name}' """

    cursor.execute(get_users_query)
    result_users = cursor.fetchall()

    if result_users:
        print("User Exists, UPDATE")
    
    else:
        print("User does not exist, INSERT")

    get_users_query = f""" SELECT * from users where first_name = '{first_name}' AND last_name = '{last_name}' AND phone_number = '{phone_number}'"""

    cursor.execute(get_users_query)
    result_users = cursor.fetchall()

    if result_users:#maybe check for change in the current_dosage if needed?
        update_query = f"""UPDATE users SET current_dosage = {currect_dosage} where first_name = '{first_name}' AND last_name = '{last_name}' AND phone_number = '{phone_number}'"""
        cursor.execute(update_query)
        conn.commit()
        cursor.close()
        conn.close()
        return json.dumps({'result': "User already exists"})
    '''
