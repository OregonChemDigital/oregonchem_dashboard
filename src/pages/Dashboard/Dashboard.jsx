import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import Login from "../Login/Login";
import PresentationForm from "../../components/Forms/PresentationForm";
import CategoryForm from "../../components/Forms/CategoryForm";
import BannerForm from "../../components/Forms/BannerForm";
import ProductForm from "../../components/Forms/ProductForm";
import "./dashboard.css";

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

    if (!user) {
        return <Login />;
    }

    return (
        <>
            <div className="container">
                <h1>Dashboard</h1>
                <div className="dashboard-container">
                    <div className="card small-card">
                        <h2>Crear Presentación</h2>
                        <PresentationForm />
                    </div>
                    <div className="card large-card">
                        <h2>Crear Producto</h2>
                        <ProductForm />
                    </div>
                    <div className="card small-card">
                        <h2>Crear Categoría</h2>
                        <CategoryForm />
                    </div>
                    <div className="card small-card">
                        <h2>Crear Banner</h2>
                        <BannerForm />
                    </div>

                </div>
            </div>
        </>
    );
};

export default Dashboard;