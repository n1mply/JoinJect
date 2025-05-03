import './Settings.css';
import DragNDropAvatar from './DragAndDropAvatar';
import { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import check from './icons/check_circle.svg'

export default function Settings({ apiClient }) {
    const [bio, setBio] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState(null); 
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSelectSkills = (selectedOptions) => {
        setSelectedSkills(selectedOptions || []);
        setShowSuccess(false)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
 
            if (file) {
                formData.append('photo', file);
            }

            formData.append('bio', bio);

            const skillsArray = selectedSkills.map(skill => skill.value);
            formData.append('skills', JSON.stringify(skillsArray));
            console.log(file, bio, skillsArray)
            const response = await apiClient.put('/user/edit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setShowSuccess(true)
            
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const username = await apiClient.get('/me');
                const userResponse = await apiClient.get(`/user/${username.data.username}`);
                setBio(userResponse.data.user_data.bio || '');
                
                const userSkills = userResponse.data.user_data.selectedSkills || [];
                const formattedUserSkills = userSkills.map(skill => ({
                    value: skill,
                    label: skill
                }));
                setSelectedSkills(formattedUserSkills);
                
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

    const skillsOptions = useMemo(() => {
        return allSkills.map(skill => ({
            value: skill,
            label: skill
        }));
    }, [allSkills]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <form className='settings-form' onSubmit={handleSubmit}>
        {showSuccess && <div className="success">
                <p>Profile was updated!</p> 
                <img src={check} alt="" />
            </div>}
            <h1>Edit your profile</h1>
            <DragNDropAvatar onFileUpload={setFile} />
            <p className="edit-description">Edit description</p>
            <textarea 
                name="description" 
                id="description" 
                value={bio} 
                onChange={(e) => {
                    setBio(e.target.value)
                    setShowSuccess(false)
                }}
                minLength={60} 
                required
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