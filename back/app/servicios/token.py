# back/app/servicios/token.py
# back/app/servicios/token.py
import datetime

import jwt
from flask import current_app


def generar_token(usuario_id: int, rol: str) -> str:
    """Genera un token JWT con el id y rol del usuario."""
    payload = {
        "sub": str(usuario_id),  # ← Convertir a string
        "rol": rol,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=current_app.config["JWT_EXPIRATION_HOURS"]),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def verificar_token(token: str) -> dict:
    """Verifica un token JWT y devuelve su contenido."""
    payload = jwt.decode(
        token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
    )
    return payload
