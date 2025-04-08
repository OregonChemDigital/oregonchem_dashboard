import React from "react";
import { IoChevronBack, IoChevronForward, IoLogOut } from "react-icons/io5";
import { useAuth } from "../../contexts/authContext";
import { doSignOut } from "../../firebase/auth";
import "./Topbar.css";

const Topbar = ({ collapsed, toggleSidebar }) => {
  const { userLoggedIn, currentUser } = useAuth();

  const handleLogout = async () => {
    await doSignOut();
    window.location.href = "/login";
  };

  if (!userLoggedIn) return null;

  return (
    <header className={`topbar ${collapsed ? "collapsed" : ""}`}>
      <button className="topbar__toggle" onClick={toggleSidebar}>
        {collapsed ? <IoChevronForward /> : <IoChevronBack />}
      </button>
      <h1 className="topbar__title">{currentUser ? `Hola, ${currentUser.email}!` : ""}</h1>
      <button className="topbar__logout" onClick={handleLogout}>
        <IoLogOut /> Logout
      </button>
    </header>
  );
};

export default Topbar;


