import React from "react";
import { useAuth } from "../../contexts/authContext";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <header>
        {currentUser ? <h2>Hola, {currentUser.email}!</h2> : null}
      </header>
    </>
  );
};

export default Header;