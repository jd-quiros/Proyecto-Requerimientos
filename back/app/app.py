# back/app/app.py
from flask import Flask
from flask_cors import CORS

from .config import Config
from .db.conexion import db
from .models.producto import Producto
from .models.tienda import Tienda
from .models.usuario import Usuario
from .models.pedido import Pedido, PedidoProducto
from .routes.autenticacion import auth_bp
from .routes.productos import productos_bp
from .routes.tiendas import tiendas_bp
from .routes.carrito import carrito_bp
from .routes.admin import admin_bp


def crear_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS para todo
    CORS(app, supports_credentials=True)

    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(tiendas_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(carrito_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = crear_app()
    app.run(debug=True, port=5000)
