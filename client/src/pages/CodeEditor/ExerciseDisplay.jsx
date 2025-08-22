import { useRef } from "react";
import Editor from "../../components/Editor/Editor"
import cross_icon from "../../pictures/cross-icon.png"
import "./exerciseDisplay.css";

const ExerciseDisplay = ({ setExerciseOpen, setEditorH, exerciseText }) => {

    const exerciseTextDiv = useRef(null)

    const handleCloseClick = () => {
        setExerciseOpen(false);
        setEditorH(85);
    }

    const renderExerciseText = () => {
        const parts = [];
        let lastIndex = 0;
        const regex = /<<editor>>(.*?)<<\/editor>>/gs;
        const formattedExerciseText = exerciseText.replace(/\\n/g, "\n")

        for (const match of formattedExerciseText.matchAll(regex)) {
            const [fullMatch, content] = match;
            const start = match.index;

            if (start > lastIndex) {
                parts.push(<span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-line" }}>{formattedExerciseText.slice(lastIndex, start)}</span>);
            }

            const linesCount = content.split("").filter(c => c === "\n").length + 1;
            parts.push(
                <Editor key={`editor-${start}`} w={20} h={linesCount * 2.2 + 2} canBeChanged={false} editorValue={content.trim()} />
            );

            lastIndex = start + fullMatch.length;
        }

        if (lastIndex < formattedExerciseText.length) {
            parts.push(<p key={`text-last`}>{formattedExerciseText.slice(lastIndex)}</p>);
        }
        parts.push(<p><br></br><br></br></p>)
        return parts;
    };

    return (
        <div className="exercise-wrap">
            <div className="exercise-header">
                <div className="exercise-name">ExampleExercise</div>
                <div className="exercise-close-btn" onClick={handleCloseClick}><img src={cross_icon} alt="close" /></div>
            </div>
            <div ref={exerciseTextDiv} className="exercise-text">{renderExerciseText()}</div>
        </div>
    );
};

export default ExerciseDisplay;
