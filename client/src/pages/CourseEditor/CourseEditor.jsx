import { useEffect, useState, useRef } from "react"
import CourseEditorBtnMenu from "./CourseEditorBtnMenu.jsx"
import { TextBlock } from "./Blocks.jsx";
import { TextCompile } from "./BlockDecompiler"

const CourseEditor = () => {
    const chooseMenu = useRef(null);
    const isFirstRender = useRef(true);
    const initializedBlocks = useRef(new Set());
    const [coursorPos, setCoursorPos] = useState([])
    const [currentSelection, setCurrentSelection] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [editorValue, setEditorValue] = useState([
        { 1: { value: "<text color:white>Here<text color:red font-size:4vh>i</text>s some text</text>", type: "text" } },
        { 2: { value: "text", type: "text" } },
        { 3: { value: "editor", type: "editor" } },
        { 4: { value: "exercise", type: "exercise" } },
        { 5: { value: "img", type: "img" } }
    ]);
    const [chosenBlock, setChosenBlock] = useState(-1)
    const [menuType, setMenuType] = useState("standart")

    useEffect(() => { console.log(editorValue) }, [editorValue])

    const handleTextSelection = (selectionInfo) => {
        setCurrentSelection(selectionInfo);
        if (selectionInfo.selectedText.trim().length > 0 && selectionInfo.selectionRect) {
            setCoursorPos({
                x: selectionInfo.selectionRect.x,
                y: selectionInfo.selectionRect.y
            });
            setMenuType("text");
            setIsMenuVisible(true);
        }
    };

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
        e.preventDefault()
        const block = e.target.closest('.course_editor-block-text');
        const blockSettings = e.target.closest('.block-settings');

        if (block || blockSettings) {
            setIsMenuVisible(false);
            setCurrentSelection(null);
            return;
        }

        setMenuType("standart");
        setCoursorPos({ x: e.clientX, y: e.clientY });
        setIsMenuVisible(true);
        setChosenBlock(-1);
        setCurrentSelection(null);
    }

    const updateBlockValue = (blockId, blockValue) => {
        setEditorValue(prev => {
            return prev.map(item => {
                const [id, block] = Object.entries(item)[0];
                if (id === blockId) {
                    blockValue = blockValue.toString();
                    blockValue = TextCompile(blockValue)
                    return { [id]: { ...block, value: blockValue } }
                }
                return item;
            })
        })
    }


    return (
        <div className="main-area" onClick={clickHandeler}>
            <div className="course_ediotor-blocks">
                {editorValue.map((item, index) => {
                    const [id, block] = Object.entries(item)[0];

                    let innerHtml = <div>Te</div>;

                    if (block.type === "text") {
                        innerHtml = (
                            <TextBlock value={block.value}
                                id={id}
                                initializedBlocks={initializedBlocks}
                                updateBlockValue={updateBlockValue}
                                opened={index === chosenBlock}
                                setChosenBlock={setChosenBlock}
                                index={index}
                                onTextSelection={handleTextSelection} />
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
                menuType={menuType}
                currentSelection={currentSelection}
            />
        </div>
    )
}

export default CourseEditor;