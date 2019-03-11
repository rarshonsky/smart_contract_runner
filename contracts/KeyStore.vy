# @title PGPKey

# Structs
struct KeyData:
    first_name: string[20]
    last_name: string[20]
    key: string[1024]
    verified: bool
    
# Global Variables
owner: address
key_table: map(string[100], KeyData)

@public
def __init__():
    self.owner = msg.sender

@public
@constant
def getKey(email: string[100]) -> string[1024]:
	return self.key_table[email].key

@public
@constant
def getName(email: string[100]) -> string[100]:
	return concat(self.key_table[email].first_name, ' ', self.key_table[email].last_name)

@public
@constant
def getVerified(email: string[100]) -> bool:
	return self.key_table[email].verified

@public
def addKey(email: string[100], first_name: string[20], last_name: string[20], key: string[1024]) -> bool:
	key_data: KeyData
	key_data.first_name = first_name
	key_data.last_name = last_name
	key_data.key = key
	self.key_table[email] = key_data
	return True