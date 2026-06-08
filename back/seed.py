"""
Poblar la base de datos con datos de prueba.
Ejecutar con: venv/bin/python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.app import crear_app
from app.db.conexion import db
from app.models.usuario import Usuario
from app.models.tienda import Tienda
from app.models.producto import Producto
from app.models.carrito import Carrito
from app.servicios.hash import hash_password

app = crear_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # ── Usuarios ──────────────────────────────────────────────
    admin = Usuario(
        nombre="Admin",
        email="admin@admin.com",
        password_hash=hash_password("123456"),
        rol="admin",
    )
    vendedor1 = Usuario(
        nombre="Carlos",
        email="carlos@carlos.com",
        password_hash=hash_password("123456"),
        rol="vendedor",
    )
    vendedor2 = Usuario(
        nombre="Maria",
        email="maria@maria.com",
        password_hash=hash_password("123456"),
        rol="vendedor",
    )
    cliente = Usuario(
        nombre="Jose",
        email="jose@jose.com",
        password_hash=hash_password("123456"),
        rol="cliente",
    )
    db.session.add_all([admin, vendedor1, vendedor2, cliente])
    db.session.flush()

    # ── Tiendas ───────────────────────────────────────────────
    tienda_tech = Tienda(
        nombre="TechZone CR",
        descripcion="Tecnología y gadgets al mejor precio de Costa Rica.",
        categoria="Tecnología",
        imagen="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
        estado="activa",
        vendedor_id=vendedor1.id,
    )
    tienda_ropa = Tienda(
        nombre="ModaUr",
        descripcion="Ropa y accesorios de moda para toda la familia.",
        categoria="Moda",
        imagen="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
        estado="activa",
        vendedor_id=vendedor2.id,
    )
    tienda_pendiente = Tienda(
        nombre="Hogar & Deco",
        descripcion="Artículos para el hogar y decoración.",
        categoria="Hogar",
        estado="pendiente",
        vendedor_id=vendedor1.id,
    )
    db.session.add_all([tienda_tech, tienda_ropa, tienda_pendiente])
    db.session.flush()

    # ── Productos TechZone ────────────────────────────────────
    productos_tech = [
        Producto(
            nombre="Teclado Mecánico RGB",
            descripcion="Teclado mecánico con switches azules y retroiluminación RGB. Ideal para gaming y programación.",
            precio=35000,
            stock=15,
            imagen="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
            tienda_id=tienda_tech.id,
        ),
        Producto(
            nombre="Mouse Inalámbrico",
            descripcion="Mouse ergonómico inalámbrico con batería de larga duración.",
            precio=12500,
            stock=30,
            imagen="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
            tienda_id=tienda_tech.id,
        ),
        Producto(
            nombre="Monitor 24'' Full HD",
            descripcion="Monitor IPS 24 pulgadas Full HD, 75Hz, perfecto para trabajo y entretenimiento.",
            precio=120000,
            stock=8,
            imagen="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
            tienda_id=tienda_tech.id,
        ),
        Producto(
            nombre="Audífonos Bluetooth",
            descripcion="Audífonos over-ear con cancelación de ruido y 30 horas de batería.",
            precio=28000,
            stock=20,
            imagen="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            tienda_id=tienda_tech.id,
        ),
        Producto(
            nombre="Cable USB-C 2m",
            descripcion="Cable USB-C de carga rápida 65W, 2 metros de largo.",
            precio=3500,
            stock=0,
            imagen="",
            tienda_id=tienda_tech.id,
        ),
    ]

    # ── Productos ModaUr ──────────────────────────────────────
    productos_ropa = [
        Producto(
            nombre="Camiseta Algodón Premium",
            descripcion="Camiseta 100% algodón, corte regular, disponible en varios colores.",
            precio=8500,
            stock=50,
            imagen="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
            tienda_id=tienda_ropa.id,
        ),
        Producto(
            nombre="Jeans Slim Fit",
            descripcion="Pantalón jeans de corte slim fit, tela stretch para mayor comodidad.",
            precio=22000,
            stock=25,
            imagen="https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800&q=80",
            tienda_id=tienda_ropa.id,
        ),
        Producto(
            nombre="Zapatillas Deportivas",
            descripcion="Zapatillas ligeras para correr y uso diario.",
            precio=45000,
            stock=12,
            imagen="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            tienda_id=tienda_ropa.id,
        ),
    ]

    db.session.add_all(productos_tech + productos_ropa)
    db.session.flush()

    # ── Carrito del cliente ───────────────────────────────────
    carrito = Carrito(id_usuario=cliente.id, monto=0)
    db.session.add(carrito)
    db.session.commit()

    print("\n✓ Base de datos poblada con éxito.\n")
    print("Cuentas de prueba (contraseña: 123456):")
    print("  Admin    → admin@admin.com")
    print("  Vendedor → carlos@carlos.com  (tienda: TechZone CR - activa, Hogar & Deco - pendiente)")
    print("  Vendedor → maria@maria.com    (tienda: ModaUr - activa)")
    print("  Cliente  → jose@jose.com\n")
