import os
from twilio.rest import Client

account_sid = "ACfdfe714a55c2098020fd56ae05216c6b"
auth_token = "513f94074b36cf1bf5fdda89edfe9e43"
client = Client(account_sid, auth_token)
message = client.messages.create(
        body=f'ATTENTION! lior hai fell! please check that s/he is ok? ',
        from_="+13203177840",
        to="+972505818855"
    )
print(message.sid)