import Project from "./Project";
import { useEffect, useState } from "react";
import Search from "./Search";

export default function Projects({ apiClient }) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]); // Для хранения отфильтрованных проектов

  // Загрузка всех проектов при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/project/get_all_projects");
        const projectsInfo = response.data.projects;
        setProjects(projectsInfo);
        setFilteredProjects(projectsInfo); // Инициализируем отфильтрованные проекты
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchData();
  }, []);

  // Функция для поиска проектов по имени
  const handleSearch = async (query) => {
    try {
      const response = await apiClient.get(
        `/project/get_project_by_name/?name=${query}`
      );
      const projectsInfo = response.data.projects;
      setFilteredProjects(projectsInfo); // Обновляем отфильтрованные проекты
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Функция для поиска проектов по фильтрам
  const handleFilterSearch = async (selectedSkills, selectedMember) => {
    try {
      const response = await apiClient.get("/project/get_all_projects");
      let projectsInfo = response.data.projects;

      // Фильтрация по навыкам (нестрогая)
      if (selectedSkills.length > 0) {
        projectsInfo = projectsInfo.filter((project) =>
          selectedSkills.every((skill) => project.skills.includes(skill))
        );
      }

      // Фильтрация по участникам (нестрогая)
      if (selectedMember) {
        projectsInfo = projectsInfo.filter(
          (project) => project.members.includes(selectedMember.value)
        );
      }

      setFilteredProjects(projectsInfo); // Обновляем отфильтрованные проекты
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <>
      <Search
        onSearch={handleSearch} // Передаем функцию для поиска по названию
        onFilterSearch={handleFilterSearch} // Передаем функцию для поиска по фильтрам
        searchQuery={searchQuery} // Передаем текущий поисковый запрос
        setSearchQuery={setSearchQuery} // Передаем функцию для обновления поискового запроса
        apiClient={apiClient} // Передаем apiClient для получения данных фильтров
      >
        Type name of project or use filters
      </Search>
      <h1 className="title">
        Find the perfect project for yourself or create your own!
      </h1>
      <div className="projects">
        {filteredProjects.map((projectData) => (
          <Project key={projectData.name} {...projectData} />
        ))}
      </div>
    </>
  );
}