from ..db.conexion import db


class Pedido(db.Model):
    __tablename__ = "pedidos"
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    monto_total = db.Column(db.Float, nullable=False)
    productos = db.relationship("PedidoProducto", backref="pedido", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat(),
            "monto_total": self.monto_total,
            "productos": [p.to_dict() for p in self.productos],
        }


class PedidoProducto(db.Model):
    __tablename__ = "pedido_productos"
    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    id_producto = db.Column(db.Integer, nullable=False)
    nombre_producto = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id_producto": self.id_producto,
            "nombre": self.nombre_producto,
            "precio": self.precio,
            "cantidad": self.cantidad,
            "subtotal": self.precio * self.cantidad,
        }
