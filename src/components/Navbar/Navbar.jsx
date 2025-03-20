import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Import useNavigate
import logo from "../../images/oregonchemlogo.png";
import { IoClose, IoMenu } from "react-icons/io5";
import { useAuth } from "../../contexts/authContext";
import { doSignOut } from "../../firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const { userLoggedIn, logout } = useAuth(); // Make sure logout is available from context
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await doSignOut(); // Sign out the user
    navigate("/login"); // Redirect to login page after logging out
  };

  if (!userLoggedIn) return null;

  return (
    <>
      <nav className="nav">
        <div className="nav__logo">
          <NavLink to="/">
            <img src={logo} alt="OregonChemLogo" />
          </NavLink>
        </div>
        <div className={`nav__menu ${menuOpen ? "active" : ""}`}>
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink to="/dashboard" className="nav__link">
                Inicio
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/productos" className="nav__link">
                Productos
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/categorias" className="nav__link">
                Categorías
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/presentaciones" className="nav__link">
                Presentaciones
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/banners" className="nav__link">
                Banners
              </NavLink>
            </li>
            <li className="nav__item">
              <button className="nav__link logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
          <div className="nav__close" onClick={toggleMenu}>
            <IoClose />
          </div>
        </div>
        <div className="nav__toggle" onClick={toggleMenu}>
          <IoMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;