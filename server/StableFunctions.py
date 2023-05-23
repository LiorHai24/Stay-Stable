import smtplib
import mysql.connector
from flask import json
from datetime import datetime ,timedelta
import logging
import os
from twilio.rest import Client
import hashlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re
#import sys

if not os.path.exists('logs'):#creation of logs folder
    os.makedirs('logs')

request_count = 0
format = logging.Formatter("%(asctime)s.%(msecs)03d %(levelname)s: %(message)s | request #%(request_count)s","%d-%m-%Y %H:%M:%S")
logger_name = "logger"
logger = logging.getLogger(logger_name)
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler("logs/{}.log".format(logger_name), mode='w')#creation of log file
file_handler.setFormatter(format)
logger.addHandler(file_handler)
#handler = logging.StreamHandler(sys.stdout)
#handler.setFormatter(format)
#request_logger.addHandler(handler)

#if we want to print to console as well

config = {
    'user': 'uxbfzkjfzlxiefpm',
    'password': 'o2uM7IOSVhlI0yu2yUF2', 
    'host': 'bso1emke9kuwl56sroz2-mysql.services.clever-cloud.com',
    'database': 'bso1emke9kuwl56sroz2',
    'raise_on_warnings': True
}

def get_db_connection():
    return mysql.connector.connect(**config)


def send_email(table, first_name, last_name):
    # Set up the SMTP server
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = 'staystayble1@gmail.com'
    smtp_password = r'fztwumxbosycttno'
    smtp_connection = smtplib.SMTP(smtp_server, smtp_port)
    smtp_connection.starttls()
    smtp_connection.login(smtp_username, smtp_password)

    # Set up the email content
    sender = 'staystayble1@gmail.com'
    recipient = table
    subject = 'ATTENTION! A fall has been detected'
    body = f'{first_name} {last_name} fell! please check that s/he is ok?'
    for i in recipient:

        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = i[0]
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Send the email
        smtp_connection.sendmail(sender, i, msg.as_string())


    # Close the SMTP connection
    smtp_connection.quit()
def jsonize(cursor, result):
    if type(result) is not list:
        row_headers = [x[0] for x in cursor.description] #this will extract row headers
        return dict(zip(row_headers,result))
    else:#result is a list
        row_headers=[x[0] for x in cursor.description] #this will extract row headers
        json_data=[]
        for result in result:
            json_data.append(dict(zip(row_headers,result)))
        return json_data
    

def route_test(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    response = json.loads(request.data)
    print(response)
    return response

def Get_Vibrations(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic['id']
    time_to_get = dic['time_to_get']

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    mac_query = f"SELECT crypted_mac FROM users WHERE id = {id}"
    cursor.execute(mac_query)
    if cursor.rowcount != 0:
        crypted_mac = cursor.fetchone()
        get_information_of_user = f""" SELECT dosage_id, date_time FROM vibrations WHERE id = '{crypted_mac}' AND  time_to_get >= '{time_to_get}'"""
        cursor.execute(get_information_of_user)
        result_users = cursor.fetchall()
        cursor.close()
        conn.close()
        if cursor.rowcount != 0:
            logger.debug("vibrations were found successfuly", extra={"request_count": request_count})
            ans = 1
        else:
            logger.error("vibrations were not found", extra={"request_count": request_count})
            ans = 0
            result = "None"
        
    else:
        logger.error("Server encountered an error ! couldn't find user", extra={"request_count": request_count})
        ans = 0 # if the user is not in the database 
        result = "None"
    if ans:
        result = jsonize(cursor, result_users)
    return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json')

    

def New_User(app, request):##- with mac
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

    dic = json.loads(request.data)
    mac = dic["mac"]
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    age = dic["age"]
    medicine_name = dic["medicine_name"]
    email = dic["email"].lower()
    contacts = dic["contacts"]
    contact1, contact2, contact3 = "" , "" , ""
    length = len(contacts)
    if length >= 1:
        contact1 = contacts[0]
        if length >= 2:
            contact2 = contacts[1]
            if length >= 3:
                contact3 = contacts[2]
    if not re.fullmatch(regex, email):
        logger.error("Server encountered an error ! Invalid Email", extra={"request_count": request_count})
        result = "Server encountered an error ! Invalid Email"
        Status = 406
        ans = 0
        return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json', status = Status)
    
    for c in contacts:
        if not re.fullmatch(regex, c):
            logger.error("Server encountered an error ! Invalid Email", extra={"request_count": request_count})
            result = "Server encountered an error ! Invalid Email"
            Status = 406
            ans = 0
            return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json', status = Status)
        

    password = dic["password"]

    crypted_password = hashlib.sha256(password.encode()).hexdigest()
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    query_check = f"SELECT * FROM users WHERE email = '{email}'"
    cursor.execute(query_check)
    if cursor.rowcount != 0:
        logger.error("Server encountered an error ! user already exists for this email", extra={"request_count": request_count})
        result = "Server encountered an error ! user already exists for this email"
        Status = 400
        ans = 0
    else:
        record = (first_name, last_name, age, medicine_name, email, contact1, contact2, contact3, crypted_password, crypted_mac)

        # Check if any rows were returned
        sql = f"""INSERT INTO users (first_name, last_name, age, medicine_name, email, contact1, contact2, contact3, password, crypted_mac) VALUES (%s, %s, %s, %s, %s, %s, %s ,%s, %s, %s)"""
        cursor.execute(sql, record)
        
        if cursor.rowcount != 0:
            sql = f"SELECT id FROM users WHERE email = '{email}'"
            cursor.execute(sql)
            id = cursor.fetchone()[0]
            logger.debug("User added successfuly", extra={"request_count": request_count})
            conn.commit()
            ans = 1
            Status = 200
            result = id
        else:
            ans = 0
            logger.error("Server encountered an error !", extra={"request_count": request_count})
            result = "Server encountered an error !"
            Status = 401

    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json', status = Status)


        





def New_Contact(app, request):#still need to check if only mail or other details: should change accordingly to the database
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
        # first_name = dic["first_name"]
        # last_name = dic["last_name"]
        # phone_number = dic["phone_number"]
    email = dic["email"]
    id = dic["id"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
        #record = (phone_number, email, id, first_name, last_name)
    record = (email, id)

    # Check if any rows were returned
        #sql = f"""INSERT INTO contacts (phone_number, email, id, first_name, last_name) VALUES (%s, %s, %s, %s, %s)"""
    sql = f"""INSERT INTO contacts (email, id) VALUES (%s, %s)"""
    cursor.execute(sql, record)
    
    check = cursor.rowcount
    if check != 0:
        logger.debug("Contact added successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        ans = 0
        logger.error("Server encountered an error !", extra={"request_count": request_count})
        return app.response_class(response=json.dumps({"answer": ans, "result": "Server encountered an error !"}),status = 401, mimetype='application/json')


    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')

"""def Get_Contacts(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    # Check if any rows were returned
    contacts_query = fSELECT first_name, last_name, phone_number, email FROM contacts WHERE id = '{id}'

    cursor.execute(contacts_query)
    contacts_table = cursor.fetchall()
    if cursor.rowcount == 0:
        logger.error("Server encountered an error !", extra={"request_count": request_count})
        ans = 0
        result = "None"
        return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json', status = 401)
        
    else:
        logger.debug("Contacts were found successfuly", extra={"request_count": request_count})
        ans = 1
        result = jsonize(cursor, contacts_table)
    return app.response_class(response=json.dumps({"answer": ans, "result": result}), mimetype='application/json')
"""
def Input_Information(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    vibrations = dic["vibrations"]
    print(vibrations)
    mac = dic["mac"]
    #
    #NEED to process the vibrations
    #for this code is saved in sum_vibrations

    now = datetime.now()
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    dt_string = now.strftime("%Y-%m-%d %H:%M")
    record = (crypted_mac, sum_vibrations, dt_string)
    sql = f"""INSERT INTO vibrations (crypted_mac, dosage_id, date_time) VALUES (%s, %s, %s)"""
    cursor.execute(sql, record)
    check = cursor.rowcount
    if check != 0:
        logger.debug("vibrations were added successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        ans = 0
        logger.error("Server encountered an error !", extra={"request_count": request_count})
        return app.response_class(response=json.dumps({"answer": ans, "result": "Server encountered an error !"}),status = 401, mimetype='application/json')


    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')

def Delete_Information(app, request):#1 if information was deleted, 0 if not
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    time_to_delete = dic["time_to_delete"]#in days
    id = dic["id"]
    time_to_delete = int(time_to_delete)
    cutoff_date = datetime.now() - timedelta(days=time_to_delete)

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    get_crypted_mac = f""" SELECT crypted_mac FROM users where id = '{id}' """
    cursor.execute(get_crypted_mac)
    result_mac = cursor.fetchone()[0]

    query = f"DELETE FROM vibrations WHERE current_time < '{cutoff_date.strftime('%Y/%m/%d %H:%M')} AND id = {result_mac}';"
    cursor.execute(query)
    deleted_rows = cursor.rowcount
    if deleted_rows > 0:
        conn.commit()
        logger.debug("All information that is older than {} days was deleted successfuly.".format(time_to_delete), extra={"request_count": request_count})
        ans = 1
    else:
        logger.debug("There was no information suitable for this time stamp. Nothing was deleted", extra={"request_count": request_count})
        ans = 0

    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')


    
def Input_Alert(app, request):#1 for alert, 0 for no alert ###### notify the app somehow?
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    mac = dic["mac"]
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    
    user_query = f"SELECT id, first_name, last_name, contact1, contact2, contact3 FROM users WHERE crypted_mac = '{crypted_mac}';"
    cursor.execute(user_query)
    user_row = cursor.fetchone()

    if cursor.rowcount !=0:
        user_id = user_row[0]
        user_first_name = user_row[1]
        user_last_name = user_row[2]
        emails = user_row[3:5]
        send_email(emails, user_first_name, user_last_name)
        logger.debug("Emails were sent successfuly", extra={"request_count": request_count})
        ans = 1
    else:
        logger.error("Server encountered an error ! couldn't find the user", extra={"request_count": request_count})
        ans = 0
        return app.response_class(response=json.dumps({"answer": ans, "result": "Server encountered an error ! couldn't find the user"}),status = 401, mimetype='application/json')
        

    cursor.close()
    conn.close()

    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')

def Check_Connection(app, request):#returns 1 if status changed and 0 if not
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})
    print(request.data)
    dic = json.loads(request.data)
    mac = dic["mac"]
    new_status = dic["status"]
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    
    cursor.execute(f"UPDATE users SET status = {new_status} WHERE crypted_mac = '{crypted_mac}'")
    if cursor.rowcount != 0:
        logger.debug("Status was updated successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        logger.debug("Status was remained the same", extra={"request_count": request_count})
        ans = 0
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')

def Get_Status(app, request):# if status is -1- code error 0- no connection, 1- connection, 2- not connection and notified
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)

    cursor.execute(f"SELECT status FROM users WHERE id = {id}")
    if cursor.rowcount != 0:
        logger.debug("Status was retrieved successfuly", extra={"request_count": request_count})
        current_status = cursor.fetchone()[0]

        if current_status == 0:
            cursor.execute(f"UPDATE users SET status = {2} WHERE  id = {id}")
            if cursor.rowcount != 0:
                logger.debug("Status was updated successfuly", extra={"request_count": request_count})
                conn.commit()
            else:
                logger.error("Server encountered an error ! couldn't update status", extra={"request_count": request_count})
                current_status = -1
        elif current_status == 2:
            logger.debug("Status has remained the same", extra={"request_count": request_count})
    else:
        logger.error("Server encountered an error ! couldn't find status for this id", extra={"request_count": request_count})
        current_status = -1
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"status": current_status}), mimetype='application/json')

def Update_Information(app, request):#1 if there was a change 0 if there wasn't
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    email = dic["email"]
    password = dic["password"]
    contacts = dic["contacts"]
    if len(contacts) < 3:
        contacts.append("")
        if len(contacts) < 2:
            contacts.append("")

    print(contacts)
    crypted_password = hashlib.sha256(password.encode()).hexdigest()
    add_passsword = ""
    if not password == "":
        add_passsword = f", password = '{crypted_password}'"
    

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)

    # cursor.execute(f"""UPDATE users SET  first_name = '{first_name}', last_name = '{last_name}', 
    #                phone_number = '{phone_number}', email = '{email}', password = '{password}', current_dosage = {currect_dosage}
    #                WHERE id = {id};""")
    query = f"""UPDATE users SET  first_name = '{first_name}', last_name = '{last_name}', 
                   email = '{email}', contact1 = '{contacts[0]}', contact2 = '{contacts[1]}', contact3 = '{contacts[2]}' """ + add_passsword + f"""
                   WHERE id = {id};"""
    print(query)
    cursor.execute(query)
    if cursor.rowcount != 0:
        logger.debug("Information was updated successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        logger.debug("No new information was added.", extra={"request_count": request_count})
        ans = 0

    cursor.close()
    conn.close()

    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')


def Last_dose(app, request):#returns the last dose: table if found -1 if not found
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute(f"SELECT dosage, date_time FROM dosages WHERE user_id = {id} order by date_time desc")#desc?
    if cursor.rowcount != 0:
        ans = 1
        logger.debug("Last dose was retrieved successfuly", extra={"request_count": request_count})
        tuple_last_dose = cursor.fetchone()
        list_last_dose = list(tuple_last_dose)
        list_last_dose[1] = list_last_dose[1].strftime("%d-%m-%Y %H:%M") # change it back to application format
        date, time = list_last_dose[1].split(" ")
        ret = {"dosage": list_last_dose[0], "date": date, "time": time}

    else:
        last_dose = "Server encountered an error ! couldn't find last dose for this id"
        logger.error(last_dose , extra={"request_count": request_count})
        ans = 0
        ret = {"dosage": "not found", "date": "not found", "time": "not found"}
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans, "result": ret}), mimetype='application/json')


def get_user(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'POST'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    user_id = dic["id"]
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute(f"SELECT * FROM users WHERE id = '{user_id}'")
    user = cursor.fetchone()
    user = jsonize(cursor, user)
    cursor.close()
    conn.close()
    print(user)
    return app.response_class(response=json.dumps({"answer": 1, "user": user}), mimetype='application/json')


def get_doses_history(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'POST'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    user_id = dic["id"]
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute(f"SELECT * FROM dosages WHERE user_id = {user_id} order by date_time desc")
    doses = cursor.fetchall()
    doses = jsonize(cursor, doses)
    ret = []
    for dose in doses:
        print(dose)
        dose["date_time"] = dose["date_time"].strftime("%d-%m-%Y %H:%M") # change it back to application format
        date, time = dose["date_time"].split(" ")
        ret.append({"dosage":dose["dosage"], "date":date, "time":time})
    cursor.close()
    conn.close()
    print(ret)
    return app.response_class(response=json.dumps({"answer": 1, "doses": ret}), mimetype='application/json')

def Input_Dose(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    user_id = dic["id"]
    dosage = dic["dosage"]
    date = dic["date"] #format of dd/mm/yyyy
    time = dic["time"] #format of hh:mm
    formated_date = datetime.strptime(date, "%d-%m-%Y").strftime('%Y-%m-%d')
    formated_date = formated_date + " " + time

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    
    record = (user_id, dosage, formated_date)
    sql = f"insert into dosages (user_id, dosage, date_time) values (%s, %s, %s)"
    cursor.execute(sql, record)
    check = cursor.rowcount
    if check != 0:
        logger.debug("dosage was added successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        ans = 0
        logger.error("Server encountered an error !", extra={"request_count": request_count})

    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans}), mimetype='application/json')


def get_day_info(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})
    print(request.data)
    dic = json.loads(request.data)
    user_id = dic["id"]
    date = dic["date"] 
    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    
    sql = f"SELECT dosage, TIME(date_time) FROM dosages WHERE DATE(date_time)='{date}' AND user_id={user_id}"
    cursor.execute(sql)
    dosages = cursor.fetchall()
    print(dosages)
    dosages = [(d[0], str(d[1])) if isinstance(d[1], timedelta) else d for d in dosages]
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"dosages": dosages}), mimetype='application/json')


def Login(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    email = dic["email"].lower()
    password = dic["password"]
    crypted_password = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute(f"SELECT * FROM users WHERE email = '{email}' AND password = '{crypted_password}'")
    if cursor.rowcount != 0:
        logger.debug("User was found successfuly", extra={"request_count": request_count})
        user = cursor.fetchone()
        user = jsonize(cursor, user)
        if user["password"] == crypted_password:
            logger.debug("Password was correct", extra={"request_count": request_count})
            ans = 1
        else:
            logger.debug("Password was incorrect", extra={"request_count": request_count})
            ans = 0
            user = "None"
    else:
        logger.error("Server encountered an error ! couldn't find user", extra={"request_count": request_count})
        ans = -1
        user = "None"
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans, "user": user}), mimetype='application/json')


def _(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]


    return app.response_class(response=json.dumps({"answer": ans, "user": user}), mimetype='application/json')

def get_week_history(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)

    cursor.execute(f"""SELECT DATE(date_time) AS day, COUNT(*) AS dose_count, GROUP_CONCAT(dosage SEPARATOR ' ') AS dosage
                        FROM dosages
                        WHERE user_id = {id}
                        AND date_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
                        GROUP BY DATE(date_time);""")

    if cursor.rowcount != 0:
        logger.debug("dosages found successfuly!", extra={"request_count": request_count})
        doses = cursor.fetchall()
        ret=[]
        for row in doses:
            day = row[0].strftime("%d-%m-%Y %H:%M") # change it back to application format
            date, time = day.split(" ")

            dose_count = row[1]
            dosage = row[2].split(" ")
            for i in range(len(dosage)):
                dosage[i] = int(dosage[i])
            ret.append({"dosages":dosage, "dosage_count":dose_count, "date":date})
        ans = 1
    else:
        logger.debug("dosages not found!", extra={"request_count": request_count})
        ans = 0
        ret = "None"
    print(ret)
    cursor.close()
    conn.close()
    return app.response_class(response=json.dumps({"answer": ans, "doses": ret}), mimetype='application/json')

def reset_password(app, request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    email = dic["email"].lower()
    password = dic["password"]
    crypted_password = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute(f"UPDATE users SET password = '{crypted_password}' WHERE email = '{email}'")
    if cursor.rowcount != 0:
        logger.debug("Password was updated successfuly", extra={"request_count": request_count})
        user = "Updated"
        conn.commit()
        ans = 1
    else:
        logger.error("Server encountered an error ! couldn't update password", extra={"request_count": request_count})
        ans = 0
        user = "None"
    cursor.close()
    conn.close()

    return app.response_class(response=json.dumps({"answer": ans, "user": user}), mimetype='application/json')
