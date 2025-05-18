/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ModalForm from "./ModalForm";

export default function Project({ name, description, skills, members, time_to_complite, time_to_start, author, id }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      console.log(message)
    }
    catch{
      
    }
    finally{

    }
  }

  return (
  <>
    <ModalForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
    >
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
        style={{position: "absolute", cursor:'pointer'}} onClick={()=>(setIsModalOpen(false))}>
          <path 
            d="M6 18L18 6M6 6L18 18" 
            stroke="var(--color-primary)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <h1 style={{width: '100%', marginBottom:'10px'}} className="title">{name}</h1>
        <p>Send request to join in project team with message below. You will join the project 
          with the specialty that is listed in your profile.</p>
        <textarea style={{maxHeight: '300px'}} name="modal" id="modal" placeholder="..." minLength={60} maxLength={200} onChange={(e)=>(setMessage(e.target.value))}></textarea>
        <button type="submit" style={{width: '100%', marginTop:'10px'}} className="more-button">Send</button>
      </form>
    </ModalForm>
    <div className="project">
      <h1>{name}</h1>
      <p>{description}</p>
      <div className="skills">
        {skills.map((skill) => (
          <span key={`${skill}`} className="skill">{skill}</span>
        ))}
      </div>
      <div className="members">
        {members.map((member) => (
          <span key={`${member}-${name}-${Math.random()}`} className="member">{member}</span>
        ))}
      </div>
      <div className="time-wrapper">
        <p>Time allocated for project: {time_to_complite} days</p>
        <p>Time before project start: {time_to_start} days</p>
      </div>
      <div className="action-wrapper">
        <span>
          <a href={`/user/${author}`}>@{author}</a>
        </span>
        <div className="under-action-wrapper">
          <button className="respond-button" onClick={() => setIsModalOpen(true)}>Respond</button>
          <button className="more-button" onClick={() => navigate(`/project/${id}`)}>More</button>
        </div>
      </div>
    </div>
  </>
  );
}