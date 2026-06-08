# back/app/routes/auth.py
from flask import Blueprint, jsonify, request, session

from ..db.conexion import db
from ..models.usuario import Usuario
from ..servicios.hash import check_password, hash_password
from ..servicios.token import generar_token, verificar_token

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
#con esta linea funciona el inicio de sesion
@auth_bp.route("/api/login", methods=["POST"])
def login():
    datos = request.get_json()
    if not datos:
        return jsonify({"error":"JSON invalido"}),400
    email = datos.get("email").strip().lower()
    password = datos.get("password")
    if(not email or not password): 
        return jsonify({"error":"Debe ingresar todos los datos"}),400
    usuario = Usuario.query.filter_by(email = email).first()
    if(not usuario): 
        return jsonify({"error":"Credenciales invalidas"}),401
    
    if(not check_password(password,usuario.password_hash)):
        return jsonify({"error":"Credenciales invalidas"}),401
    
    token = generar_token(usuario.id,usuario.rol)
    return jsonify({
        "mensaje": "Login exitoso",
        "token": token,
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
        },
    }), 200


def _usuario_desde_token():
    auth = request.headers.get("Authorization", "")
    try:
        token = auth.split(" ")[1]
        payload = verificar_token(token)
        return int(payload["sub"])
    except Exception:
        return None


@auth_bp.route("/api/perfil", methods=["GET"])
def ver_perfil():
    id_usuario = _usuario_desde_token()
    if not id_usuario:
        return jsonify({"error": "Token invalido"}), 401
    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
    }), 200


@auth_bp.route("/api/perfil", methods=["PUT"])
def editar_perfil():
    id_usuario = _usuario_desde_token()
    if not id_usuario:
        return jsonify({"error": "Token invalido"}), 401
    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    datos = request.get_json()

    nombre = datos.get("nombre", "").strip()
    email = datos.get("email", "").strip().lower()
    password_actual = datos.get("password_actual", "")
    password_nueva = datos.get("password_nueva", "")

    if nombre:
        usuario.nombre = nombre

    if email and email != usuario.email:
        if Usuario.query.filter_by(email=email).first():
            return jsonify({"error": "Ese correo ya está en uso"}), 409
        usuario.email = email

    if password_nueva:
        if not password_actual:
            return jsonify({"error": "Debes ingresar tu contraseña actual"}), 400
        if not check_password(password_actual, usuario.password_hash):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401
        if len(password_nueva) < 6:
            return jsonify({"error": "La nueva contraseña debe tener al menos 6 caracteres"}), 400
        usuario.password_hash = hash_password(password_nueva)

    db.session.commit()
    return jsonify({
        "mensaje": "Perfil actualizado",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
        },
    }), 200


