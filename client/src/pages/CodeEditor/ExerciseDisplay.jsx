import "./exerciseDisplay.css";
import cross_icon from "../../pictures/cross-icon.png"

const ExerciseDisplay = ({ setExerciseOpen, exerciseText }) => {

    const handleCloseClick = () => {
        setExerciseOpen(false)
    }

    return (
        <div className="exercise-wrap">
            <div className="exercise-header">
                <div className="exercise-name">ExampleExercise</div>
                <div className="exercise-close-btn" onClick={handleCloseClick}><img src={cross_icon} alt="close" /></div>
            </div>
            <div className="exercise-text">{exerciseText}</div>
        </div>
    );
};

export default ExerciseDisplay;
