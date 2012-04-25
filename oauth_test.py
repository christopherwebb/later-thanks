import random
import time
import hmac
import hashlib

def generate_signature():
    return hmac.new(key,msg)

oauth_nonce = '%f%f%f%f%f%f%f%f' % (random.random(),random.random(),random.random(),random.random(),random.random(),random.random(),random.random(),random.random())

oauth_consumer_key = '5qsz1qd02wkh3we'

oauth_signature_method = 'HMAC-SHA1'

url = 'https://api.dropbox.com/1/oauth/request_token'

oauth_timestamp = int(time.time())

oauth_version = '1.0'

oauth_signature = generate_signature()

urllib.urlencode({
	'oauth_consumer_key'	 : oauth_consumer_key,
	'oauth_signature_method' : oauth_signature_method,
	'oauth_signature'	 : '',
	'oauth_timestamp'	 : ,
	'oauth_nonce'		 : ,
	'oauth_version'		 : ,
	})