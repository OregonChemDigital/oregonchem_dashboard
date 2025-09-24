import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import Topbar from "../components/layout/Topbar/Topbar";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import CreateProduct from "../pages/products/CreateProduct";
import CreateAIProduct from "../pages/products/CreateAIProduct";
import AllProductsList from "../pages/products/AllProductsList";
import CreateCategory from "../pages/categories/CreateCategory";
import CategoryList from "../pages/categories/CategoryList";
import CreatePresentation from "../pages/presentations/CreatePresentation";
import PresentationList from "../pages/presentations/PresentationList";
import CreateBanner from "../pages/banners/CreateBanner";
import BannerList from "../pages/banners/BannerList";
import PrivateRoute from "../contexts/PrivateRoute";
import QuimicaIndustrialAnalytics from "../pages/sites/QuimicaIndustrial/QuimicaIndustrialAnalytics";
import ProductosQuimicaIndustrial from "../pages/sites/QuimicaIndustrial/products/ProductosQuimicaIndustrial";
import QuimicaIndustrialBanners from "../pages/sites/QuimicaIndustrial/banners/QuimicaIndustrialBanners";
import AnalyticsDashboard from "../components/features/Analytics/AnalyticsDashboard";
import CombinedAnalyticsDashboard from '../components/features/Analytics/CombinedAnalyticsDashboard';

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
                    <Route path="/" element={<Navigate to={userLoggedIn ? "/dashboard" : "/login"} replace />} />
                    <Route path="/login" element={<Login />} />
                    {userLoggedIn ? (
                        <>
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            
                            {/* Global Routes */}
                            <Route path="/productos/crear" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
                            <Route path="/productos/crear-ai" element={<PrivateRoute><CreateAIProduct /></PrivateRoute>} />
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


