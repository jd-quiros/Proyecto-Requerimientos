import api from "../services/api";
import { useState, useEffect } from "react";
function Carrito() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        api.get("/carrito")
            .then((res) => {
                console.log(res.data);
                setProductos(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    const eliminarProducto = async (id) => {
        try {
            await api.delete(`/eliminar/${id}`);

            setProductos(
                productos.filter((producto) => producto.id !== id)
            );
        } catch (err) {
            console.error(err);
            alert("Error al eliminar producto");
        }
    };

    const comprarCarrito = async () => {
        try {
            console.log("CLICK comprar carrito");
            const res = await api.post("/confirmar_pedido");

            alert(res.data.mensaje);

            setProductos([]);
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.error ||
                "Error al confirmar pedido"
            );
        }
    };

    const total = productos.reduce(
        (acum, producto) =>
            acum + producto.precio * producto.cantidad,
        0
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
            <div className="max-w-5xl mx-auto px-4">

                <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                    🛒 Carrito de Compras
                </h1>

                {productos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Tu carrito está vacío.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {productos.map((producto) => (
                                <div
                                    key={producto.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex justify-between items-center"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {producto.nombre}
                                        </h2>

                                        <p className="text-gray-500 dark:text-gray-400">
                                            Precio: ₡{producto.precio}
                                        </p>

                                        <p className="text-gray-500 dark:text-gray-400">
                                            Cantidad: {producto.cantidad}
                                        </p>

                                        <p className="font-bold text-green-600">
                                            Subtotal: ₡
                                            {producto.precio * producto.cantidad}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => eliminarProducto(producto.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Total
                                </h2>

                                <span className="text-3xl font-bold text-green-600">
                                    ₡{total}
                                </span>
                            </div>

                            <button
                                onClick={comprarCarrito}
                                className="mt-6 w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl text-lg font-semibold transition"
                            >
                                Confirmar pedido
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default Carrito;