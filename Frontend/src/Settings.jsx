import './Settings.css';
import DragNDropAvatar from './DragAndDropAvatar';
import { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';

export default function Settings({ apiClient }) {
    const [bio, setBio] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleSelectSkills = (selectedOptions) => {
        setSelectedSkills(selectedOptions || []);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                
                // Получаем данные пользователя
                const username = await apiClient.get('/me');
                const userResponse = await apiClient.get(`/user/${username.data.username}`);
                setBio(userResponse.data.user_data.bio || '');
                
                // Преобразуем навыки пользователя в формат для react-select
                const userSkills = userResponse.data.user_data.selectedSkills || [];
                const formattedUserSkills = userSkills.map(skill => ({
                    value: skill,
                    label: skill
                }));
                setSelectedSkills(formattedUserSkills);
                
                // Получаем все возможные навыки
                const skillsResponse = await apiClient.get('/data');
                setAllSkills(skillsResponse.data.skills || []);
                
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserData();
    }, [apiClient]);

    // Мемоизируем преобразование навыков для оптимизации
    const skillsOptions = useMemo(() => {
        return allSkills.map(skill => ({
            value: skill,
            label: skill
        }));
    }, [allSkills]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <form>
            <h1>Edit your profile</h1>
            <DragNDropAvatar/>
            <p className="edit-description">Edit description</p>
            <textarea 
                name="description" 
                id="description" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
            />
            
            <p className="edit-skills">Edit skills</p>
            <Select
                className="skills-select"
                value={selectedSkills}
                options={skillsOptions}
                isMulti
                onChange={handleSelectSkills}
                isClearable={false}
                placeholder="Select skills..."
                noOptionsMessage={() => "No skills available"}
            />
            <button className='action-button' type='submit'>Save</button>
        </form>
    );
}