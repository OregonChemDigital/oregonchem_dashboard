import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../images/oregonchemlogo.png";
import emailIcon from "../../images/emailicon.png";
import passwordIcon from "../../images/passwordicon.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in on component mount
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate("/dashboard"); // Redirect to dashboard if logged in
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            setLoading(false);
            alert("Password reset email sent!");
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login_container">
                <img className="login_logo" src={logo} alt="Oregon Chem Logo" />

                <div className="login_input_container">
                    <img className="login_icon" src={emailIcon} alt="Email Icon" />
                    <div className="login_input_wrapper">
                        <div className="login_separator"></div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="login_input_field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="login_input_container">
                    <img className="login_icon" src={passwordIcon} alt="Password Icon" />
                    <div className="login_input_wrapper">
                        <div className="login_separator"></div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="login_input_field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="login_button"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : "Login"}
                </button>

                {error && <p className="error-message">{error}</p>}

                <a href="#" className="forgot-password" onClick={handleResetPassword}>
                    Recuperar contraseña
                </a>
            </div>
        </>
    );
};

export default Login;