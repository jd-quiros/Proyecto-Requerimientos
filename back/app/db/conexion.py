# back/app/db/conexion.py
from flask_sqlalchemy import SQLAlchemy

# Este objeto "db" es el que usaremos en TODOS los modelos
# y en app.py para inicializarlo con la configuración
db = SQLAlchemy()
