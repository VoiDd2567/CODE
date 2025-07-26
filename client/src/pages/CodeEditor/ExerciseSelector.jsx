import { useRef, useState } from "react";
import "./exerciseSelector.css"
import { useTranslation } from "react-i18next";

const ExerciseSelector = ({ exercises, setExerciseChoose, getExercise }) => {
    const { t } = useTranslation();
    const exercisesList = useRef(null)
    const [selectedExerciseId, setSelectedExerciseId] = useState(null)

    const handleBackClick = () => {
        setExerciseChoose(false)
    }

    const handleExerciseClick = (e) => {
        const exerciseId = e.currentTarget.id;
        if (exerciseId === selectedExerciseId) {
            getExercise(exerciseId);
            setExerciseChoose(false);
            return
        }
        setSelectedExerciseId(exerciseId);
        const exercises = exercisesList.current.querySelectorAll(".exercise-selector__exercise")
        for (let exercise of exercises) {
            if ("active" in exercise.classList) {
                exercise.classList.toggle("active");
            }
        }
        e.currentTarget.classList.toggle("active");

    }

    const handleSelectClick = () => {
        getExercise(selectedExerciseId);
        setExerciseChoose(false);
    }

    return (
        <div className="exercise-selector-wrap">
            <div className="exercise-selector">
                <div className="exercise-selector__choose-label">{t("exercise_choose")}</div>
                <div ref={exercisesList} className="exercise-selector__exercises-list">
                    {Object.entries(exercises).map(([courseName, courseExercises]) => ( // Here is fukking margin because of scroll and
                        Object.entries(courseExercises).map(([exerciseId, exerciseName]) => ( //  it looks like shit. Idk how to fix it
                            <div key={exerciseId} id={exerciseId} onClick={handleExerciseClick} className="exercise-selector__exercise">
                                {courseName} / {exerciseName}
                            </div>
                        ))
                    ))}
                </div>
                <div className="exercise-selector__buttons">
                    <div className="exercise-selector__buttons__btn" onClick={handleSelectClick}>{t("select")}</div>
                    <div className="exercise-selector__buttons__btn" onClick={handleBackClick}>{t("back")}</div>
                </div>
            </div>
        </div>
    )
}

export default ExerciseSelector;