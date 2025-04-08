import React from "react";
import { NavLink } from "react-router-dom";
import { IoHome, IoCube, IoAlbums, IoFlask, IoImage, IoGlobe, IoAnalytics } from "react-icons/io5";
import logo from "../../images/oregonchemlogo.png";
import shortLogo from "../../images/oregonchemlogoshort.png";
import { useAuth } from "../../contexts/authContext";
import "./Sidebar.css";

const Sidebar = ({ collapsed }) => {
    const { userLoggedIn } = useAuth();
    if (!userLoggedIn) return null;

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar__header">
                <NavLink to="/" className="sidebar__logo">
                    <img src={collapsed ? shortLogo : logo} alt="OregonChemLogo" />
                </NavLink>
            </div>

            <ul className="sidebar__menu">
                <li>
                    <NavLink to="/dashboard" className="sidebar__link">
                        <IoHome />
                        <span>Inicio</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/productos" className="sidebar__link">
                        <IoCube />
                        <span>Productos</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/categorias" className="sidebar__link">
                        <IoAlbums />
                        <span>Categorías</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/presentaciones" className="sidebar__link">
                        <IoFlask />
                        <span>Presentaciones</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/banners" className="sidebar__link">
                        <IoImage />
                        <span>Banners</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/quimica-industrial" className="sidebar__link">
                        <IoGlobe />
                        <span>Química Industrial</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/analytics" className="sidebar__link">
                        <IoAnalytics />
                        <span>Analytics</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;



