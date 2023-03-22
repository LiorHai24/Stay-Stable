import smtplib
from flask import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
