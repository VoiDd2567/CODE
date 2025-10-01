import { useEffect, useState, useRef } from "react"
import CourseEditorBtnMenu from "./BtnMenu.jsx"
import { EditorBlock, TextBlock, ExerciseBlock } from "./Blocks.jsx";

const CourseEditor = ({ borders }) => {
    const chooseMenu = useRef(null);
    const [coursorPos, setCoursorPos] = useState([])
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [editorValue, setEditorValue] = useState([
        { 1: { value: "Text aasdample", type: "text" } },
        { 2: { value: "text", type: "text" } },
        { 3: { value: "editor", type: "editor" } },
        { 4: { value: "exercise", type: "exercise" } },
        { 5: { value: "img", type: "img" } }
    ]);
    const [chosenBlock, setChosenBlock] = useState(-1)

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
        e.preventDefault()
        const block = e.target.closest('.block');
        const blockSettings = e.target.closest('.block-settings');

        if (block || blockSettings) {
            setIsMenuVisible(false);
            return;
        }

        setCoursorPos({ x: e.clientX, y: e.clientY });
        setIsMenuVisible(true);
        setChosenBlock(-1);
    }

    return (
        <div className="main-area" onClick={clickHandeler}>
            <div className="course_ediotor-blocks">
                {editorValue.map((item, index) => {
                    const [id, block] = Object.entries(item)[0];

                    let innerHtml = <div>Te</div>;


                    if (block.type === "text") {
                        innerHtml = (
                            <TextBlock id={id} value={block.value} borders={borders} setEditorValue={setEditorValue} />
                        );
                    } else if (block.type === "editor") {
                        innerHtml = (
                            <EditorBlock borders={borders} />
                        );
                    } else if (block.type === "exercise") {
                        innerHtml = (
                            <ExerciseBlock />
                        );
                    }
                    return (
                        <div
                            key={id}
                            className={`course_editor-block ${index === chosenBlock ? "active" : ""}`}
                            data-block-id={id}
                        >
                            {innerHtml}
                        </div>
                    );
                })}
            </div>
            <CourseEditorBtnMenu
                chooseMenu={chooseMenu}
                coursorPos={coursorPos}
                isMenuVisible={isMenuVisible}
                editorValue={editorValue}
                setEditorValue={setEditorValue}
            />
        </div>
    )
}

export default CourseEditor;