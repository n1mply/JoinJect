/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import githubIcon from './icons/github_mark_white.svg'

export default function Register({ setIsNewUser, apiClient }) {
  const [form, setForm] = useState({ username: "", mail: "", password: "" });
  const [errors, setErrors] = useState([]); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const responseUp = await apiClient.post("/register", form);
      console.log(form);
      await apiClient.post("/login", { mail: form.mail, password: form.password });
      setIsNewUser(false);
      navigate("/signup/finish");
      location.reload()
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrors([{ field: '', message: "A user with the same username or email already exists" }]);
        } else if (error.response.data.detail) {
          const errorDetail = error.response.data.detail;
          if (Array.isArray(errorDetail)) {
            const fieldErrors = errorDetail.map((err) => ({
              field: err.loc[1],
              message: err.msg,
            }));
            setErrors(fieldErrors);
          }
        }
      } else {
        setErrors([{ field: '', message: "An unknown error occurred. Please try again." }]);
      }
    }
  };

  

  const handleGitHubAuth = () => {
    window.location.href = "http://localhost:8000/auth/github";
  };

  const getInputErrorClass = (field) => {
    return errors.some((err) => err.field === field) ? "input-error" : "";
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="create-project-form">
        <h1>Register</h1>
        {errors.length > 0 && (
          <div className="error-block">
            {errors.map((error, index) => (
              <p key={index} className="error-message">{error.message}</p>
            ))}
          </div>
        )}
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className={getInputErrorClass("username")}
        />
        <input
          type="email"
          name="mail"
          placeholder="Email"
          onChange={handleChange}
          className={getInputErrorClass("mail")}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className={getInputErrorClass("password")}
        />
        <button className="action-button" type="submit">Sign Up</button>
        <button className="github-button" onClick={handleGitHubAuth}>
          <div>
            <img src={githubIcon}/><p>Continue with GitHub</p>
          </div>
        </button>
        <div className="account-check">
          <p>Have an account?</p>
          <span className="account-action" onClick={() => navigate("/signin")}>
            Sign In
          </span>
        </div>
      </form>

    </>
  );
}