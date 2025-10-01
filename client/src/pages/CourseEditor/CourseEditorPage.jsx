import "./courseEditor.css"
import MinimizedHeader from "../../components/other/minimizedHeader";
import CourseEditor from "./CourseEditor";
import Panel from "./Panel";
import { useState } from "react";

const CourseEditorPage = () => {
    const [borders, setBorders] = useState(false)


    const handleSetBorders = () => {
        setBorders(!borders)
    }

    return (<div>
        <MinimizedHeader />
        <div className="course_editor-wrap">
            <Panel setBorders={handleSetBorders} />
            <CourseEditor borders={borders} />
        </div>
    </div>)
}

export default CourseEditorPage;