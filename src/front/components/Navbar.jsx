import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();

	// Comprobamos si hay un token para saber si el usuario está autenticado
	const token = sessionStorage.getItem("token");

	const handleLogout = () => {
		// Eliminamos el token del sessionStorage y redirigimos al inicio de sesión
		sessionStorage.removeItem("token");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto d-flex gap-2">
					{token ? (
						<button className="btn btn-danger" onClick={handleLogout}>
							Cerrar sesión
						</button>
					) : (
						<>
							<Link to="/signup">
								<button className="btn btn-outline-primary">Registro</button>
							</Link>
							<Link to="/login">
								<button className="btn btn-primary">Iniciar sesión</button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};