# back/app/routes/tiendas.py
from flask import Blueprint, jsonify, request

from ..db.conexion import db
from ..models.tienda import Tienda
from ..models.producto import Producto
from ..models.usuario import Usuario
from ..models.pedido import Pedido, PedidoProducto
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
        estado="pendiente",
        vendedor_id=request.usuario_id,
    )
    db.session.add(tienda)
    db.session.commit()

    return jsonify(tienda.to_dict()), 201


# ──────────────────────────────────────────────────────────────
# PUT /api/tiendas/<id> — Editar tienda (solo el dueño)
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/tiendas/<int:id>", methods=["PUT"])
@token_requerido
def editar_tienda(id):
    tienda = Tienda.query.get_or_404(id)
    if tienda.vendedor_id != request.usuario_id:
        return jsonify({"error": "No tienes permiso para editar esta tienda"}), 403

    datos = request.get_json()
    nombre = datos.get("nombre", "").strip()
    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    existente = Tienda.query.filter(Tienda.nombre == nombre, Tienda.id != id).first()
    if existente:
        return jsonify({"error": "Ya existe una tienda con ese nombre"}), 409

    tienda.nombre = nombre
    tienda.descripcion = datos.get("descripcion", tienda.descripcion or "").strip()
    tienda.categoria = datos.get("categoria", tienda.categoria or "").strip()
    tienda.imagen = datos.get("imagen", tienda.imagen or "").strip()
    db.session.commit()

    return jsonify(tienda.to_dict()), 200


# ──────────────────────────────────────────────────────────────
# GET /api/mis-tiendas — Tiendas propias del vendedor (cualquier estado)
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/mis-tiendas", methods=["GET"])
@token_requerido
def mis_tiendas():
    if request.usuario_rol != "vendedor":
        return jsonify({"error": "Solo los vendedores tienen tiendas"}), 403
    tiendas = Tienda.query.filter_by(vendedor_id=request.usuario_id).all()
    return jsonify([t.to_dict() for t in tiendas]), 200


# ──────────────────────────────────────────────────────────────
# GET /api/mis-pedidos — Pedidos recibidos en la tienda del vendedor
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/mis-pedidos", methods=["GET"])
@token_requerido
def pedidos_de_mi_tienda():
    if request.usuario_rol != "vendedor":
        return jsonify({"error": "Solo para vendedores"}), 403

    tienda = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()
    if not tienda:
        return jsonify({"error": "No tienes una tienda"}), 404

    ids_productos = [p.id for p in tienda.productos]
    if not ids_productos:
        return jsonify([]), 200

    detalles = PedidoProducto.query.filter(
        PedidoProducto.id_producto.in_(ids_productos)
    ).all()

    # Agrupar por pedido
    pedidos = {}
    for d in detalles:
        pedido = d.pedido
        pid = pedido.id
        if pid not in pedidos:
            comprador = Usuario.query.get(pedido.id_usuario)
            pedidos[pid] = {
                "id": pid,
                "fecha": pedido.fecha.isoformat(),
                "comprador_nombre": comprador.nombre if comprador else "—",
                "comprador_email": comprador.email if comprador else "—",
                "productos": [],
                "total_tienda": 0,
            }
        pedidos[pid]["productos"].append({
            "nombre": d.nombre_producto,
            "precio": d.precio,
            "cantidad": d.cantidad,
            "subtotal": d.precio * d.cantidad,
        })
        pedidos[pid]["total_tienda"] += d.precio * d.cantidad

    resultado = sorted(pedidos.values(), key=lambda p: p["fecha"], reverse=True)
    return jsonify(resultado), 200


# ──────────────────────────────────────────────────────────────
# GET /api/mi-tienda/stats — Dashboard del vendedor
# ──────────────────────────────────────────────────────────────
@tiendas_bp.route("/api/mi-tienda/stats", methods=["GET"])
@token_requerido
def stats_mi_tienda():
    if request.usuario_rol != "vendedor":
        return jsonify({"error": "Solo para vendedores"}), 403

    tienda = Tienda.query.filter_by(vendedor_id=request.usuario_id).first()
    if not tienda:
        return jsonify({"error": "No tienes una tienda"}), 404

    ids_productos = [p.id for p in tienda.productos]

    if not ids_productos:
        return jsonify({
            "revenue_total": 0,
            "total_pedidos": 0,
            "mejor_producto": None,
            "stock_bajo": [],
        }), 200

    detalles = PedidoProducto.query.filter(
        PedidoProducto.id_producto.in_(ids_productos)
    ).all()

    revenue_total = sum(d.precio * d.cantidad for d in detalles)
    total_pedidos = len({d.id_pedido for d in detalles})

    # Producto más vendido
    ventas_por_producto = {}
    for d in detalles:
        ventas_por_producto[d.nombre_producto] = ventas_por_producto.get(d.nombre_producto, 0) + d.cantidad
    mejor = max(ventas_por_producto.items(), key=lambda x: x[1]) if ventas_por_producto else None

    # Productos con stock bajo (< 5)
    stock_bajo = [
        {"nombre": p.nombre, "stock": p.stock}
        for p in tienda.productos
        if p.stock < 5
    ]

    return jsonify({
        "revenue_total": revenue_total,
        "total_pedidos": total_pedidos,
        "mejor_producto": {"nombre": mejor[0], "unidades": mejor[1]} if mejor else None,
        "stock_bajo": stock_bajo,
    }), 200
