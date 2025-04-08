import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import Sidebar from "../components/Navbars/Sidebar";
import Topbar from "../components/Navbars/Topbar";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Presentations from "../pages/Presentations";
import Banners from "../pages/Banners";
import PrivateRoute from "../contexts/PrivateRoute";
import QuimicaIndustrial from "../pages/Sites/QuimicaIndustrial";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import CombinedAnalyticsDashboard from '../components/CombinedAnalyticsDashboard';

function AppRoutes() {
    const { userLoggedIn } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

    return (
        <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
            {userLoggedIn && <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />}

            <div className="main-content">
                {userLoggedIn && <Topbar collapsed={collapsed} toggleSidebar={toggleSidebar} />}

                <Routes>
                    <Route
                        path="/login"
                        element={userLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route path="/" element={<Navigate to="/login" />} />

                    {userLoggedIn ? (
                        <>
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/productos" element={<PrivateRoute><Products /></PrivateRoute>} />
                            <Route path="/categorias" element={<PrivateRoute><Categories /></PrivateRoute>} />
                            <Route path="/presentaciones" element={<PrivateRoute><Presentations /></PrivateRoute>} />
                            <Route path="/banners" element={<PrivateRoute><Banners /></PrivateRoute>} />
                            <Route path="/quimica-industrial" element={<PrivateRoute><QuimicaIndustrial /></PrivateRoute>} />
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


