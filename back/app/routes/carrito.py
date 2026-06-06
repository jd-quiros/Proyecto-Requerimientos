from models import carrito, producto_carrito, producto, usuario, tienda
from flask import Blueprint, jsonify, session, request
from db.conexion import db

carrito_bp = Blueprint("carrito", __name__)
def crear_carrito(id_usuario):
    nuevo = carrito(
        id_usuario=id_usuario,
        monto=0
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

@carrito_bp.route("/", methods=["GET"])
def ver_carrito():
    id_usuario = session.get("id_usuario")

    if not id_usuario:
        return jsonify({"error": "Sesion invalida"}), 401

    user = usuario.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.rol != "cliente":
        return jsonify({
            "error": "Su rol no tiene acceso a estas funciones de la aplicacion"
        }), 401

    krrito = carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not krrito:
        krrito = crear_carrito(id_usuario)

    productos = producto_carrito.query.filter_by(
        id_carrito=krrito.id
    ).all()

    return jsonify([
        p.to_dict()
        for p in productos
    ])


@carrito_bp.route("/eliminar/<int:id_producto>", methods=["DELETE"])
def eliminar_producto(id_producto):
    id_usuario = session.get("id_usuario")
    if not id_usuario:
        return jsonify({"error": "Sesion invalida"}), 401

    krrito = carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not krrito:
        return jsonify({
            "error": "Usted no tiene un carrito asignado"
        }), 400

    objeto = producto_carrito.query.filter_by(
        id_carrito=krrito.id,
        id_producto=id_producto
    ).first()

    if not objeto:
        return jsonify({
            "error": "Producto no encontrado en el carrito"
        }), 404

    product = producto.query.filter_by(
        id_producto=id_producto
    ).first()

    krrito.monto -= product.precio * objeto.cantidad

    db.session.delete(objeto)
    db.session.commit()

    return jsonify({
        "mensaje": "Producto eliminado del carrito exitosamente"
    }), 200


@carrito_bp.route("/agregar/<int:id_producto>", methods=["POST"])
def agregar_producto(id_producto):
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "JSON invalido"}), 400

    cantidad = datos.get("cantidad")

    if not cantidad or cantidad <= 0:
        return jsonify({"error": "Cantidad invalida"}), 400

    product = producto.query.filter_by(
        id_producto=id_producto
    ).first()

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    if cantidad > product.stock:
        return jsonify({"error": "No hay suficientes unidades"}), 400

    id_usuario = session.get("id_usuario")

    if not id_usuario:
        return jsonify({"error": "Sesion invalida"}), 401

    carrito_usuario = carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not carrito_usuario:
        carrito_usuario = crear_carrito(id_usuario)

    existente = producto_carrito.query.filter_by(
        id_carrito=carrito_usuario.id,
        id_producto=id_producto
    ).first()

    if existente:
        if existente.cantidad + cantidad > product.stock:
            return jsonify({
                "error": "No hay suficientes unidades"
            }), 400

        existente.cantidad += cantidad

    else:
        nuevo = producto_carrito(
            id_producto=id_producto,
            id_carrito=carrito_usuario.id,
            cantidad=cantidad
        )

        db.session.add(nuevo)

    carrito_usuario.monto += product.precio * cantidad

    db.session.commit()

    return jsonify({
        "mensaje": "Producto agregado al carrito"
    }), 201