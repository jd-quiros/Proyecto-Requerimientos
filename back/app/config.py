# back/app/config.py
import os


class Config:
    # Clave secreta para las sesiones de Flask
    SECRET_KEY = (
        os.environ.get("SECRET_KEY") or "clave-super-secreta-cambiar-en-produccion"
    )

    # Configuración de SQLite
    basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(
        basedir, "instance", "silkroad.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración del JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-clave-secreta"
    JWT_EXPIRATION_HOURS = 24
