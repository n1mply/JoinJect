import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectDetails({ apiClient }) {
  const { projectId } = useParams(); // Получаем параметр projectId из URL
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await apiClient.get(`/project/${projectId}`);
        setProjectData(response.data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectData();
  }, [projectId, apiClient]);

  if (!projectData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Project: {projectData.name}</h1>
      <p>Description: {projectData.description}</p>
      <p>Author: {projectData.author}</p>
      {/* Другие данные проекта */}
    </div>
  );
}