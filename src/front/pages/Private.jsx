import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        // Si no hay token, el usuario no está autenticado: lo mandamos al login
        if (!token) {
            navigate("/login");
            return;
        }

        const validateToken = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                if (!backendUrl) throw new Error("VITE_BACKEND_URL no está definida en el archivo .env");

                const response = await fetch(backendUrl + "/api/private", {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                });

                if (!response.ok) {
                    // Token inválido o expirado: limpiamos y redirigimos al login
                    sessionStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                sessionStorage.removeItem("token");
                navigate("/login");
            }
        };

        validateToken();
    }, [navigate]);

    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <p>Validando acceso...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h1>Zona privada</h1>
            <div className="alert alert-success mt-3">
                ¡Bienvenido, {user.email}! Has accedido a una página protegida.
            </div>
        </div>
    );
};