import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import Sidebar from "../components/Navbars/Sidebar";
import Topbar from "../components/Navbars/Topbar";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import CreateProduct from "../pages/Products/CreateProduct";
import AllProductsList from "../pages/Products/AllProductsList";
import CreateCategory from "../pages/Categories/CreateCategory";
import CategoryList from "../pages/Categories/CategoryList";
import CreatePresentation from "../pages/Presentations/CreatePresentation";
import PresentationList from "../pages/Presentations/PresentationList";
import CreateBanner from "../pages/Banners/CreateBanner";
import BannerList from "../pages/Banners/BannerList";
import PrivateRoute from "../contexts/PrivateRoute";
import QuimicaIndustrialAnalytics from "../pages/Sites/QuimicaIndustrial/QuimicaIndustrialAnalytics";
import ProductosQuimicaIndustrial from "../pages/Sites/QuimicaIndustrial/products/ProductosQuimicaIndustrial";
import QuimicaIndustrialBanners from "../pages/Sites/QuimicaIndustrial/banners/QuimicaIndustrialBanners";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import CombinedAnalyticsDashboard from '../components/CombinedAnalyticsDashboard';

const AppRoutes = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { userLoggedIn } = useAuth();

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="app-container">
            <Sidebar collapsed={collapsed} />
            <div className="main-content">
                <Topbar collapsed={collapsed} toggleSidebar={toggleSidebar} />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {userLoggedIn ? (
                        <>
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            
                            {/* Global Routes */}
                            <Route path="/productos/crear" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
                            <Route path="/productos/todos" element={<PrivateRoute><AllProductsList /></PrivateRoute>} />
                            <Route path="/categorias/crear" element={<PrivateRoute><CreateCategory /></PrivateRoute>} />
                            <Route path="/categorias/todas" element={<PrivateRoute><CategoryList /></PrivateRoute>} />
                            <Route path="/presentaciones/crear" element={<PrivateRoute><CreatePresentation /></PrivateRoute>} />
                            <Route path="/presentaciones/todas" element={<PrivateRoute><PresentationList /></PrivateRoute>} />
                            <Route path="/banners/crear" element={<PrivateRoute><CreateBanner /></PrivateRoute>} />
                            <Route path="/banners/todos" element={<PrivateRoute><BannerList /></PrivateRoute>} />
                            
                            {/* Química Industrial Routes */}
                            <Route path="/quimica-industrial/analytics" element={<PrivateRoute><QuimicaIndustrialAnalytics /></PrivateRoute>} />
                            <Route path="/quimica-industrial/productos" element={<PrivateRoute><ProductosQuimicaIndustrial /></PrivateRoute>} />
                            <Route path="/quimica-industrial/banners" element={<PrivateRoute><QuimicaIndustrialBanners /></PrivateRoute>} />
                            
                            {/* Analytics Routes */}
                            <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />
                            <Route path="/analytics/combined" element={<PrivateRoute><CombinedAnalyticsDashboard /></PrivateRoute>} />
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/login" />} />
                    )}
                </Routes>
            </div>
        </div>
    );
}

export default AppRoutes;


