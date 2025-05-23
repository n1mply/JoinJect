import "./TechIconsCloud.css";
import useWindowWidth from "./hooks/windowWidth";


const icons = [
  { name: "js", size: 40, x: "5vw", y: "10vh" },
  { name: "ts", size: 42, x: "15vw", y: "20vh" },
  { name: "react", size: 50, x: "17vw", y: "11vh" },
  { name: "python", size: 44, x: "23vw", y: "25vh" },
  { name: "nodejs", size: 46, x: "70vw", y: "50vh" },
  { name: "flutter", size: 38, x: "11vw", y: "6vh" },
  { name: "go", size: 44, x: "83vw", y: "22vh" },
  { name: "rust", size: 48, x: "83vw", y: "8vh" },
  { name: "angular", size: 42, x: "76vw", y: "27vh" },
  { name: "c", size: 48, x: "17vw", y: "35vh" },
  { name: "cpp", size: 44, x: "28vw", y: "35vh" },
  { name: "django", size: 38, x: "14vw", y: "48vh" },
  { name: "electron", size: 46, x: "8vw", y: "28vh" },
  { name: "java", size: 42, x: "66vw", y: "42vh" },
  { name: "kotlin", size: 40, x: "70vw", y: "32vh" },
  { name: "nextjs", size: 45, x: "78vw", y: "38vh" },
  { name: "nuxt", size: 40, x: "86vw", y: "30vh" },
  { name: "swift", size: 38, x: "75vw", y: "48vh" },
  { name: "vuejs", size: 40, x: "84 vw", y: "47vh" },
  { name: "fastapi", size: 38, x: "80vw", y: "15vh" },
  { name: "dart", size: 44, x: "25vw", y: "45vh" },
  { name: "github", size: 45, x: "5vw", y: "40vh" },
  { name: "mongodb", size: 38, x: "70vw", y: "17vh" },
  { name: "docker", size: 44, x: "2vw", y: "22vh" },
];

export default function TechIconsCloud({}){
  const windowWidth = useWindowWidth()
  const getAdjustedSize = (originalSize) => {
    return windowWidth <= 430 ? originalSize * 0.55 : originalSize;
  };

  return (
    <div className="icons-container">
      {icons.map((icon, i) => (
        <img
          key={i}
          src={`/icons/${icon.name}.svg`}
          className="tech-icon"
          style={{
            width: getAdjustedSize(icon.size),
            top: icon.y,
            left: icon.x,
            animationDelay: `${i * 0.2}s`,
          }}
          alt={icon.name}
        />
      ))}
    </div>
  );
};


