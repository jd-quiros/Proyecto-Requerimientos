from flask import Blueprint, jsonify, request

from ..db.conexion import db
from ..models.usuario import Usuario
from ..models.tienda import Tienda
from ..models.producto import Producto
from ..models.pedido import Pedido, PedidoProducto
from ..servicios.decoradores import token_requerido

admin_bp = Blueprint("admin", __name__)


def solo_admin(f):
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if request.usuario_rol != "admin":
            return jsonify({"error": "Acceso restringido a administradores"}), 403
        return f(*args, **kwargs)
    return wrapper


# ── Dashboard general ─────────────────────────────────────────
@admin_bp.route("/api/admin/stats", methods=["GET"])
@token_requerido
@solo_admin
def stats_generales():
    # Usuarios por rol
    total_clientes  = Usuario.query.filter_by(rol="cliente").count()
    total_vendedores = Usuario.query.filter_by(rol="vendedor").count()
    total_admins    = Usuario.query.filter_by(rol="admin").count()

    # Tiendas por estado
    tiendas_activas    = Tienda.query.filter_by(estado="activa").count()
    tiendas_pendientes = Tienda.query.filter_by(estado="pendiente").count()
    tiendas_suspendidas = Tienda.query.filter_by(estado="suspendida").count()

    # Revenue total
    revenue_total = db.session.query(
        db.func.sum(Pedido.monto_total)
    ).scalar() or 0

    # Producto más vendido (por unidades)
    mejor_producto = db.session.query(
        PedidoProducto.nombre_producto,
        db.func.sum(PedidoProducto.cantidad).label("total_vendido")
    ).group_by(PedidoProducto.nombre_producto)\
     .order_by(db.func.sum(PedidoProducto.cantidad).desc())\
     .first()

    # Tienda con más ventas (por revenue)
    filas = db.session.query(
        Producto.tienda_id,
        db.func.sum(PedidoProducto.precio * PedidoProducto.cantidad).label("revenue")
    ).join(PedidoProducto, PedidoProducto.id_producto == Producto.id)\
     .group_by(Producto.tienda_id)\
     .order_by(db.func.sum(PedidoProducto.precio * PedidoProducto.cantidad).desc())\
     .first()

    top_tienda = None
    if filas:
        t = Tienda.query.get(filas.tienda_id)
        top_tienda = {"nombre": t.nombre if t else "—", "revenue": float(filas.revenue)}

    return jsonify({
        "usuarios": {
            "clientes": total_clientes,
            "vendedores": total_vendedores,
            "admins": total_admins,
            "total": total_clientes + total_vendedores + total_admins,
        },
        "tiendas": {
            "activas": tiendas_activas,
            "pendientes": tiendas_pendientes,
            "suspendidas": tiendas_suspendidas,
            "total": tiendas_activas + tiendas_pendientes + tiendas_suspendidas,
        },
        "revenue_total": float(revenue_total),
        "mejor_producto": {
            "nombre": mejor_producto[0] if mejor_producto else None,
            "unidades": int(mejor_producto[1]) if mejor_producto else 0,
        },
        "top_tienda": top_tienda,
    }), 200


# ── Usuarios ──────────────────────────────────────────────────
@admin_bp.route("/api/admin/usuarios", methods=["GET"])
@token_requerido
@solo_admin
def listar_usuarios():
    usuarios = Usuario.query.order_by(Usuario.id).all()
    return jsonify([{
        "id": u.id,
        "nombre": u.nombre,
        "email": u.email,
        "rol": u.rol,
    } for u in usuarios]), 200


@admin_bp.route("/api/admin/usuarios/<int:uid>", methods=["PUT"])
@token_requerido
@solo_admin
def editar_usuario(uid):
    if uid == request.usuario_id:
        return jsonify({"error": "No puedes modificar tu propia cuenta"}), 400
    usuario = Usuario.query.get_or_404(uid)
    datos = request.get_json()
    if "rol" in datos and datos["rol"] in ("cliente", "vendedor", "admin"):
        usuario.rol = datos["rol"]
    if "nombre" in datos and datos["nombre"].strip():
        usuario.nombre = datos["nombre"].strip()
    db.session.commit()
    return jsonify({"mensaje": "Usuario actualizado", "rol": usuario.rol}), 200


@admin_bp.route("/api/admin/usuarios/<int:uid>", methods=["DELETE"])
@token_requerido
@solo_admin
def eliminar_usuario(uid):
    if uid == request.usuario_id:
        return jsonify({"error": "No puedes eliminarte a ti mismo"}), 400
    usuario = Usuario.query.get_or_404(uid)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensaje": "Usuario eliminado"}), 200


# ── Tiendas ───────────────────────────────────────────────────
@admin_bp.route("/api/admin/tiendas", methods=["GET"])
@token_requerido
@solo_admin
def listar_tiendas_admin():
    tiendas = Tienda.query.order_by(Tienda.fecha_creacion.desc()).all()
    return jsonify([{
        "id": t.id,
        "nombre": t.nombre,
        "categoria": t.categoria,
        "estado": t.estado,
        "vendedor_nombre": t.vendedor.nombre if t.vendedor else "—",
        "vendedor_email": t.vendedor.email if t.vendedor else "—",
        "cantidad_productos": len(t.productos),
        "fecha_creacion": t.fecha_creacion.isoformat() if t.fecha_creacion else None,
    } for t in tiendas]), 200


@admin_bp.route("/api/admin/tiendas/<int:tid>/estado", methods=["PUT"])
@token_requerido
@solo_admin
def cambiar_estado_tienda(tid):
    tienda = Tienda.query.get_or_404(tid)
    datos = request.get_json()
    nuevo_estado = datos.get("estado")
    if nuevo_estado not in ("activa", "pendiente", "suspendida"):
        return jsonify({"error": "Estado inválido"}), 400
    tienda.estado = nuevo_estado
    db.session.commit()
    return jsonify({"mensaje": "Estado actualizado", "estado": tienda.estado}), 200


# ── Productos ─────────────────────────────────────────────────
@admin_bp.route("/api/admin/productos", methods=["GET"])
@token_requerido
@solo_admin
def listar_productos_admin():
    productos = Producto.query.order_by(Producto.id.desc()).all()
    return jsonify([{
        "id": p.id,
        "nombre": p.nombre,
        "precio": p.precio,
        "stock": p.stock,
        "tienda_nombre": p.tienda.nombre if p.tienda else "—",
    } for p in productos]), 200


@admin_bp.route("/api/admin/productos/<int:pid>", methods=["DELETE"])
@token_requerido
@solo_admin
def eliminar_producto_admin(pid):
    producto = Producto.query.get_or_404(pid)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado"}), 200
