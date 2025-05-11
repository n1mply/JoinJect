/* eslint-disable react/prop-types */
 
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GitHubCallback({ apiClient }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    console.log("GitHub callback code:", code);

    const handleAuth = async () => {
      try {
        if (!code) {
          throw new Error("Authorization code missing");
        }

        const response = await apiClient.get(`/auth/github/callback?code=${code}`, {
          withCredentials: true,  
        });
        console.log("Auth response:", response.data);

        if (response.data.message === "Authentication successful") {
          const username = await apiClient.get('/me')
          const userData = await apiClient.get(`/user/${username.data.username}`)
          if (!userData.data.user_data.bio){
            navigate("/signup/finish");
            location.reload()
          }
          else {
            navigate(`/user/${username.data.username}`);
            location.reload()
          }
        } 
        else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("GitHub auth error:", {
          message: error.message,
          response: error.response?.data,
        });
        navigate("/signin", { state: { error: "GitHub login failed" } });
      }
    };

    handleAuth();
  }, [searchParams, navigate, apiClient]);

  return (
    <div className="github-callback">
      <h2>Processing GitHub login...</h2>
      <p>Please wait while we authenticate your account</p>
    </div>
  );
}