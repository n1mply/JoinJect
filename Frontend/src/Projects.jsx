import Project from "./Project"
import { useEffect, useState } from "react";
import Search from "./Search";

export default function Projects({apiClient}){
    const [projects, setProjects] = useState([])

    useEffect(() => {
      const fetchData = async () => {
        const response = await apiClient.get("/project/get_projects");
        const projectsInfo = await response.data.projects
        setProjects(projectsInfo);
      };
      fetchData();
    }, []);

    return (
    <>
        <Search>Type name of project or use filters</Search>
        <h1 className="title">Find the perfect project for yourself or create your own!</h1>
        <div className="projects">
          {projects.map((projectData)=>(<Project key={projectData.name} {...projectData}/>))}
        </div>
    </>
    )
}