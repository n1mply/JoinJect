/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import settings from './icons/settings.svg'
import "./Profile.css";

export default function Profile({ apiClient }) {
  const { routerUsername } = useParams();
  const [userData, setUserData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get(`/user/${routerUsername}`);
        setUserData(response.data.user_data);
        setIsOwner(response.data.is_owner);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [routerUsername, apiClient]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="profile">
      {isOwner && (
        <button className="settings-button" onClick={() => console.log("Open settings...")}>
          <img src={settings}/>  
        </button>
      )}
      <div className="base-info-block">
        <div className="avatar">
          <p>n</p>
        </div>
        <p className="username">{userData.username}</p>
        <p className="description">{userData.bio}</p>
      </div>
      <div className="data-user-block">
        <h1 className="grade-spec">{userData.selectedGrade}</h1>
        <div className="profile-skills">
            <p>Skills</p>
            {userData.selectedSkills.map((skill) => (
          <span key={skill} className="skill">{skill}</span>
            ))}
        </div>
      </div>
    </div>
  );
}