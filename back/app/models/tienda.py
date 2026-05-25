# back/app/models/tienda.py
from datetime import datetime

from ..db.conexion import db


class Tienda(db.Model):
    __tablename__ = "tiendas"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    categoria = db.Column(db.String(50), nullable=False)  # Una sola categoría principal
    imagen = db.Column(db.String(255), nullable=True)  # URL o path de la imagen
    estado = db.Column(
        db.String(20), default="pendiente"
    )  # pendiente, activa, suspendida
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación con Usuario (un vendedor, una tienda)
    vendedor_id = db.Column(
        db.Integer, db.ForeignKey("usuarios.id"), unique=True, nullable=False
    )
    vendedor = db.relationship("Usuario", backref="tienda")

    # Relación con Productos
    productos = db.relationship(
        "Producto", backref="tienda", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria,
            "imagen": self.imagen,
            "estado": self.estado,
            "vendedor_id": self.vendedor_id,
            "vendedor_nombre": self.vendedor.nombre if self.vendedor else None,
            "fecha_creacion": (
                self.fecha_creacion.isoformat() if self.fecha_creacion else None
            ),
            "cantidad_productos": len(self.productos) if self.productos else 0,
        }
