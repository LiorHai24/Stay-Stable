import smtplib
import mysql.connector
from flask import json
from datetime import datetime ,timedelta
import logging
import os
import hashlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    smtp_port = 587 #2525 587 465 25 matan said 443
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
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    json_data=[]
    for result in result:
        json_data.append(dict(zip(row_headers,result)))
    return json.dumps(json_data)

def route_test(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    response = json.loads(request.data)
    print(response)
    return response

def Get_Vibrations(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic['id']
    time_to_get = dic['time_to_get']

    conn = get_db_connection()
    cursor = conn.cursor()
    mac_query = f"SELECT crypted_mac FROM users WHERE id = {id}"
    cursor.execute(mac_query)
    if cursor.rowcount != 0:
        crypted_mac = cursor.fetchall()[0]
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
            return 0
        if ans:
            return jsonize(cursor, result_users)
    else:
        logger.error("Server encountered an error ! couldn't find user", extra={"request_count": request_count})
        return 0 # if the user is not in the database   

    

def New_User(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    mac = dic["mac"]
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    currect_dosage = dic["current_dosage"]
    email = dic["email"]
    password = dic["password"]

    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Define a record to insert
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    record = (first_name, last_name, phone_number, email, password, currect_dosage, crypted_mac)

    # Check if any rows were returned
    sql = f"""INSERT INTO users (first_name, last_name, phone_number, email, password, current_dosage, crypted_mac) VALUES (%s, %s, %s, %s, %s, %s, %s)"""

    cursor.execute(sql, record)
    check = cursor.rowcount
    if check != 0:
        logger.debug("User added successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        ans = 0
        logger.error("Server encountered an error !", extra={"request_count": request_count})

    cursor.close()
    conn.close()
    return ans





def New_Contact(request):#still need to check if only mail or other details: should change accordingly to the database
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
    cursor = conn.cursor()
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

    cursor.close()
    conn.close()
    return ans

def Get_Contacts(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    # Create a cursor object to execute SQL queries
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if any rows were returned
    contacts_query = f"""SELECT first_name, last_name, phone_number, email FROM contacts WHERE id = '{id}'"""

    cursor.execute(contacts_query)
    contacts_table = cursor.fetchall()
    if cursor.rowcount == 0:
        logger.error("Server encountered an error !", extra={"request_count": request_count})
        return 0 # if the user has no contacts
    else:
        logger.debug("Contacts were found successfuly", extra={"request_count": request_count})
        return jsonize(cursor, contacts_table)

def Input_Information(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    vibrations = dic["vibrations"]
    mac = dic["mac"]
    #
    #NEED to process the vibrations
    #for this code is saved in sum_vibrations

    now = datetime.now()
    conn = get_db_connection()
    cursor = conn.cursor()
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

    cursor.close()
    conn.close()
    return ans

def Delete_Information(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

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
    deleted_rows = cursor.rowcount
    if deleted_rows > 0:
        conn.commit()
        logger.debug("All information that is older than {} days was deleted successfuly.".format(time_to_delete), extra={"request_count": request_count})
        ans = 1
    else:
        logger.debug("There was no information suitable for this time stamp.", extra={"request_count": request_count})
        ans = 0

    cursor.close()
    conn.close()
    return ans


    
def Input_Alert(request):#1 for alert, 0 for no alert
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    mac = dic["mac"]
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor()
    
    user_query = f"SELECT id, first_name, last_name FROM users WHERE crypted_mac = '{crypted_mac}';"
    cursor.execute(user_query)
    user_row = cursor.fetchall()

    if cursor.rowcount !=0:
        user_id = user_row[0][0]
        user_first_name = user_row[0][1]
        user_last_name = user_row[0][2]
        contacts_query = f"SELECT email FROM contacts WHERE id = {user_id}"
        cursor.execute(contacts_query)#the table
        if cursor.rowcount != 0:
            contacts_table = cursor.fetchall()
            send_email(contacts_table, user_first_name, user_last_name)
            logger.debug("Emails were sent successfuly", extra={"request_count": request_count})
            ans = 1
        else:
            logger.error("Server encountered an error ! couldn't find mail", extra={"request_count": request_count})
            ans = 0
    else:
        logger.error("Server encountered an error ! couldn't find the user", extra={"request_count": request_count})
        ans = 0

    cursor.close()
    conn.close()

    return ans

def Check_Connection(request):#returns 1 if status changed and 0 if not
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    mac = dic["mac"]
    new_status = dic["status"]
    crypted_mac = hashlib.sha256(mac.encode()).hexdigest()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"UPDATE users SET status = {new_status} WHERE crypted_mac = '{crypted_mac}'")
    if cursor.rowcount != 0:
        logger.debug("Status was updated successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        logger.debug("Status was remained the same", extra={"request_count": request_count})#not sure what method to use
        ans = 0
    cursor.close()
    conn.close()
    return ans

def Get_Status(request):# if status is -1- code error 0- no connection, 1- connection, 2- not connection and notified
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(f"SELECT status FROM users WHERE id = {id}")
    if cursor.rowcount != 0:
        logger.debug("Status was retrieved successfuly", extra={"request_count": request_count})
        current_status = cursor.fetchall()[0][0]

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
    return current_status

def Update_Information(request):#1 if there was a change 0 if there wasn't
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    first_name = dic["first_name"]
    last_name = dic["last_name"]
    phone_number = dic["phone_number"]
    #currect_dosage = dic["current_dosage"] #check with gal if neccesary
    email = dic["email"]
    password = dic["password"]

    conn = get_db_connection()
    cursor = conn.cursor()

    # cursor.execute(f"""UPDATE users SET  first_name = '{first_name}', last_name = '{last_name}', 
    #                phone_number = '{phone_number}', email = '{email}', password = '{password}', current_dosage = {currect_dosage}
    #                WHERE id = {id};""")
    cursor.execute(f"""UPDATE users SET  first_name = '{first_name}', last_name = '{last_name}', 
                   phone_number = '{phone_number}', email = '{email}', password = '{password}'
                   WHERE id = {id};""")
    if cursor.rowcount != 0:
        logger.debug("Information was updated successfuly", extra={"request_count": request_count})
        conn.commit()
        ans = 1
    else:
        logger.debug("No new information was added.", extra={"request_count": request_count})
        ans = 0

    cursor.close()
    conn.close()

    return ans


def Last_dose(request):#returns the last dose: table if found -1 if not found
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    id = dic["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT id, date_time FROM dosages WHERE user_id = {id} order by date_time desc")#desc?
    if cursor.rowcount != 0:
        logger.debug("Last dose was retrieved successfuly", extra={"request_count": request_count})
        last_dose = cursor.fetchall()[0]
    else:
        logger.error("Server encountered an error ! couldn't find last dose for this id", extra={"request_count": request_count})
        last_dose = -1
    cursor.close()
    conn.close()
    return last_dose

def Input_Dose(request):
    global request_count
    request_count += 1
    logger.info("Incoming request | #{} | resource: {} | HTTP Verb {}".format(request_count, '/logs/level', 'GET'), extra={"request_count": request_count})

    dic = json.loads(request.data)
    user_id = dic["id"]
    dosage = dic["dosage"]
    date_time = dic["date_time"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT id FROM dosages WHERE user_id = {user_id} order by date_time desc")
    if cursor.rowcount != 0:
        logger.debug("Last dose was retrieved successfuly", extra={"request_count": request_count})
        last_dosage = cursor.fetchall()[0][0]
    else:
        logger.debug("No previous dosages were found, so starting from 1", extra={"request_count": request_count})
        last_dosage = 0
    last_dosage = last_dosage + 1 #for this dosage
    record =(user_id, last_dosage, dosage, date_time)
    sql = f"insert into dosages (user_id, id, dosage, date_time) values (%s, %s, %s, %s)"
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
    return ans

