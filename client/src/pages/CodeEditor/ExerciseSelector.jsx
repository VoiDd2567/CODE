import { useRef, useState } from "react";
import "./exerciseSelector.css"
import { useTranslation } from "react-i18next";
import complete from "../../pictures/complete-green.png"
import question from "../../pictures/question.png"
import incomplete from "../../pictures/incomplete.png"
import client_config from "../../client_config.json"

const ExerciseSelector = ({ exercises, setExerciseChoose, getExercise, updateExercises }) => {
    const { t } = useTranslation();

    const exercisesList = useRef(null)
    const courseRef = useRef(null)
    const successRef = useRef(null)
    const [selectedExerciseId, setSelectedExerciseId] = useState(null)
    const [expandedCourses, setExpandedCourses] = useState(
        Object.fromEntries(Object.keys(exercises).map(courseName => [courseName, true]))
    );

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

    const handleCourseAdd = () => {
        const courseId = courseRef.current.value;

        fetch(`${client_config.SERVER_IP}/api/exercise/access-course`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ courseId: courseId })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.error === "No course found") {
                    successRef.current.textContent = t("no_course_found")
                } else if (errorData.error === "Course is already added") {
                    successRef.current.textContent = t("course_already_added")
                }
                successRef.current.style.color = "red"
                setTimeout(() => {
                    successRef.current.textContent = ""
                }, 3000)
                throw new Error(`Error ${res.status} : \n ${errorData}`);
            } else {
                updateExercises()
                successRef.current.textContent = t("course_added")
                successRef.current.style.color = "green"
                setTimeout(() => {
                    successRef.current.textContent = ""
                }, 3000)
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }

    const toggleCourse = (courseName) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseName]: !prev[courseName]
        }));
    };

    return (
        <div className="exercise-selector-wrap">
            <div className="exercise-selector">
                <div className="exercise-selector__choose-label">{t("exercise_choose")}</div>
                <div ref={exercisesList} className="exercise-selector__exercises-list">
                    {Object.entries(exercises).map(([courseName, courseExercises]) => (
                        <div key={courseName} className="exercise-selector__course-section">
                            <div className="exercise-selector__course-header" onClick={() => toggleCourse(courseName)}>
                                <span className="exercise-selector__course-arrow">
                                    {expandedCourses[courseName] ? '▼' : '▶'}
                                </span>
                                {courseName}
                            </div>
                            {expandedCourses[courseName] && (
                                <div className="exercise-selector__course-exercises">
                                    {Object.entries(courseExercises).map(([exerciseId, [exerciseName, completeType]]) => {
                                        const img = completeType === "r" ? incomplete : completeType === "y" ? question : complete;
                                        console.log(completeType)
                                        return (
                                            <div className="exercise-selector__exercise-wrap">
                                                <div key={exerciseId} id={exerciseId} onClick={handleExerciseClick} className="exercise-selector__exercise" >
                                                    {exerciseName}
                                                </div>
                                                <div id={exerciseId} onClick={handleExerciseClick} className="exercise-selector__exercise-correct-status" >
                                                    <img src={img} alt="" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="exercise-selector__buttons">
                    <div className="exercise-selector__buttons__btn" onClick={handleSelectClick}>{t("select")}</div>
                    <div className="exercise-selector__buttons__btn" onClick={handleBackClick}>{t("back")}</div>
                </div>
            </div>
            <div className="course_add-wrap">
                <div className="course_add">
                    <div className="course_add-header">{t("add_course")}</div>
                    <div className="course_add-main">
                        <div className="course_add-input-wrap">
                            <input ref={courseRef} type="text" className="course_add-input" placeholder={t("course_id")} />
                            <div className="course_add-bottom">
                                <div ref={successRef} className="course_add-success"></div>
                                <div className="course_add-add_btn" onClick={handleCourseAdd}>{t("add")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExerciseSelector;