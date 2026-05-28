# back/app/servicios/hash.py
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Convierte una contraseña en texto plano a un hash seguro."""
    return generate_password_hash(password)

def check_password(password: str, hashed: str) -> bool:
    """Verifica si una contraseña coincide con su hash."""
    return check_password_hash(hashed, password)