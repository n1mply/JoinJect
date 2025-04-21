import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    <div>
      {isOwner && (
        <button onClick={() => console.log("Open settings...")}>
          Settings
        </button>
      )}
      <h1>{userData}</h1>
    </div>
  );
}