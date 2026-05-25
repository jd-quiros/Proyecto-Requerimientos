# back/app/servicios/decoradores.py
from functools import wraps

from flask import jsonify, request

from .token import verificar_token


def token_requerido(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Token requerido"}), 401
        try:
            payload = verificar_token(token)
            request.usuario_id = int(payload["sub"])  # ← Convertir a entero
            request.usuario_rol = payload["rol"]
        except:
            return jsonify({"error": "Token inválido o expirado"}), 401
        return f(*args, **kwargs)

    return decorated
