/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'

export default function FinishRegistration({apiClient}){
    const [errors, setErrors] = useState([]);
    const [bio, setBio] = useState("")
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [skills, setSkills] = useState([]);
    const [members, setMembers] = useState([]); 
    const navigate = useNavigate();  

    const handleSelectSkills = (selectedOption) => {
      setSelectedSkills(selectedOption);
        console.log(selectedSkills)
      };

    const handleChangeGrade = (selectedOption) => {
        setSelectedGrade(selectedOption);
        console.log(selectedGrade)
    };

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await apiClient.get("/data");
            const grades = response.data.grades;
            const specialties = [...new Set(grades.map(grade => grade.split(' ').slice(1).join(' ')))];
            setMembers(specialties);
            setSkills(response.data.skills);
          } catch {
            setSkills([]);
            setMembers([]);
          }
        };
        fetchData();
      }, [apiClient]);
    
      const skillsSelection = skills.map((value) => ({
        value: value,
        label: value,
      }));

      const gradesSelection = members.map((value) => ({
        value: value,
        label: value,
      }));
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        const userAddData = {
          bio: bio,
          selectedGrade: selectedGrade.value,
          selectedSkills: selectedSkills.map((skill)=>skill.value),
        }
        console.log(userAddData)
        try {
          const response = await apiClient.put("/user/finish", userAddData);
          if (response.status === 200) {
              navigate("/");
          }
      } catch (error) {
          setErrors([error.response?.data?.detail || "Update failed"]);
      }
      };
    

    return (
        <form onSubmit={handleSubmit}>
            <h1>Final Step</h1>
            {errors.length > 0 && (
            <div className="error-block">
              {errors.map((error, index) => (
                <p key={index} className="error-message">{error.message}</p>
              ))}
            </div>
            )}
            <label htmlFor="Bio">Profile bio</label>
            <textarea 
              id="Bio" 
              type="text" 
              onChange={(e)=>setBio(e.target.value)} 
              maxLength={120}
              minLength={60}
              placeholder=""
            />
            <label htmlFor="Specs">Select your specialty</label>
            <Select
            options={gradesSelection}
            onChange={handleChangeGrade}
            name="Specs"
            id="Specs"
            className="skills-select"
            theme={(theme) => ({
              ...theme,
              borderRadius: 5,
              colors: {
                ...theme.colors,
                primary: "#6582ff",
              },
            })}/>
            <label htmlFor="Skills">Select your skills</label>
            <Select
            options={skillsSelection}
            onChange={handleSelectSkills}
            isMulti
            name="Skills"
            id="Skills"
            className="skills-select"
            theme={(theme) => ({
              ...theme,
              borderRadius: 5,
              colors: {
                ...theme.colors,
                primary: "#6582ff",
              },
            })}/>
        <button className="action-button" type="submit">Sign Up</button>
        </form>
    )
}