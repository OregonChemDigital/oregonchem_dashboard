import React from "react";
import { getAuth } from "firebase/auth";

const Header = () => {
    const { userLoggedIn } = getAuth();

    if (!userLoggedIn) {
        return null;
    }

    return (
        <div>
            <header className="header">
                <h2>Welcome, {currentUser.email}!</h2>
            </header>
        </div>
    );
};

export default Header;