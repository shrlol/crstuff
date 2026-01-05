import secrets
import string

def generate_rc4_key(length=38):
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))

key = generate_rc4_key()
print("RC4 Key:\n" key)
