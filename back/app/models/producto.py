# back/app/models/producto.py
from datetime import datetime

from ..db.conexion import db


class Producto(db.Model):
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    imagen = db.Column(db.String(255), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación con Tienda
    tienda_id = db.Column(db.Integer, db.ForeignKey("tiendas.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": self.precio,
            "stock": self.stock,
            "imagen": self.imagen,
            "tienda_id": self.tienda_id,
            "tienda_nombre": self.tienda.nombre if self.tienda else None,
            "categoria": self.tienda.categoria if self.tienda else None,
            "fecha_creacion": (
                self.fecha_creacion.isoformat() if self.fecha_creacion else None
            ),
        }
