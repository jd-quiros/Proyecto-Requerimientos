import { useState } from "react";

function Carrito() {
    const [productos, setProductos] = useState([
        {
            id: 1,
            nombre: "Laptop",
            precio: 500000,
            cantidad: 1
        },
        {
            id: 2,
            nombre: "Mouse",
            precio: 15000,
            cantidad: 2
        }
    ]);

    const eliminarProducto = (id) => {
        setProductos(
            productos.filter((producto) => producto.id !== id)
        );
    };

    const total = productos.reduce(
        (acum, producto) =>
            acum + producto.precio * producto.cantidad,
        0
    );

    return (
        <div style={{ padding: "20px" }}>
            <h1>Carrito de Compras</h1>

            {productos.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                <>
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.map((producto) => (
                                <tr key={producto.id}>
                                    <td>{producto.nombre}</td>
                                    <td>₡{producto.precio}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>
                                        ₡
                                        {producto.precio *
                                            producto.cantidad}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                eliminarProducto(
                                                    producto.id
                                                )
                                            }
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>Total: ₡{total}</h2>

                    <button>
                        Proceder al pago
                    </button>
                </>
            )}
        </div>
    );
}

export default Carrito;