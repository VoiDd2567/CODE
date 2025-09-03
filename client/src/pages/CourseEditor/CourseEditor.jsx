import { useEffect, useState, useRef } from "react"
import CourseEditorMenu from "./CourseEditorMenu.jsx"

const CourseEditor = () => {
    const chooseMenu = useRef(null);
    const isFirstRender = useRef(true);
    const initializedBlocks = useRef(new Set());
    const [coursorPos, setCoursorPos] = useState([])
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [editorValue, setEditorValue] = useState([
        { 1: { value: "Lol i dnt know", type: "text" } },
        { 2: { value: "text", type: "text" } },
        { 3: { value: "editor", type: "editor" } },
        { 4: { value: "exercise", type: "exercise" } },
        { 5: { value: "img", type: "img" } }
    ]);
    const [chosenBlock, setChosenBlock] = useState(0)

    useEffect(() => {
        isFirstRender.current = false;
    });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (chooseMenu.current) {
                const menuRect = chooseMenu.current.getBoundingClientRect();
                const inside = e.clientX >= menuRect.left &&
                    e.clientX <= menuRect.right &&
                    e.clientY >= menuRect.top &&
                    e.clientY <= menuRect.bottom;

                if (!inside) setIsMenuVisible(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const clickHandeler = (e) => {
        const block = e.target.closest('.course_editor-block');
        if (block && !block.classList.contains('active')) return;

        setCoursorPos({ x: e.clientX, y: e.clientY })
        setIsMenuVisible(true);
    }

    const addTextBlock = () => { }
    const addCodeBlock = () => { }
    const addExerciseBlock = () => { }
    const addImageBlock = () => { }

    const normalizeTextBlock = (value, id) => {
        return (
            <p
                ref={(el) => {
                    if (el && (!initializedBlocks.current.has(id) || el.textContent === '')) {
                        el.textContent = value;
                        initializedBlocks.current.add(id);
                    }
                }}
                className="course_editor-block-text"
                contentEditable="true"
                suppressContentEditableWarning={true}
                onInput={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.target.textContent);
                }}
                onBlur={(e) => {
                    e.stopPropagation();
                    updateBlockValue(id, e.target.textContent);
                }}
            />
        )
    }

    const updateBlockValue = (blockId, blockValue) => {
        setEditorValue(prev => {
            return prev.map(item => {
                const [id, block] = Object.entries(item)[0];
                if (id === blockId) {
                    return { [id]: { ...block, value: blockValue } }
                }
                return item;
            })
        })
    }

    return (
        <div className="main-area" onClick={clickHandeler}>
            <div className="course_ediotr-blocks">
                {editorValue.map((item, index) => {
                    const [id, block] = Object.entries(item)[0];

                    let innerHtml = <div>Te</div>;

                    if (block.type === "text") {
                        innerHtml = normalizeTextBlock(block.value, id);
                    }

                    return (
                        <div
                            key={id}
                            className={`course_editor-block ${index === chosenBlock ? "active" : ""}`}
                            onClick={() => setChosenBlock(index)}
                        >
                            {innerHtml}
                        </div>
                    );
                })}
            </div>
            <CourseEditorMenu
                chooseMenu={chooseMenu}
                coursorPos={coursorPos}
                isMenuVisible={isMenuVisible}
                addTextBlock={addTextBlock}
                addCodeBlock={addCodeBlock}
                addExerciseBlock={addExerciseBlock}
                addImageBlock={addImageBlock}
            />
        </div>
    )
}

export default CourseEditor;