import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoHome, IoCube, IoAlbums, IoFlask, IoImage, IoGlobe, IoAnalytics, IoChevronDown, IoChevronForward } from "react-icons/io5";
import logo from "../../../images/oregonchemlogo.png";
import shortLogo from "../../../images/oregonchemlogoshort.png";
import { useAuth } from "../../../contexts/authContext";
import "./Sidebar.css";

const Sidebar = ({ collapsed }) => {
    const { userLoggedIn } = useAuth();
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isPresentationsOpen, setIsPresentationsOpen] = useState(false);
    const [isBannersOpen, setIsBannersOpen] = useState(false);
    const [isQuimicaIndustrialOpen, setIsQuimicaIndustrialOpen] = useState(false);

    if (!userLoggedIn) return null;

    const toggleProductsMenu = () => setIsProductsOpen(!isProductsOpen);
    const toggleCategoriesMenu = () => setIsCategoriesOpen(!isCategoriesOpen);
    const togglePresentationsMenu = () => setIsPresentationsOpen(!isPresentationsOpen);
    const toggleBannersMenu = () => setIsBannersOpen(!isBannersOpen);
    const toggleQuimicaIndustrialMenu = () => setIsQuimicaIndustrialOpen(!isQuimicaIndustrialOpen);

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
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleProductsMenu}>
                        <IoCube />
                        <span>Productos</span>

                        {!collapsed && (isProductsOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isProductsOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/productos/crear" className="sidebar__sublink">
                                    Crear Producto
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/productos/todos" className="sidebar__sublink">
                                    Productos OregonChem
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleCategoriesMenu}>
                        <IoAlbums />
                        <span>Categorías</span>
                        {!collapsed && (isCategoriesOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isCategoriesOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/categorias/crear" className="sidebar__sublink">
                                    Crear Categoría
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/categorias/todas" className="sidebar__sublink">
                                    Todas las Categorías
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={togglePresentationsMenu}>
                        <IoFlask />
                        <span>Presentaciones</span>
                        {!collapsed && (isPresentationsOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isPresentationsOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/presentaciones/crear" className="sidebar__sublink">
                                    Crear Presentación
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/presentaciones/todas" className="sidebar__sublink">
                                    Todas las Presentaciones
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleBannersMenu}>
                        <IoImage />
                        <span>Banners</span>
                        {!collapsed && (isBannersOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isBannersOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/banners/crear" className="sidebar__sublink">
                                    Crear Banner
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/banners/todos" className="sidebar__sublink">
                                    Todos los Banners
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleQuimicaIndustrialMenu}>
                        <IoGlobe />
                        <span>Química Industrial</span>
                        {!collapsed && (isQuimicaIndustrialOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isQuimicaIndustrialOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/quimica-industrial/analytics" className="sidebar__sublink">
                                    Analytics
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/quimica-industrial/productos" className="sidebar__sublink">
                                    Productos Química Industrial
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/quimica-industrial/banners" className="sidebar__sublink">
                                    Banners
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;



