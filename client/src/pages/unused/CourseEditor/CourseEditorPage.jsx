import "./courseEditor.css"
import MinimizedHeader from "../../components/other/minimizedHeader";
import CourseEditor from "./CourseEditor";
import Panel from "./Panel";
import { LanguageContext } from "../../components/LanguageContext/LanguageContext";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

const CourseEditorPage = () => {
    const { i18n } = useTranslation();
    const [borders, setBorders] = useState(false)
    const [studentView, setStudentView] = useState(false)
    const { lng, setLng } = useContext(LanguageContext)

    const sLng = () => {
        if (lng === "est") {
            setLng("eng")
            i18n.changeLanguage("eng");
        }
        else {
            setLng("est")
            i18n.changeLanguage("est");
        }
    }

    return (<div>
        <MinimizedHeader />
        <div className="course_editor-wrap">
            <Panel setBorders={() => setBorders(!borders)} setStudentView={() => setStudentView(!studentView)} setLng={sLng} />
            {!studentView ? (<CourseEditor borders={borders} lng={lng} />) : (<div></div>)}
        </div>
    </div>)
}

export default CourseEditorPage;