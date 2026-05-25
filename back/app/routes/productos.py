# back/app/routes/productos.py
from flask import Blueprint, jsonify, request

from ..db.conexion import db
from ..models.producto import Producto
from ..models.tienda import Tienda
from ..servicios.decoradores import token_requerido

productos_bp = Blueprint("productos", __name__)


# ──────────────────────────────────────────────────────────────
# GET /api/productos — Listar productos (público, con filtros opcionales)
# ──────────────────────────────────────────────────────────────
@productos_bp.route("/api/productos", methods=["GET"])
def listar_productos():
    categoria = request.args.get("categoria")
    busqueda = request.args.get("busqueda")
    tienda_id = request.args.get("tienda_id")

    query = Producto.query.join(Tienda).filter(Tienda.estado == "activa")

    if tienda_id:
        query = query.filter(Producto.tienda_id == tienda_id)
    if categoria:
        query = query.filter(Tienda.categoria == categoria)
    if busqueda:
        query = query.filter(Producto.nombre.ilike(f"%{busqueda}%"))

    productos = query.all()
    return jsonify([p.to_dict() for p in productos]), 200


# ──────────────────────────────────────────────────────────────
# GET /api/productos/<id> — Ver detalle de un producto
# ──────────────────────────────────────────────────────────────
@productos_bp.route("/api/productos/<int:id>", methods=["GET"])
def ver_producto(id):
    producto = Producto.query.get_or_404(id)
    data = producto.to_dict()
    data["tienda"] = producto.tienda.to_dict() if producto.tienda else None
    return jsonify(data), 200


# ──────────────────────────────────────────────────────────────
# POST /api/productos — Crear producto (solo vendedor)
# ──────────────────────────────────────────────────────────────
@productos_bp.route("/api/productos", methods=["POST"])
@token_requerido
def crear_producto():
    if request.usuario_rol != "vendedor":
        return jsonify({"error": "Solo los vendedores pueden crear productos"}), 403

    tienda = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()
    if not tienda:
        return jsonify({"error": "Primero debes crear una tienda"}), 400
    if tienda.estado != "activa":
        return (
            jsonify({"error": "Tu tienda debe estar activa para publicar productos"}),
            400,
        )

    datos = request.get_json()
    nombre = datos.get("nombre", "").strip()
    if not nombre:
        return jsonify({"error": "El nombre del producto es obligatorio"}), 400

    precio = datos.get("precio")
    if precio is None or precio < 0:
        return jsonify({"error": "El precio debe ser un número positivo"}), 400

    producto = Producto(
        nombre=nombre,
        descripcion=datos.get("descripcion", "").strip(),
        precio=precio,
        stock=datos.get("stock", 0),
        imagen=datos.get("imagen", "").strip(),
        tienda_id=tienda.id,
    )
    db.session.add(producto)
    db.session.commit()

    return jsonify(producto.to_dict()), 201


# ──────────────────────────────────────────────────────────────
# PUT /api/productos/<id> — Editar producto (solo dueño)
# ──────────────────────────────────────────────────────────────
@productos_bp.route("/api/productos/<int:id>", methods=["PUT"])
@token_requerido
def editar_producto(id):
    producto = Producto.query.get_or_404(id)
    tienda = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()

    if not tienda or producto.tienda_id != tienda.id:
        return jsonify({"error": "No tienes permiso para editar este producto"}), 403

    datos = request.get_json()
    if "nombre" in datos:
        producto.nombre = datos["nombre"].strip()
    if "descripcion" in datos:
        producto.descripcion = datos["descripcion"].strip()
    if "precio" in datos:
        producto.precio = datos["precio"]
    if "stock" in datos:
        producto.stock = datos["stock"]
    if "imagen" in datos:
        producto.imagen = datos["imagen"].strip()

    db.session.commit()
    return jsonify(producto.to_dict()), 200


# ──────────────────────────────────────────────────────────────
# DELETE /api/productos/<id> — Eliminar producto (solo dueño)
# ──────────────────────────────────────────────────────────────
@productos_bp.route("/api/productos/<int:id>", methods=["DELETE"])
@token_requerido
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    tienda = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()

    if not tienda or producto.tienda_id != tienda.id:
        return jsonify({"error": "No tienes permiso para eliminar este producto"}), 403

    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado"}), 200
