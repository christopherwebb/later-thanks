import random
import time
import hmac
import hashlib
import base64
import urllib
import urllib2

def generate_signature(params, consumer_secret, token_secret):

	def sort_func(x, y):
		x_key = x[0]
		x_val = x[1]
		y_key = y[0]
		y_val = y[1]

		if x_key < y_key : return -1
		elif x_key > y_key : return 1
		else:
			if x_val < y_val : return -1
			elif x_val > y_val : return 1
			else : return 0

	signature_removed = {key : data for key,data in params.iteritems() if key is not 'oauth_signature'}
	sorted_params = sorted(signature_removed.iteritems(), sort_func)

	encoded_param_list = ["%s=%s" % (urllib.quote(key),urllib.quote(val)) for (key,val) in sorted_params]
	
	signature_base_list = [
		'POST',
		urllib.quote(url),
		urllib.quote('&'.join(encoded_param_list))
	]
	signature_base_string = '&'.join(signature_base_list)

	key = "%s&%s" % (urllib.quote(consumer_secret),urllib.quote(token_secret))

	return urllib.quote(base64.standard_b64encode(hmac.new(key,signature_base_string,hashlib.sha1).digest()))

oauth_nonce = '%d' % random.randint(0, 2147483647)

oauth_consumer_key = '5qsz1qd02wkh3we'

oauth_signature_method = 'HMAC-SHA1'

url = 'https://api.dropbox.com/1/oauth/request_token'

oauth_timestamp = '%s' % int(time.time())

oauth_version = '1.0'

consumer_secret = 'i6mx2zs2ecl8y7p'

url_params = {
	'oauth_consumer_key'	 : oauth_consumer_key,
	'oauth_signature_method' : oauth_signature_method,
	'oauth_signature'	 : 'replace_later',
	'oauth_timestamp'	 : oauth_timestamp,
	'oauth_nonce'		 : oauth_nonce,
	'oauth_version'		 : oauth_version,
}

url_params['oauth_signature'] = generate_signature(url_params, consumer_secret, '')

encodedParams=urllib.urlencode(url_params)
