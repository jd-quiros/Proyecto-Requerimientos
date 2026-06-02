# back/app/routes/tiendas.py
from flask import Blueprint, jsonify, request

from ..db.conexion import db
from ..models.tienda import Tienda
from ..servicios.decoradores import token_requerido

tiendas_bp = Blueprint("tiendas", __name__)


# ──────────────────────────────────────────────────────────────
# GET /api/tiendas — Listar todas las tiendas activas (público)
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/tiendas", methods=["GET"])
def listar_tiendas():
    tiendas = Tienda.query.filter_by(estado="activa").all()
    return jsonify([t.to_dict() for t in tiendas]), 200


# ──────────────────────────────────────────────────────────────
# GET /api/tiendas/<id> — Ver una tienda con sus productos
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/tiendas/<int:id>", methods=["GET"])
def ver_tienda(id):
    tienda = Tienda.query.get_or_404(id)
    productos = [p.to_dict() for p in tienda.productos]
    data = tienda.to_dict()
    data["productos"] = productos
    return jsonify(data), 200


# ──────────────────────────────────────────────────────────────
# POST /api/tiendas — Crear tienda (solo vendedor)
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/tiendas", methods=["POST"])
@token_requerido
def crear_tienda():
    if request.usuario_rol != "vendedor":
        return jsonify({"error": "Solo los vendedores pueden crear tiendas"}), 403

    #existente = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()
    #if existente:
    #    return jsonify({"error": "Ya tienes una tienda creada"}), 409

    datos = request.get_json()
    nombre = datos.get("nombre", "").strip()
    if not nombre:
        return jsonify({"error": "El nombre de la tienda es obligatorio"}), 400

    if Tienda.query.filter_by(nombre=nombre).first():
        return jsonify({"error": "Ya existe una tienda con ese nombre"}), 409

    tienda = Tienda(
        nombre=nombre,
        descripcion=datos.get("descripcion", "").strip(),
        categoria=datos.get("categoria", "General").strip(),
        imagen=datos.get("imagen", "").strip(),
        estado="activa",
        vendedor_id=request.usuario_id,
    )
    db.session.add(tienda)
    db.session.commit()

    print("TIENDA CREADA:")
    print(tienda.to_dict())

    return jsonify(tienda.to_dict()), 201
