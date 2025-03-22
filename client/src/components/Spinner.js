import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const DEFAULT_COUNT = 3;
const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(DEFAULT_COUNT);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (count === 0) {
      setCount(DEFAULT_COUNT);
      navigate(`/${path}`, { state: location.pathname });
      return;
    }
  
    const interval = setInterval(() => {
      setCount((prevValue) => prevValue - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [count, navigate, location, path, setCount]);

  return (
    <>
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <h1 className="Text-center">Redirecting you in {count} second{count === 1 ? "" : "s"}</h1>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );
};

export default Spinner;