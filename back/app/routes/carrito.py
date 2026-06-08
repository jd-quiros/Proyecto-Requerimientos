from ..models.producto import Producto
from ..models.carrito import Carrito
from ..models.usuario import Usuario
from ..models.notificacion import Notificacion
from ..models.producto_carrito import Producto_carrito
from ..models.pedido import Pedido, PedidoProducto
from flask import Blueprint, jsonify, session, request
from ..servicios.token import verificar_token
from ..db.conexion import db
from datetime import date

carrito_bp = Blueprint(
    "carrito",
    __name__
)
def crear_carrito(id_usuario):
    nuevo = Carrito(
        id_usuario=id_usuario,
        monto=0
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo



def obtener_usuario_token():
    auth = request.headers.get("Authorization")

    if not auth:
        return None

    try:
        token = auth.split(" ")[1]
        payload = verificar_token(token)

        return int(payload["sub"])
    except Exception:
        return None

@carrito_bp.route("/api/carrito", methods=["GET"])

def ver_carrito():
    id_usuario = obtener_usuario_token()
    if not id_usuario:
        return jsonify({"error": "Token invalido"}), 401
    user = Usuario.query.filter_by(
        id=id_usuario
    ).first()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.rol != "cliente":
        return jsonify({
            "error": "Su rol no tiene acceso a estas funciones de la aplicacion"
        }), 401

    krrito = Carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not krrito:
        krrito = crear_carrito(id_usuario)

    objetos = Producto_carrito.query.filter_by(
        id_carrito=krrito.id
    ).all()

    respuesta = []

    for objeto in objetos:
        prod = Producto.query.filter_by(
            id=objeto.id_producto
        ).first()

        if not prod:
            continue

        respuesta.append({
            "id": prod.id,
            "nombre": prod.nombre,
            "precio": prod.precio,
            "cantidad": objeto.cantidad,
            "stock": prod.stock,
            "imagen": prod.imagen
        })

    return jsonify(respuesta), 200


@carrito_bp.route("/api/eliminar/<int:id_producto>", methods=["DELETE"])
def eliminar_producto(id_producto):
    id_usuario = obtener_usuario_token()
    print(f"el id_usuario es {id_usuario}")
    if not id_usuario:
        return jsonify({"error": "Sesion invalida"}), 401

    krrito = Carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not krrito:
        return jsonify({
            "error": "Usted no tiene un carrito asignado"
        }), 400

    objeto = Producto_carrito.query.filter_by(
        id_carrito=krrito.id,
        id_producto=id_producto
    ).first()

    if not objeto:
        return jsonify({
            "error": "Producto no encontrado en el carrito"
        }), 404

    product = Producto.query.get(id_producto)

    if product:
        krrito.monto -= product.precio * objeto.cantidad

    db.session.delete(objeto)
    db.session.commit()

    return jsonify({
        "mensaje": "Producto eliminado del carrito exitosamente"
    }), 200


@carrito_bp.route("/api/agregar/<int:id_producto>", methods=["POST"])
def agregar_producto(id_producto):
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "JSON invalido"}), 400

    cantidad = datos.get("cantidad")

    if not cantidad or cantidad <= 0:
        return jsonify({"error": "Cantidad invalida"}), 400

    product = Producto.query.filter_by(
        id=id_producto
    ).first()

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    if cantidad > product.stock:
        return jsonify({"error": "No hay suficientes unidades"}), 400

    id_usuario = obtener_usuario_token()
    print(f"el id_usuario es: {id_usuario}")
    if not id_usuario:
        return jsonify({"error": "Sesion invalida"}), 401

    carrito_usuario = Carrito.query.filter_by(
        id_usuario=id_usuario
    ).first()

    if not carrito_usuario:
        carrito_usuario = crear_carrito(id_usuario)

    existente = Producto_carrito.query.filter_by(
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
        nuevo = Producto_carrito(
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

def notificar(id_carrito):
    carrito_pedido = Carrito.query.filter_by(
        id = id_carrito
    ).first()
    if not carrito_pedido: return jsonify({"error":"Carrito no encontrado"})

    objetos_carrito = Producto_carrito.query.filter_by(
        id_carrito = id_carrito
    ).all()
    for objeto in objetos_carrito:
        obj = Producto.query.get(objeto.id_producto)
        if not obj: continue
        noti = Notificacion(
            id_producto = objeto.id_producto,
            id_vendedor = obj.tienda_id,
            mensaje = f"ha vendido {objeto.cantidad} unidades de {obj.nombre}"
        )
        db.session.add(noti)
    db.session.commit()

@carrito_bp.route("/api/confirmar_pedido", methods=["POST"])
def confirmar_pedido():
    id_usuario = obtener_usuario_token()
    print(f"Procesando pedido de usuario :{id_usuario}")
    carrito_pedido = Carrito.query.filter_by(
        id_usuario = id_usuario
    ).first()

    if not carrito_pedido:
        return jsonify({"error": "Carrito no encontrado"}), 404

    objetos = Producto_carrito.query.filter_by(
        id_carrito=carrito_pedido.id
    ).all()
    if not objetos:
        return jsonify({"error":"Carrito vacio"})
    # Validar stock
    for objeto in objetos:
        prod = Producto.query.get(objeto.id_producto)

        if not prod:
            return jsonify({"error": "Producto no encontrado"}), 404

        if prod.stock < objeto.cantidad:
            return jsonify({
                "error": f"Stock insuficiente para {prod.nombre}"
            }), 400

    # Calcular monto total
    monto_total = sum(
        Producto.query.get(o.id_producto).precio * o.cantidad
        for o in objetos
        if Producto.query.get(o.id_producto)
    )

    # Guardar pedido en historial
    nuevo_pedido = Pedido(
        id_usuario=id_usuario,
        fecha=date.today(),
        monto_total=monto_total,
    )
    db.session.add(nuevo_pedido)
    db.session.flush()

    for objeto in objetos:
        prod = Producto.query.get(objeto.id_producto)
        if not prod:
            continue
        detalle = PedidoProducto(
            id_pedido=nuevo_pedido.id,
            id_producto=prod.id,
            nombre_producto=prod.nombre,
            precio=prod.precio,
            cantidad=objeto.cantidad,
        )
        db.session.add(detalle)

    # Descontar stock y notificar
    for objeto in objetos:
        prod = Producto.query.get(objeto.id_producto)

        prod.stock -= objeto.cantidad

        noti = Notificacion(
            id_producto=prod.id,
            id_vendedor=prod.tienda_id,
            mensaje=f"Ha vendido {objeto.cantidad} unidades",
            fecha=date.today(),
        )

        db.session.add(noti)

    # Vaciar carrito
    for objeto in objetos:
        db.session.delete(objeto)

    db.session.commit()

    return jsonify({"mensaje": "Pedido confirmado"}), 200


@carrito_bp.route("/api/actualizar/<int:id_producto>", methods=["PUT"])
def actualizar_cantidad(id_producto):
    id_usuario = obtener_usuario_token()
    if not id_usuario:
        return jsonify({"error": "Token invalido"}), 401

    datos = request.get_json()
    nueva_cantidad = datos.get("cantidad")

    if nueva_cantidad is None or nueva_cantidad < 0:
        return jsonify({"error": "Cantidad invalida"}), 400

    carrito = Carrito.query.filter_by(id_usuario=id_usuario).first()
    if not carrito:
        return jsonify({"error": "Carrito no encontrado"}), 404

    item = Producto_carrito.query.filter_by(
        id_carrito=carrito.id, id_producto=id_producto
    ).first()
    if not item:
        return jsonify({"error": "Producto no está en el carrito"}), 404

    prod = Producto.query.get(id_producto)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404

    if nueva_cantidad == 0:
        carrito.monto -= prod.precio * item.cantidad
        db.session.delete(item)
    elif nueva_cantidad > prod.stock:
        return jsonify({"error": "No hay suficiente stock"}), 400
    else:
        carrito.monto += prod.precio * (nueva_cantidad - item.cantidad)
        item.cantidad = nueva_cantidad

    db.session.commit()
    return jsonify({"mensaje": "Cantidad actualizada"}), 200


@carrito_bp.route("/api/historial", methods=["GET"])
def historial_pedidos():
    id_usuario = obtener_usuario_token()
    if not id_usuario:
        return jsonify({"error": "Token invalido"}), 401

    pedidos = (
        Pedido.query.filter_by(id_usuario=id_usuario)
        .order_by(Pedido.fecha.desc())
        .all()
    )

    return jsonify([p.to_dict() for p in pedidos]), 200
