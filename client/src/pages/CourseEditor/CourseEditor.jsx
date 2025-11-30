import { useEffect, useState, useRef } from "react"
import CourseEditorBtnMenu from "./BtnMenu.jsx"
import { EditorBlock, TextBlock, ExerciseBlock, ChooseBlock } from "./Blocks.jsx";
import ExerciseSettings from "./ExerciseSettings.jsx";
import trashcan from "../../pictures/bin.png"

const CourseEditor = ({ borders, lng }) => {
    const chooseMenu = useRef(null);
    const [coursorPos, setCoursorPos] = useState([])
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [editorValue, setEditorValue] = useState([
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
    ]);

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

        if (block || blockSettings || exerciseSettings || delBlock) {
            setIsMenuVisible(false);
            return;
        }

        setCoursorPos({ x: e.clientX, y: e.clientY });
        setIsMenuVisible(true);
        setChosenBlock(-1);
    }

    const addEditorItem = (value, type, id = null) => {
        setEditorValue(prev => {
            const nextId = id ?? (prev.length > 0 ? Math.max(...prev.map(obj => +Object.keys(obj)[0])) + 1 : 1);

            const existingIndex = prev.findIndex(obj => Object.keys(obj)[0] == nextId);

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = { [nextId]: { value, type } };
                return updated;
            } else {
                return [...prev, { [nextId]: { value, type } }];
            }
        });
    };


    const addExercise = (id, type, value) => {
        addEditorItem(value, type, id)
    }

    const getNextIndex = () => {
        if (!Array.isArray(editorValue) || editorValue.length === 0) return 1;
        const ids = editorValue.map(obj => Number(Object.keys(obj)[0]));
        return Math.max(...ids) + 1;
    }

    const closeExerciseSettings = () => {
        setExerciseSettingsVisible(false);
        setCurrentExerciseId(-1);
    }

    const getExerciseData = (id) => {
        id = parseInt(id)
        const item = editorValue.find(obj => obj[id]);
        return item[id].value;
    }

    const deleteBlock = (id) => {
        setEditorValue(prev => prev.filter(item => Object.keys(item)[0] !== String(id)));
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
            <div className="course_ediotor-blocks">
                {editorValue.map((item, index) => {
                    const [id, block] = Object.entries(item)[0];

                    let innerHtml = <div></div>;
                    if (block.type === "text") {
                        innerHtml = (
                            <TextBlock id={id} value={block.value} borders={borders} setEditorValue={setEditorValue} />
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
                        innerHtml = (<ChooseBlock borders={borders}
                            setOpenSettings={() => {
                                setCurrentExerciseId(id);
                                setExerciseSettingsVisible(true);
                            }}
                            data={data} />)
                    }

                    return (
                        <div
                            key={id}
                            className={`course_editor-block ${index === chosenBlock ? "active" : ""}`}
                            data-block-id={id}
                        >
                            <div className="block-delete"><img src={trashcan} alt="Delete" onClick={() => deleteBlock(id)} /></div>
                            {innerHtml}
                        </div>
                    );
                })}
            </div>
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