# back/app/servicios/hash.py
import bcrypt


def hash_password(password: str) -> str:
    """Convierte una contraseña en texto plano a un hash seguro."""
    # bcrypt genera un salt automáticamente y lo incluye en el hash
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Verifica si una contraseña coincide con su hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
