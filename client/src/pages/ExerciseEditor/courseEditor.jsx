import { useTranslation } from "react-i18next"
import { useState, useEffect, useRef } from "react";
import client_config from "../../client_config.json"

import plus from "../../pictures/plus.png"
import openImg from "../../pictures/open-exercise-btn.png"
import deleteImg from "../../pictures/delete-red.png"

const CourseEditor = ({ setOpenExerciseEditor, setOpenedExerciseId }) => {
    const { t } = useTranslation();

    const errorMsg = useRef(null)
    const [courses, setCourses] = useState({})
    const [exerciseIdxs, setExerciseIdxs] = useState({})
    const [order, setOrder] = useState({})
    const [draggedItem, setDraggedItem] = useState(null)

    useEffect(() => {
        getCourses()
    }, [])

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
            }
        })
    }

    const courseInit = () => {
        if (courses.length <= 0) return;

        let i = 0;
        let breaks = []
        let newExerciseIdxs = {};
        Object.values(courses).forEach((exercises) => {
            Object.keys(exercises[1]).forEach((exerciseId) => {
                newExerciseIdxs[i] = exerciseId
                i++;
            })
            breaks.push(i)
        })

        let newOrder = {}
        let part = []
        let c = 0;
        for (let x = 0; x < i; x++) {
            if (breaks.includes(x)) {
                newOrder[Object.keys(courses)[c++]] = part;
                part = [x]
                continue;
            }
            part.push(x)
        }
        newOrder[Object.keys(courses)[c]] = part;
        setExerciseIdxs(newExerciseIdxs);
        setOrder(newOrder)
    }

    const handleDragStart = (index) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e, id, courseName) => {
        e.preventDefault();

        const idIdx = order[courseName].indexOf(id)
        const dIdx = order[courseName].indexOf(draggedItem)
        if (draggedItem === null || dIdx === idIdx) return;
        console.log(`${dIdx} - ${idIdx}`)

        let newOrder = { ...order }
        newOrder[courseName][idIdx] = draggedItem;
        newOrder[courseName][dIdx] = id;

        setOrder(newOrder)
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleAddCourse = () => {
        let i = 0
        let courseName = `${t("course")} ${i}`;
        while (courses[courseName]) {
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
                const errorData = await res.json();
                errorMsg.current.textContent = errorData.error || 'Error';
                errorMsg.current.hidden = false;
                setTimeout(() => {
                    errorMsg.current.hidden = true;
                }, 4000)
            } else {
                console.log("huihuihuiSahurrr")
            }
        })
    }

    const handleAddExercise = () => {

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
                    {Object.entries(order).map(([courseName, data]) => {
                        if (!courses[courseName] || !courses[courseName][1]) {
                            return null;
                        }
                        const [courseId] = courses[courseName][0]; // add exercise, del course/exercise, change names, open exercise, chnage exercise 
                        return (
                            <div className="course_menu-course">
                                <div className="course_menu-line">
                                    <div className="course_menu-course-name">{courseName}</div>
                                    <div className="course_menu-course-del"><img src={deleteImg} alt="Delete" /></div>
                                    <button className="course_menu-btn small_btn"><img src={plus} />{t("add_exercise")}</button>
                                </div>
                                <div className="course_menu-course-exercises">
                                    {data.map((idx) => (
                                        <div className="course_menu-exercise" draggable="true"
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={(e) => handleDragOver(e, idx, courseName)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <div className="course_menu-exercise-name">{courses[courseName][1][exerciseIdxs[idx]]}</div>
                                            <div className="course_menu-exercise-change">
                                                <img src={openImg} alt="Open" />
                                                <img src={deleteImg} alt="Delete" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CourseEditor 