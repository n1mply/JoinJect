/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import TechIconsCloud from "./TechIconsCloud"
import { useNavigate } from "react-router-dom"
import { TypeAnimation } from 'react-type-animation'
import "./Home.css"

import React, { useState, useEffect } from "react";

const TypingText = ({ text, speed = 20, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <p className={className}>
      {displayedText}
    </p>
  );
};



export default function Home({apiClient}){
    const navigate = useNavigate()

    return (
    <div className="home-page">
        <TypeAnimation
        sequence={[
        "Build Together",
        3000,
        'Learn Faster',
        3000,
        'With JoinJect',
        3000,
      ]}
        speed={50}
        repeat={Infinity}
        wrapper="h1"
    />
        <div className="container-center">
            <TypingText className={'sub-heading'} text={"JoinJect connects developers of all skill levels to create real projects, grow as a team, and showcase their work."}/>
        </div>
        <TechIconsCloud></TechIconsCloud>
        <div className="container-wrapper">
            <div className="button-container">
                <button className="action-button">Start a Project</button>
                <p>or</p>
                <button className="action-button outlined" onClick={()=>{navigate('/community')}} >Find a Team</button>
            </div>
        </div>
    </div>
    )
}