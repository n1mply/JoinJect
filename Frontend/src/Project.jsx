/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";

export default function Project({ name, description, skills, members, time_to_complite, time_to_start, author, id }) {
  const navigate = useNavigate();

  return (
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
          <a href={`/user/${author}`}>@{author}</a> {/* Ссылка на профиль автора */}
        </span>
        <div className="under-action-wrapper">
          <button className="respond-button" onClick={() => console.log("Modal")}>Respond</button>
          <button className="more-button" onClick={() => navigate(`/project/${id}`)}>More</button> {/* Ссылка на детали проекта */}
        </div>
      </div>
    </div>
  );
}