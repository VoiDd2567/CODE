import { useEffect, useState, useRef } from "react"
import CourseEditorMenu from "./CourseEditorMenu.jsx"

const CourseEditor = () => {
    const chooseMenu = useRef(null);
    const [coursorPos, setCoursorPos] = useState([])
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [editorValue, setEditorValue] = useState({
        "text": "Lol i dnt know",
        "text": "Lol i dnt know",
        "editor": "AAAAAAAAAA",
        "exercise": "LOL",
        "img": "?????"
    })
    const [chosenBlock, setChosenBlock] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (chooseMenu.current) {
                const menuElements = chooseMenu.current.querySelectorAll('*');
                const allRects = [chooseMenu.current.getBoundingClientRect()];

                menuElements.forEach(element => {
                    allRects.push(element.getBoundingClientRect());
                });

                const inside = allRects.some(rect =>
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                );

                if (!inside) setIsMenuVisible(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [chooseMenu, setIsMenuVisible]);


    const clickHandeler = (e) => {
        const block = e.target.closest('.course_editor-block');
        if (block && !block.classList.contains('active')) {
            return;
        }
        setCoursorPos({ x: e.clientX, y: e.clientY })
        setIsMenuVisible(true);
    }

    const addTextBlock = () => { }
    const addCodeBlock = () => { }
    const addExerciseBlock = () => { }
    const addImageBlock = () => { }

    const normalizeTextBlock = (value) => {
        return (<p className="course_editor-block-text" contentEditable="true">{value}</p>)
    }

    const blockClickHandeler = (index) => {
        setChosenBlock(index)
    }

    return (
        <div className="main-area" onClick={clickHandeler}>
            <div className="course_ediotr-blocks">
                {
                    Object.entries(editorValue).map(([blockType, blockValue], index) => {
                        let innerHtml = <div>Te</div>;
                        if (blockType === "text") {
                            console.log(normalizeTextBlock(blockValue))
                            innerHtml = normalizeTextBlock(blockValue)
                        }
                        return <div
                            key={index}
                            className={`course_editor-block ${index === chosenBlock ? "active" : ""}`}
                            onClick={() => blockClickHandeler(index)}>{innerHtml}
                        </div>
                    })
                }
            </div>
            <CourseEditorMenu chooseMenu={chooseMenu}
                coursorPos={coursorPos}
                isMenuVisible={isMenuVisible}
                addTextBlock={addTextBlock}
                addCodeBlock={addCodeBlock}
                addExerciseBlock={addExerciseBlock}
                addImageBlock={addImageBlock} />
        </div>
    )
}

export default CourseEditor;