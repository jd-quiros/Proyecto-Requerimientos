from models import carrito, producto_carrito,producto,usuario
from flask import Blueprint,jsonify,session,request
from db.conexion import db


carrito_bp = Blueprint("carrito",__name__)
@carrito_bp.route("/",methods = ["GET"])
def ver_carrito(id_usuario):
    usuario = usuario.query.filter_by(
        id_usuario = id_usuario
    )
    if usuario.rol != "cliente": return jsonify({"error":"Su rol no tiene acceso a estas funciones de la aplicacion"}),401
    carrito = carrito.query.filter_by(
        id_usuario = id_usuario
    ).first()

    if not carrito:
        return []
    
    productos = producto_carrito.query.filter_by(
        id_carrito = carrito.id_carrito
    ).all()

    return productos
@carrito_bp.route("/eliminar/<int:id_producto>",methods = ["DELETE"])
def eliminar_producto(id_producto):
    id_usuario = session.get("usuario_id")
    krrito = carrito.query.filter_by(
        id_usuario = id_usuario
    ).first()

    if not krrito :
        return jsonify({"error":"Usted no tiene un carrito asignado"}),400
    
    objeto = producto_carrito.query.filter_by(
        id_carrito = krrito.id,
        id_producto = id_producto
    ).first()
    if not objeto: 
        return jsonify({"error":"Producto no encontrado en el carrito"}),404
    db.session.delete(objeto)
    db.session.commit()
    return jsonify({"mensaje":"Producto eliminado del carrito exitosamente"}),200

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
        return jsonify({"error": "Usted no tiene carrito asignado"}), 400
    existente = producto_carrito.query.filter_by(
        id_carrito=carrito_usuario.id,
        id_producto=id_producto
    ).first()
    if existente:
        if existente.cantidad + cantidad > product.stock:
            return jsonify({"error": "No hay suficientes unidades"}), 400
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

    return jsonify({"mensaje": "Producto agregado al carrito"}), 201
    