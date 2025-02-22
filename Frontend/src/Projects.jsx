import Project from "./Project"
import { useEffect, useState } from "react";

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
        <h1>Find the perfect project for yourself or create your own!</h1>
        <div className="projects">
            {projects.map((projectData)=>(<Project key={projectData.name} {...projectData}/>))}
        </div>
    </>
    )
}