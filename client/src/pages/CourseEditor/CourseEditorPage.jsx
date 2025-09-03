import "./courseEditor.css"
import EditorHeader from "./EditorHeader";
import CourseEditor from "./CourseEditor";

const CourseEditorPage = () => {
    return (<div>
        <EditorHeader />
        <div className="course_editor-wrap">
            <div className="left_pannel"></div>
            <CourseEditor />
        </div>
    </div>)
}

export default CourseEditorPage;