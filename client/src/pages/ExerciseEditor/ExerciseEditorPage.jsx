import MinimizedHeader from "../../components/other/minimizedHeader"
import CourseEditor from "./courseEditor"
import ExerciseEditor from "./ExerciseEditor"

import "./exerciseEditor.css"
import "./componenets/components.css"

import { useState } from "react"

const ExerciseEditorPage = () => {
    const [openExerciseEditor, setOpenExerciseEditor] = useState(false)
    const [openedExerciseId, setOpenedExerciseId] = useState(null)
    const [isSaved, setIsSaved] = useState(true)

    return <div className="exercise_editor_page-wrap">
        <MinimizedHeader showCode={true} fixed={true} />
        <div className="exercise_editor_page">
            <CourseEditor setOpenedExerciseId={setOpenedExerciseId} setOpenExerciseEditor={setOpenExerciseEditor} isSaved={isSaved} setIsSaved={setIsSaved} />
            {openExerciseEditor && <ExerciseEditor key={openedExerciseId} exerciseId={openedExerciseId} setOpenExerciseEditor={setOpenExerciseEditor} setIsSaved={setIsSaved} />}
        </div>
    </div>
}

export default ExerciseEditorPage