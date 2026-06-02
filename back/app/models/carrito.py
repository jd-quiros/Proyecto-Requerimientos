from db.conexion import db

class carrito(db.Model):
    __tablename__ = "carritos"
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer,foregein_key = True)
    monto = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id":self.id,
            "id_usuario": self.id_usuario,
            "monto": self.monto
        }
