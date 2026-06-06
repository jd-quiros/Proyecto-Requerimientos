from db.conexion import db
class pedidos(db.Model):
    __tablename__ = "producto_carrito"
    id_carrito = db.Column(db.Integer,primary_key = True)
    id_producto = db.Column(db.Integer,primary = True)
    cantidad = db.Column(db.Integer,nullable = False)
    def to_dict(self):
        return {
            "id_carrito":self.id_carrito,
            "id_producto":self.id_producto
        }