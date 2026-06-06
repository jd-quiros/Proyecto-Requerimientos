from db.conexion import db
class pedidos(db.Model):
    __tablename__ = "pedidos"
    id_pedido = db.Column(db.Integer,primary_key = True)
    id_carrito = db.Column(db.Integer,foregein_key = True)
    def to_dict(self):
        return {
            "id_pedido":self.id_pedido,
            "id_carrito":self.id_carrito
        }