import "./courseEditor.css"
import MinimizedHeader from "../../components/other/minimizedHeader";
import CourseEditor from "./CourseEditor";

const CourseEditorPage = () => {
    return (<div>
        <MinimizedHeader />
        <div className="course_editor-wrap">
            <div className="left_pannel"></div>
            <CourseEditor />
        </div>
    </div>)
}

export default CourseEditorPage;