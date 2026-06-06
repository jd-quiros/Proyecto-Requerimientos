from models import pedidos,carrito,producto_carrito,producto,notificacion
from flask import Blueprint, jsonify, session, request
from db.conexion import db

def notificar(id_carrito):
    carrito_pedido = carrito.query.filter_by(
        id = id_carrito
    ).first()
    if not carrito_pedido: return jsonify({"error":"Carrito no encontrado"})

    objetos_carrito = producto_carrito.query.filter_by(
        id_carrito = id_carrito
    ).all()
    for objeto in objetos_carrito:
        obj = producto.query.get(objeto.id_producto)
        if not obj: continue
        noti = notificacion(
            id_producto = objeto.id_producto,
            id_vendedor = obj.tienda_id,
            mensaje = f"ha vendido {objeto.cantidad} unidades de {obj.nombre}"
        )
        db.session.add(noti)
    db.session.commit()

def confirmar_pedido(id_carrito):
    carrito_pedido = carrito.query.get(id_carrito)

    if not carrito_pedido:
        return jsonify({"error": "Carrito no encontrado"}), 404

    objetos = producto_carrito.query.filter_by(
        id_carrito=id_carrito
    ).all()

    # Validar stock
    for objeto in objetos:
        prod = producto.query.get(objeto.id_producto)

        if not prod:
            return jsonify({"error": "Producto no encontrado"}), 404

        if prod.stock < objeto.cantidad:
            return jsonify({
                "error": f"Stock insuficiente para {prod.nombre}"
            }), 400

    # Descontar stock y notificar
    for objeto in objetos:
        prod = producto.query.get(objeto.id_producto)

        prod.stock -= objeto.cantidad

        noti = notificacion(
            id_producto=prod.id_producto,
            id_vendedor=prod.tienda_id,
            mensaje=f"Ha vendido {objeto.cantidad} unidades"
        )

        db.session.add(noti)

    # Vaciar carrito
    for objeto in objetos:
        db.session.delete(objeto)

    db.session.commit()

    return jsonify({"mensaje": "Pedido confirmado"}), 200

        
        

