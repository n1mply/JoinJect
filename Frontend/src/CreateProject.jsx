import Select from 'react-select';
import { useEffect, useState } from 'react';

export default function CreateProject({ apiClient }) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [changeSkills, setChangeSkills] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([null]);
  const [skills, setSkills] = useState([]);
  const [members, setMembers] = useState([]);

  const handleChangeProjectName = (e) => {
    setProjectName(e.target.value);
  };

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeSkills = (selectedOption) => {
    setChangeSkills(selectedOption);
  };

  // Обработчик выбора грейда
  const handleChangeMembers = (selectedOption, index) => {
    const newSelectedGrades = [...selectedGrades];
    newSelectedGrades[index] = selectedOption;
    setSelectedGrades(newSelectedGrades);

    // Если выбран грейд, добавляем новый селект
    if (selectedOption && index === selectedGrades.length - 1) {
      setSelectedGrades([...newSelectedGrades, null]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      `Name ${projectName}\nDescription ${description}\nSkills${changeSkills}\nMembers${selectedGrades}\nTime`
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/data");
        setSkills(response.data.skills);
        setMembers(response.data.grades);
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

  const getGradeColor = (grade) => {
    if (grade?.toLowerCase().startsWith("junior")) {
      return "#859cff";
    } else if (grade?.toLowerCase().startsWith("middle")) {
      return "#3353de";
    } else if (grade?.toLowerCase().startsWith("senior")) {
      return "#1d3499";
    }
    return "#6582ff";
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? getGradeColor(state.data.label)
        : state.isFocused
        ? "#f0f0f0"
        : "white",
      color: state.isSelected ? "white" : "black",
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: getGradeColor(state.data.label),
    }),
    control: (provided) => ({
      ...provided,
      borderColor: "#6582ff",
    }),
  };

  return (
    <>
      <h1>Create your project</h1>
      <form className="create-project-form" onSubmit={handleSubmit}>
        <div style={{fontWeight:600}} className="form-container">
          <label htmlFor="ProjectName">Project name</label>
          <input
            type="text"
            name="ProjectName"
            id="ProjectName"
            onChange={handleChangeProjectName}
          />
        </div>
        <div style={{fontWeight:600}} className="form-container">
          <label htmlFor="Description">Description</label>
          <textarea
            name="Description"
            id="Description"
            onChange={handleChangeDescription}
            minLength={80}
            maxLength={500}
          ></textarea>
        </div>
        <div style={{fontWeight:600}} className="form-container">
          <label htmlFor="Skills">Skills for this project</label>
          <Select
            options={skillsSelection}
            isMulti
            onChange={handleChangeSkills}
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
            })}
          />
        </div>
        <div className="form-container">
          <label style={{fontWeight:600}} htmlFor="Members">Participants required for the project:</label>
          {selectedGrades.map((grade, index) => (
            <div key={index} className="member-select-container">
              <label htmlFor={`Member${index + 1}`}>Member {index + 1}</label>
              <Select
                id={`Member${index + 1}`}
                isClearable
                onChange={(selectedOption) => handleChangeMembers(selectedOption, index)}
                options={gradesSelection}
                value={grade}
                name={`Member${index + 1}`}
                className="skills-select"
                styles={customStyles}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 5,
                  colors: {
                    ...theme.colors,
                    primary: "#6582ff",
                  },
                })}
              />
            </div>
          ))}
        </div>
        <div className="form-container time-container">
          <label style={{fontWeight:600}} htmlFor="Time">Time to complete the project (in days)</label>
          <input id="Time" type="text" minLength={1} maxLength={2}/>
        </div>
        <div className='create-button'>
          <button type="submit">Create</button>
        </div>
      </form>
    </>
  );
}