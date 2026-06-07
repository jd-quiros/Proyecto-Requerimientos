from ..db.conexion import db
class Notificacion(db.Model):
    __tablename__ = "notificaciones"
    id_notificacion = db.Column(db.Integer,primary_key = True)
    id_vendedor = db.Column(db.Integer,nullable = False)
    id_producto = db.Column(db.Integer,nullable = False)
    mensaje = db.Column(db.String,nullable = False)
    fecha = db.Column(db.Date,nullable = False)
    def to_dict(self):
        return {
            "id_notificacion":self.id_notificacion,
            "id_producto":self.id_producto
        }