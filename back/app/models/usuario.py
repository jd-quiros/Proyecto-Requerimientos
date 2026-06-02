# back/app/models/usuario.py
from app.db.conexion import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="vendedor")

    def __repr__(self):
        return f"<Usuario {self.nombre} ({self.rol})>"
