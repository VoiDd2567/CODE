import { useEffect, useState, useRef } from "react"
import CourseEditorMenu from "./CourseEditorMenu.jsx"
import { TextBlock } from "./Blocks.jsx";

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
        const handleMouseLeave = () => {
            setIsMenuVisible(false);
        };

        if (chooseMenu.current) {
            chooseMenu.current.addEventListener("mouseleave", handleMouseLeave);

            return () => {
                if (chooseMenu.current) {
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    chooseMenu.current.removeEventListener("mouseleave", handleMouseLeave);
                }
            };
        }
    }, [isMenuVisible]);

    const clickHandeler = (e) => {
        const block = e.target.closest('.course_editor-block');
        if (block && !block.classList.contains('active')) return;

        setCoursorPos({ x: e.clientX, y: e.clientY })
        setChosenBlock(null);
        setIsMenuVisible(true);
    }

    const addTextBlock = () => { }
    const addCodeBlock = () => { }
    const addExerciseBlock = () => { }
    const addImageBlock = () => { }

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
                        innerHtml = (
                            <TextBlock value={block.value} id={id} initializedBlocks={initializedBlocks} updateBlockValue={updateBlockValue} opened={index === chosenBlock} />
                        );
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