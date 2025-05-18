/* eslint-disable react/prop-types */ 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import addIcon from './icons/add_icon.svg'
import notification from './icons/notification.svg'

export default function Header({ apiClient, isNewUser }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/me");
        setUsername(response.data.username);
      } catch {
        setUsername("");
      }
    };
    fetchData();
  }, [apiClient]);

  return (
    <header>
      <h1 className="joinject-logo">
        <Link to="/"><span>Join</span>Ject</Link>
      </h1>
      <nav className="header-nav">
        <Link to="/">Home</Link>
        <Link to="/projects/p/1">Projects</Link>
        <Link to="/community">Community</Link>
      </nav>

      <div className="account">
        {!isNewUser ? (
          <>
            <Link to="/create" className="icon-style"><img src={addIcon} alt="Create Project" /></Link>
            <img src={notification} alt="" />
            <Link to={`/user/${username}`} className="name-style">{username}</Link>
          </>
        ) : (
          <>
            <Link to="/signup" className="account-button">Sign Up</Link>
            <Link to="/signin" className="account-button">Sign In</Link>
          </>
        )}
      </div>
    </header>
  );
}
