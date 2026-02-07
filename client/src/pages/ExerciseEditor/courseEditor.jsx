import { useTranslation } from "react-i18next"
import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import client_config from "../../client_config.json"

import AskWindow from "../../components/AskWindow/AskWindow";
import plus from "../../pictures/plus.png"
import openImg from "../../pictures/open-exercise-btn.png"
import deleteImg from "../../pictures/delete-red.png"

const CourseEditor = ({ setOpenExerciseEditor, setOpenedExerciseId, isSaved, setIsSaved }) => {
    const { t } = useTranslation();

    const errorMsg = useRef(null)
    const [courses, setCourses] = useState({})
    const [exerciseIdxs, setExerciseIdxs] = useState({})
    const [order, setOrder] = useState({})
    const [draggedItem, setDraggedItem] = useState(null)

    const [askWindowOpen, setAskWindowOpen] = useState(false)
    const [askWindowQuestion, setAskWindowQuestion] = useState("No question")
    const [askWindowFunc, setAskWindowFunc] = useState(() => { })

    const [editingCourseId, setEditingCourseId] = useState(null)
    const [editingCourseName, setEditingCourseName] = useState("")


    const location = useLocation();

    useEffect(() => {
        getCourses()
    }, [location])

    useEffect(() => {
        courseInit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses])

    const getCourses = () => {
        fetch(`${client_config.SERVER_IP}/api/user/my-courses`, {
            method: 'GET',
            credentials: 'include'
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMsg.current.textContent = errorData.error || 'Error';
                errorMsg.current.hidden = false;
                setTimeout(() => {
                    errorMsg.current.hidden = true;
                }, 4000)
            } else {
                const data = await res.json();
                setCourses(data.courses)
                console.log(data.courses)
            }
        })
    }

    const courseInit = () => {
        if (Object.keys(courses).length <= 0) return;

        let i = 0;
        let newExerciseIdxs = {};
        let newOrder = {};

        Object.entries(courses).forEach(([courseId, courseData]) => {
            const exercises = courseData[1]; // exercises object
            const exerciseIndices = [];

            Object.keys(exercises).forEach((exerciseId) => {
                newExerciseIdxs[i] = exerciseId;
                exerciseIndices.push(i);
                i++;
            })

            newOrder[courseId] = exerciseIndices;
        })

        setExerciseIdxs(newExerciseIdxs);
        setOrder(newOrder)
    }

    const handleDragStart = (index) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e, id, courseId) => {
        e.preventDefault();

        const idIdx = order[courseId].indexOf(id)
        const dIdx = order[courseId].indexOf(draggedItem)
        if (draggedItem === null || dIdx === idIdx) return;

        let newOrder = { ...order }
        newOrder[courseId][idIdx] = draggedItem;
        newOrder[courseId][dIdx] = id;

        setOrder(newOrder)
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        saveExerciseOrder();
    };

    const handleAddCourse = () => {
        let i = 0
        let courseName = `${t("course")} ${i}`;

        // Check if courseName already exists in any course
        const courseNames = Object.values(courses).map(courseData => courseData[0]);
        while (courseNames.includes(courseName)) {
            i++;
            courseName = `${t("course")} ${i}`;
        }

        fetch(`${client_config.SERVER_IP}/api/exercise/create-course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseName: courseName }),
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            } else {
                getCourses() // Refresh courses after adding
            }
        })
    }

    const handleAddExercise = (courseId) => {
        let i = 0;
        let exerciseName = `${t("exercise")} ${i}`;
        const exercises = courses[courseId][1];
        const exerciseNames = Object.values(exercises);

        while (exerciseNames.includes(exerciseName)) {
            i++;
            exerciseName = `${t("exercise")} ${i}`;
        }

        fetch(`${client_config.SERVER_IP}/api/exercise/create-exercise`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId: courseId, exerciseName: exerciseName }),
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            } else {
                const data = await res.json();
                openExercise(data.exId)
                getCourses() // Refresh courses after adding
            }
        })
    }

    const handleDeletePress = (type, id, name, courseId = null) => {
        if (type === "course") {
            makeAskWindow(`${t("delete_confirm")} ${name}?`, () => deleteCourse(id))
        }
        if (type === "exercise") {
            makeAskWindow(`${t("delete_confirm")} ${name}?`, () => deleteExercise(id, courseId))
        }
    }

    const deleteCourse = (id) => {
        fetch(`${client_config.SERVER_IP}/api/exercise/delete-course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId: id }),
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            } else {
                getCourses() // Refresh courses after deleteing
            }
        })
    }

    const deleteExercise = (id, courseId) => {
        fetch(`${client_config.SERVER_IP}/api/exercise/delete-exercise`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId: courseId, exerciseId: id }),
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            } else {
                getCourses() // Refresh courses after deleteing
                setOpenExerciseEditor(false)
                setOpenedExerciseId(null)
            }
        })
    }

    const saveExerciseOrder = () => {
        let orderN = {}

        Object.entries(order).forEach(([id, items]) => {
            orderN[id] = items.map(item => exerciseIdxs[item])
        })

        fetch(`${client_config.SERVER_IP}/api/exercise/save-exercise-order`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ order: orderN })
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            }
        })
    }

    const makeAskWindow = (question, func) => {
        setAskWindowQuestion(question);
        setAskWindowFunc(() => func);
        setAskWindowOpen(true);
    }

    const handleOpenExercise = (id) => {
        if (!isSaved) {
            makeAskWindow(t("not_saved_q"), () => openExercise(id))
        } else {
            openExercise(id)
        }
    }

    const openExercise = (id) => {
        setIsSaved(true)
        setOpenExerciseEditor(true)
        setOpenedExerciseId(id)
    }

    const setError = async (res) => {
        const errorData = await res.json();
        errorMsg.current.textContent = errorData.error || 'Error';
        errorMsg.current.hidden = false;
        setTimeout(() => {
            errorMsg.current.hidden = true;
        }, 4000)
    }

    const handleCourseNameClick = (courseId, currentName) => {
        setEditingCourseId(courseId)
        setEditingCourseName(currentName)
    }

    const handleCourseNameChange = (e) => {
        setEditingCourseName(e.target.value)
    }

    const handleCourseNameBlur = (courseId) => {
        if (editingCourseName.trim() && editingCourseName !== courses[courseId][0]) {
            updateCourseName(courseId, editingCourseName.trim())
        }
        setEditingCourseId(null)
        setEditingCourseName("")
    }

    const handleCourseNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur()
        } else if (e.key === 'Escape') {
            setEditingCourseId(null)
            setEditingCourseName("")
        }
    }

    const updateCourseName = (courseId, newName) => {
        setCourses(prevCourses => ({
            ...prevCourses,
            [courseId]: [newName, prevCourses[courseId][1]]
        }))

        fetch(`${client_config.SERVER_IP}/api/exercise/update-course-name`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId: courseId, courseName: newName }),
        }).then(async res => {
            if (!res.ok) {
                setError(res)
            }
        })

        getCourses();
    }

    return (
        <div className="exercise_editor-course_menu-wrap">
            <div className="course_menu">
                <div className="course_menu-error" ref={errorMsg} hidden></div>
                <div className="course_menu-line">
                    <div className="course_menu-header">{t("your_courses")}</div>
                    <button className="course_menu-btn" onClick={handleAddCourse}><img src={plus} />{t("add_course")}</button>
                </div>
                <div className="course_menu-course_list">

                    {(Object.keys(courses).length) ? (
                        Object.entries(order).map(([courseId, data]) => {
                            if (!courses[courseId] || !courses[courseId][1]) {
                                return null;
                            }
                            const [courseName, exercises, accessId] = courses[courseId];
                            return (
                                <div className="course_menu-course" key={courseId}>
                                    <div className="course_menu-line">
                                        {editingCourseId === courseId ? (
                                            <input
                                                type="text"
                                                className="course_menu-course-name-input"
                                                value={editingCourseName}
                                                onChange={handleCourseNameChange}
                                                onBlur={() => handleCourseNameBlur(courseId)}
                                                onKeyDown={(e) => handleCourseNameKeyDown(e)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div
                                                className="course_menu-course-name"
                                                onClick={() => handleCourseNameClick(courseId, courseName)}
                                            >
                                                {courseName}
                                            </div>
                                        )}
                                        <div className="course_menu-course-del"><img src={deleteImg} alt="Delete" onClick={() => handleDeletePress("course", courseId, courseName)} /></div>
                                        <button className="course_menu-btn small_btn" onClick={() => handleAddExercise(courseId)}><img src={plus} />{t("add_exercise")}</button>
                                    </div>
                                    <div className="id-line">
                                        ID: {accessId}
                                    </div>
                                    <div className="course_menu-course-exercises">
                                        {data.map((idx) => (
                                            <div className="course_menu-exercise"
                                                key={idx}
                                                draggable="true"
                                                onDragStart={() => handleDragStart(idx)}
                                                onDragOver={(e) => handleDragOver(e, idx, courseId)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <div className="course_menu-exercise-name">{exercises[exerciseIdxs[idx]]}</div>
                                                <div className="course_menu-exercise-change">
                                                    <img src={openImg} alt="Open" onClick={() => handleOpenExercise(exerciseIdxs[idx])} />
                                                    <img src={deleteImg} alt="Delete" onClick={() => handleDeletePress("exercise", exerciseIdxs[idx], exercises[exerciseIdxs[idx]], courseId)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="no_course">{t("no_courses")}</div>
                    )}
                </div>
            </div>
            <AskWindow open={askWindowOpen} setOpen={setAskWindowOpen} question={askWindowQuestion} func={askWindowFunc} />
        </div>
    )
}

export default CourseEditor