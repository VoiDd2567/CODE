import MinimizedHeader from "../../components/other/minimizedHeader"
import ExerciseEditor from "./exerciseEditor"
import CourseEditor from "./courseEditor"

import "./exerciseEditor.css"
import "./componenets/components.css"

import { useState } from "react"

const ExerciseEditorPage = () => {
    const [openExerciseEditor, setOpenExerciseEditor] = useState(true)

    return <div className="exercise_editor_page-wrap">
        <MinimizedHeader showCode={true} />
        <div className="exercise_editor_page">
            <CourseEditor />
            {openExerciseEditor && <ExerciseEditor />}
        </div>
    </div>
}

export default ExerciseEditorPage