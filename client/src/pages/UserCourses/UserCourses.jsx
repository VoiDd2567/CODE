import { useTranslation } from "react-i18next";
import MinimizedHeader from "../../components/other/minimizedHeader";
import Footer from "../../components/Footer/Footer";
import "./userCourses.css"
import js from "../../pictures/js-icon.png"
import py from "../../pictures/py-icon.png"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const UserCourses = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState(null)
    const navigate = useNavigate();


    useEffect(() => {
        fetch("https://localhost:3001/api/user/courses", {
            method: "GET",
            credentials: "include"
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData)
                console.log(errorData)
            } else {
                const data = await res.json();
                setCourses(data["courses"])
            }
        })
    }, [])

    const redirectToCourse = (id) => {
        navigate(`/course/${id}`, { replace: true });
    }

    return (<div className="courses_page">
        <MinimizedHeader />
        <div className="courses_page-main-wrap">
            <div className="courses_page-main">
                <div className="courses_page-main-heading">{t("your_courses")}</div>
                <div className="courses_page-main-courses">
                    {courses?.map((element, index) => (
                        <div key={index} className="courses_page-main-course" onClick={() => { redirectToCourse(element.id) }}>
                            <div className="course-img">
                                <img src={element.codeLng === "py" ? py : js} alt={element.name || "course"} />
                            </div>
                            <div className="course-info">
                                <div className="course-name">{element.name}</div>
                                <div className="course-author">{t("author")} : {element.author}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
        <Footer />
    </div >)
}

export default UserCourses;