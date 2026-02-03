import { useRef } from "react";
import Editor from "../../components/Editor/Editor"
import cross_icon from "../../pictures/cross-icon.png"
import "./exerciseDisplay.css";

const ExerciseDisplay = ({ name, setExerciseOpen, setEditorH, exerciseText }) => {

    const exerciseTextDiv = useRef(null)

    const handleCloseClick = () => {
        setExerciseOpen(false);
        setEditorH(85);
    }

    const renderExerciseText = () => {

        // Replace escaped newlines with actual newlines
        const normalizedText = exerciseText.replace(/\\n/g, '\n');

        const parts = [];

        // Split by [CODE_BLOCK] tags
        const codeBlockRegex = /<<editor>>(.*?)<<\/editor>>/gs;

        let lastIndex = 0;

        for (const match of normalizedText.matchAll(codeBlockRegex)) {
            const [fullMatch, codeContent] = match;
            const start = match.index;

            // Add text before code block
            if (start > lastIndex) {
                const textContent = normalizedText.slice(lastIndex, start);
                renderTextContent(textContent, parts, lastIndex);
            }

            // Add code block
            const linesCount = codeContent.split("\n").length;
            parts.push(
                <div key={`code-${start}`} className="exercise-code-block">
                    <Editor
                        w={20}
                        h={linesCount * 2.2 + 2}
                        canBeChanged={false}
                        editorValue={codeContent}
                    />
                </div>
            );

            lastIndex = start + fullMatch.length;
        }

        // Add remaining text after last code block
        if (lastIndex < normalizedText.length) {
            const textContent = normalizedText.slice(lastIndex);
            renderTextContent(textContent, parts, lastIndex);
        }

        parts.push(<p key="spacing"><br /><br /></p>);
        return parts;
    };

    const renderTextContent = (text, parts, keyBase) => {
        if (!text) return;

        // Split text into lines
        const lines = text.split('\n');

        lines.forEach((line, index) => {
            const key = `text-${keyBase}-${index}`;
            if (line.trim()) {
                parts.push(
                    <p key={key} className="exercise-paragraph">
                        {line}
                    </p>
                );
            } else {
                parts.push(
                    <p key={key} className="exercise-paragraph">
                        <br />
                    </p>
                );
            }
        });
    };

    return (
        <div className="exercise-wrap">
            <div className="exercise-header">
                <div className="exercise-name">{name}</div>
                <div className="exercise-close-btn" onClick={handleCloseClick}>
                    <img src={cross_icon} alt="close" />
                </div>
            </div>
            <div ref={exerciseTextDiv} className="exercise-text">
                {renderExerciseText()}
            </div>
        </div>
    );
};

export default ExerciseDisplay;