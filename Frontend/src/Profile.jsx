import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import settings from './icons/settings.svg'
import githubIcon from './icons/github_mark_white.svg'
import "./Profile.css";

export default function Profile({ apiClient }) {
  const navigate = useNavigate(); 
  const { routerUsername } = useParams();
  const [userData, setUserData] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [baseGrade, setBaseGrade] = useState('Newbie');
  const [confidence, setConfidence] = useState(0);
  const gradeList = ['Newbie', 'Junior', 'Middle', 'Senior'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get(`/user/${routerUsername}`);
        setUserData(response.data.user_data);
        setIsOwner(response.data.is_owner);
        
        const avatarResponse = await apiClient.get(`/user/avatar/${routerUsername}`, {
          responseType: 'blob' 
        });
        

        const avatarBlob = new Blob([avatarResponse.data]);
        const avatarUrl = URL.createObjectURL(avatarBlob);
        setAvatar(avatarUrl);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchUserData();
    
    return () => {
      if (avatar) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [routerUsername, apiClient]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="profile">
      {isOwner && (
        <button className="settings-button" onClick={() => navigate('/settings')}>
          <img src={settings} alt="Settings"/>  
        </button>
      )}
      <div className="base-info-block">

          {avatar ? (
            <img 
              src={avatar} 
              className="avatar-img"
              alt={`${userData.username}'s avatar`}
              onError={() => setAvatar(null)} 
            />
          ) : (
            <div className="avatar">
              <p>{userData.username[0]}</p>
            </div>
          )}

        <p className="username">{userData.username}</p>
        <div className="progressbar-container">
          <div className="progressbar-container-info">
            <p className="current-rank">{baseGrade}</p>
            <p className="confidence-percentage">{confidence}%</p>
            <p className="next-rank">{gradeList[gradeList.indexOf(baseGrade)+1]}</p>
          </div>
          <div className="progressbar">
            <div className="progressbar-passed" style={{width: `${confidence}%`}}></div>
          </div>
        </div>
        <p className="description">{userData.bio}</p>
        {userData.service && (
        <div className="linked-services">
          <p className="service-text">Linked services</p>
          <a
            href={`https://github.com/${userData.username}`}
            className="github-button"
            target="_blank"
            rel="noopener noreferrer">
                        <div style={{marginRight: '10px'}}>
                          <img src={githubIcon}/>
                        </div>
                        <p>Check my GitHub</p></a>
            
            </div>
        )}
      </div>
      <div className="data-user-block">
        <h1 className="grade-spec">
          {userData.grade === undefined ? 'Newbie' + " " + userData.selectedGrade : userData.grade + " " + userData.selectedGrade}
        </h1>
        <p className="skills-text">Skills</p>
        <div className="profile-skills">
          {userData.selectedSkills.map((skill) => (
            <span key={skill} className="skill">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
}