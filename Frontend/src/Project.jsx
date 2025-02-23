export default function Project({name, description, skills, members, time_to_complite, time_to_start, author}){
    return (
        <div className="project">
            <h1>{name}</h1>
            <p>{description}</p>
            <div className="skills">
                {skills.map((skill)=>(
                    <span key={skill} className="skill">{skill}</span>))}
            </div>
            <div className="members">
                {members.map((member)=>(
                    <span key={member} className="member">{member}</span>))}
            </div>
            <div className="time-wrapper">
                <p>Time allocated for project: {time_to_complite} days</p>
                <p>Time before project start: {time_to_start} days</p>
            </div>
            <span><a href={`/user/${author}`}>@{author}</a></span>
        </div>
    )
}