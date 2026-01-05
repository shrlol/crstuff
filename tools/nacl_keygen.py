import secrets

def generate_nacl_secret_key():
    return secrets.token_bytes(32).hex().upper()

key = generate_nacl_secret_key()
print("NaCl Key:\n" key)