/* eslint-disable react/prop-types */

import search from './icons/search.svg';
import filterAlt from './icons/filter_alt.svg';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function Search({ children, onSearch, onFilterSearch, searchQuery, setSearchQuery, apiClient }) {
  const [filterWindow, setFilterWindow] = useState(false);
  const [skills, setSkills] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/data');
        setSkills(response.data.skills);
        setMembers(response.data.grades);
      } catch {
        setSkills([]);
        setMembers([]);
      }
    };
    fetchData();
  }, [apiClient]);

  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const gradesSelection = members.map((value) => ({
    value: value,
    label: value,
  }));

  const handleSearchClick = () => {
    onSearch(searchQuery); 
  };

  const handleFilterSearchClick = () => {
    onFilterSearch(selectedSkills, selectedMember);
  };

  return (
    <div className="search">
      <input
        type="text"
        placeholder={children}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="buttons-wrapper">
        <div className="img-wrapper" onClick={handleSearchClick}>
          <img src={search} alt="search" />
        </div>
        <div className="img-wrapper">
          <img
            src={filterAlt}
            alt="filter"
            onClick={() => setFilterWindow(!filterWindow)}
          />
        </div>
      </div>
      {filterWindow && (
        <div className="filter-window">
          <h3>Filters</h3>
          <div className="filter-skills">
            <p>Necessary skills:</p>
            {skills.map((skill) => (
              <div
                key={skill}
                className={`skill-item ${
                  selectedSkills.includes(skill) ? 'selected' : ''
                }`}
                onClick={() => handleSkillChange(skill)}
              >
                {skill}
              </div>
            ))}
          </div>
          <div className="filter-member">
            <p>Member required:</p>
            <Select
              value={selectedMember}
              options={gradesSelection}
              className="member-select-filter"
              onChange={(selected) => setSelectedMember(selected)}
            />
          </div>
          <div className="filter-button-wrapper">
            <button className="apply-button" onClick={handleFilterSearchClick}>
              Apply and search
            </button>
            <button
              className="clear-button"
              onClick={() => {
                setSelectedSkills([]);
                setSelectedMember(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}