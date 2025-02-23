import search from './icons/search.svg';
import filterAlt from './icons/filter_alt.svg';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Search({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [filterWindow, setFilterWindow] = useState(false);
  const [skills, setSkills] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // Состояние для выбранных навыков

  const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
  });

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
  }, []);

  // Обработчик изменения состояния чекбокса
  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill) // Удаляем навык, если он уже выбран
        : [...prev, skill] // Добавляем навык, если он не выбран
    );
  };

  return (
    <div className="search">
      <input
        type="text"
        placeholder={children}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="buttons-wrapper">
        <div className="img-wrapper">
          <img src={search} alt="search" />
        </div>
        <div className="img-wrapper">
          <img
            src={filterAlt}
            alt="filter"
            onClick={() => setFilterWindow(!filterWindow)}
          />
          {filterWindow && (
            <div className="filter-window">
              <h2>Filters</h2>
              <div className="filter-skills">
                {skills.map((skill) => (
                  <label key={skill} className="skill-checkbox">
                    <input
                      type="checkbox"
                      name="skills"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      hidden
                    />
                    <span className="skill-text">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}