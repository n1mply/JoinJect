/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import TechIconsCloud from "./TechIconsCloud"
import "./Home.css"


export default function Home({apiClient}){
    return (
    <div className="home-page">
        <h1>Build <span>Together</span>. Learn <span>Faster</span>.</h1>
        <div className="container-center">
            <p className="sub-heading">JoinJect connects developers of all skill levels to create real projects, 
                grow as a team, and showcase their work.</p>
        </div>
        <TechIconsCloud></TechIconsCloud>
        <div className="container-wrapper">
            <div className="button-container">
                <button className="action-button">Start a Project</button>
                <p>or</p>
                <button className="action-button outlined">Find a Team</button>
            </div>
        </div>
    </div>
    )
}