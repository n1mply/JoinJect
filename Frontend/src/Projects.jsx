/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Project from "./Project";
import Search from "./Search";
import PaginationSkrollBar from "./PaginationScrollBar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Projects.css"

export default function Projects({ apiClient }) {
  const {pages} = useParams()
  const [pagInfo, setPagInfo] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pag_projects = await apiClient.get(`/project/get_pag_projects/${pages}`)
        setPagInfo(pag_projects.data.pagination)
        console.log(pag_projects.data.pagination.total_pages)
        setFilteredProjects(pag_projects.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchData();
  }, [apiClient, pages]);

  const handleSearch = async (query) => {
    try {
      if (query) {
      const response = await apiClient.get(`/project/get_project_by_name/?name=${query}`);
      const projectsInfo = response.data.projects;
      setFilteredProjects(projectsInfo);
      }
      else{

      }

    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleFilterSearch = async (selectedSkills, selectedMember) => {
    try {
        if (selectedMember || selectedSkills){
        const response = await apiClient.get("/project/get_all_projects");
        let projectsInfo = response.data.projects;

        if (selectedSkills.length > 0) {
          projectsInfo = projectsInfo.filter((project) =>
            selectedSkills.every((skill) => project.skills.includes(skill))
          );
        }
        if (selectedMember) {
          projectsInfo = projectsInfo.filter(
            (project) => project.members.includes(selectedMember.value)
          );
      }
      setFilteredProjects(projectsInfo);
      }
      else{

      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <>
      <Search
        onSearch={handleSearch}
        onFilterSearch={handleFilterSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        apiClient={apiClient}
      >
        Type name of project
      </Search>
      <h1 className="title">
        Find the perfect project for yourself or create your own!
      </h1>
      <div className="projects">
        {filteredProjects.map((projectData) => (
          <Project key={projectData.name} {...projectData} />
        ))}
      </div>
      <PaginationSkrollBar pagInfo={pagInfo} pages={pages}></PaginationSkrollBar>
    </>
  );
}