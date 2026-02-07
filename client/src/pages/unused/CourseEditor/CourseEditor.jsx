import { useEffect, useState, useRef } from "react"
import CourseEditorBtnMenu from "./BtnMenu.jsx"
import { EditorBlock, TextBlock, ExerciseBlock, ChooseBlock } from "./Blocks.jsx";
import ExerciseSettings from "./ExerciseSettings.jsx";
import PageHandeler from "./components/PageHandeler.jsx";
import trashcan from "../../pictures/bin.png"

const CourseEditor = ({ borders, lng }) => {
    const chooseMenu = useRef(null);
    const [coursorPos, setCoursorPos] = useState([])
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [page, setPage] = useState(0);
    const [editorValue, setEditorValue] = useState([[
        { 1: { value: "Text aasdample", type: "text" } },
        { 2: { value: "text", type: "text" } },
        { 3: { value: "editor", type: "editor" } },
        {
            4: {
                value: {
                    answerCheckType: "checkFuncReturn",
                    autoCheck: true,
                    description: { est: "ASDASDASD" },
                    files: { "My_file.py": "# I hate my life" },
                    inputCount: 0,
                    name: "asdasd",
                    type: "code",
                    withoutInputAnswer: "Answer",
                    functionName: "Placeholder",
                    functionReturns: [
                        { input: "Placeholder", output: "Placeholder" },
                        { input: "Placeholder", output: "Placeholder" }
                    ]
                },
                type: "exercise"
            }
        },
        {
            5: {
                value: {
                    description: { est: 'Choose which titan you love' },
                    name: "I hate my life",
                    options: {
                        1: { option: 'Eren Yeger', correct: true },
                        2: { option: 'I dont remember others', correct: false }
                    }
                }, type: "choose"
            }
        }
    ], [], [], [], [], [], [], [], []]);

    const [chosenBlock, setChosenBlock] = useState(-1)
    const [exerciseSetttingsVisible, setExerciseSettingsVisible] = useState(false)
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);

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
        const delBlock = e.target.closest('.block-delete');
        const blockSettings = e.target.closest('.block-settings');
        const exerciseSettings = e.target.closest(".exercise_settings-wrap")
        const pageHandeler = e.target.closest(".page_handeler")

        if (block || blockSettings || exerciseSettings || delBlock || pageHandeler) {
            setIsMenuVisible(false);
            return;
        }

        setCoursorPos({ x: e.clientX, y: e.clientY });
        setIsMenuVisible(true);
        setChosenBlock(-1);
    }

    const addEditorItem = (value, type, id = null) => {
        setEditorValue(prev => {
            const currentPageBlocks = prev[page] || [];
            const allIds = prev.flat().map(obj => +Object.keys(obj)[0]);
            const nextId = id ?? (allIds.length > 0 ? Math.max(...allIds) + 1 : 1);

            const existingIndex = currentPageBlocks.findIndex(obj => Object.keys(obj)[0] == nextId);

            const updatedPage = [...currentPageBlocks];
            if (existingIndex !== -1) {
                updatedPage[existingIndex] = { [nextId]: { value, type } };
            } else {
                updatedPage.push({ [nextId]: { value, type } });
            }

            const newPages = [...prev];
            newPages[page] = updatedPage;
            return newPages;
        });
    };

    const getNextIndex = () => {
        if (!Array.isArray(editorValue) || editorValue.length === 0) return 1;
        const allIds = editorValue.flat().map(obj => Number(Object.keys(obj)[0]));
        return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    }

    const getExerciseData = (id) => {
        id = parseInt(id);
        for (const pageBlocks of editorValue) {
            const item = pageBlocks.find(obj => obj[id]);
            if (item) {
                return item[id].value;
            }
        }
        return null;
    }

    const deleteBlock = (id, pageIndex) => {
        setEditorValue(prev => {
            const newPages = [...prev];
            newPages[pageIndex] = newPages[pageIndex].filter(item => Object.keys(item)[0] !== String(id));
            return newPages;
        });
    }


    const addExercise = (id, type, value) => {
        addEditorItem(value, type, id)
    }

    const closeExerciseSettings = () => {
        setExerciseSettingsVisible(false);
        setCurrentExerciseId(-1);
    }

    const getPagesCount = () => {
        return editorValue.length
    }

    return (
        <div className="main-area" onClick={clickHandeler}>
            {exerciseSetttingsVisible && (() => {
                let exData = null;
                if (currentExerciseId !== -1) {
                    exData = getExerciseData(currentExerciseId)
                }
                return (
                    <ExerciseSettings
                        setOpenSettings={closeExerciseSettings}
                        setBlock={addExercise}
                        exerciseId={currentExerciseId !== -1 ? currentExerciseId : getNextIndex()}
                        exerciseSettings={exData}
                    />
                );
            })()}
            <div className="course_editor-blocks">
                {editorValue.map((p, pageIndex) => (
                    pageIndex === page && (
                        <div key={pageIndex} className="page-container">
                            {p.map((item, blockIndex) => {
                                const [id, block] = Object.entries(item)[0];

                                let innerHtml = <div></div>;
                                if (block.type === "text") {
                                    innerHtml = (
                                        <TextBlock
                                            id={id}
                                            value={block.value}
                                            borders={borders}
                                            setEditorValue={setEditorValue}
                                        />
                                    );
                                } else if (block.type === "editor") {
                                    innerHtml = (
                                        <EditorBlock borders={borders} startValue={block.value} />
                                    );
                                } else if (block.type === "exercise") {
                                    const data = getExerciseData(id);
                                    innerHtml = (
                                        <ExerciseBlock
                                            borders={borders}
                                            setOpenSettings={() => {
                                                setCurrentExerciseId(id);
                                                setExerciseSettingsVisible(true);
                                            }}
                                            data={data}
                                            lng={lng}
                                        />
                                    );
                                } else if (block.type === "choose") {
                                    const data = getExerciseData(id);
                                    innerHtml = (
                                        <ChooseBlock
                                            borders={borders}
                                            setOpenSettings={() => {
                                                setCurrentExerciseId(id);
                                                setExerciseSettingsVisible(true);
                                            }}
                                            data={data}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={id}
                                        className={`course_editor-block ${blockIndex === chosenBlock && pageIndex === page ? "active" : ""}`}
                                        data-block-id={id}
                                        data-page-index={pageIndex}
                                    >
                                        <div className="block-delete">
                                            <img
                                                src={trashcan}
                                                alt="Delete"
                                                onClick={() => deleteBlock(id, pageIndex)}
                                            />
                                        </div>
                                        {innerHtml}
                                    </div>
                                );
                            })}
                        </div>
                    )
                ))}
            </div>
            <PageHandeler setPage={setPage} pageAmount={getPagesCount()} nowPage={page} />
            <CourseEditorBtnMenu
                chooseMenu={chooseMenu}
                coursorPos={coursorPos}
                isMenuVisible={isMenuVisible}
                addEditorItem={addEditorItem}
                openExerciseSettings={() => setExerciseSettingsVisible(true)}
            />
        </div>
    )
}

export default CourseEditor;