# back/app/routes/auth.py
from flask import Blueprint, jsonify, request

from ..db.conexion import db
from ..models.usuario import Usuario
from ..servicios.hash import check_password, hash_password
from ..servicios.token import generar_token

# PRIMERO se define el Blueprint
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/registro", methods=["POST"])
def registro():
    datos = request.get_json()

    nombre = datos.get("nombre", "").strip()
    email = datos.get("email", "").strip().lower()
    password = datos.get("password", "")
    rol = datos.get("rol", "cliente").strip().lower()

    if not nombre or not email or not password:
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    if rol not in ["cliente", "vendedor"]:
        return jsonify({"error": 'Rol inválido. Debe ser "cliente" o "vendedor"'}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "El correo ya está registrado"}), 409

    nuevo = Usuario(
        nombre=nombre, email=email, password_hash=hash_password(password), rol=rol
    )
    db.session.add(nuevo)
    db.session.commit()

    token = generar_token(nuevo.id, nuevo.rol)

    return (
        jsonify(
            {
                "mensaje": "Registro exitoso",
                "token": token,
                "usuario": {
                    "id": nuevo.id,
                    "nombre": nuevo.nombre,
                    "email": nuevo.email,
                    "rol": nuevo.rol,
                },
            }
        ),
        201,
    )
