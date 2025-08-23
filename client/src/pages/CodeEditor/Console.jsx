import "./console.css"
import { useTranslation } from "react-i18next";
import run_image from "../../pictures/run-btn.png"
import complete_image from "../../pictures/complete-btn.png"
import open_exercise_image from "../../pictures/open-exercise-btn.png"
import { useRef, useState, useEffect } from "react";

const Console = ({ setExerciseChoose, files, getExerciseList, exerciseOpened, chosenFile, saveData, editorValue, exercise }) => {
    const { t } = useTranslation();
    const webConsole = useRef(null);
    const [lockedText, setLockedText] = useState("");
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [input, setInput] = useState("")
    const [inputCursorPos, setInputCursorPos] = useState(0);
    const [inputHistory, setInputHistory] = useState([""]);
    const [consoleId, setConsoleId] = useState(null);

    useEffect(() => {
        webConsole.current.setSelectionRange(lockedText.length, lockedText.length);
    }, [lockedText])

    const handleRunBtnClick = () => {
        const fileType = chosenFile.split(".")[1]
        textToConsole("Running code...", false);
        fetch("https://localhost:3001/api/code/render-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ files: files, mainFile: chosenFile, fileType })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                if (errorData.includes("Can't run this file")) {
                    textToConsole("Can't run this file", false);
                } else {
                    textToConsole(errorData, false);
                    throw new Error(`Error ${res.status}`);
                }
            } else {
                const data = await res.json();
                if (data["output"]["status"] === "complete") {
                    textToConsole(data["output"]["output"], false);
                    textToConsole("\n\n---------------------Code running completed-----------------------");
                }
                if (data["output"]["status"] === "waiting_for_input") {
                    handleInput()
                    textToConsole(data["output"]["output"], false);
                    setConsoleId(data["code_id"])
                }
                setLockedText(data["output"]["output"])
            }
        })
    }

    const handleInput = () => {
        setWaitingForInput(true)
    }

    const sendInput = () => {
        const newLockedText = lockedText + input;
        setInput("");
        setLockedText(newLockedText);
        setWaitingForInput(false);
        setInputHistory([""])

        fetch("https://localhost:3001/api/code/send-input", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: consoleId, input: input })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData);
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                textToConsole("\n")
                if (data["output"]["status"] === "complete") {
                    textToConsole(data["output"]["output"]);
                    textToConsole("\n\n---------------------Code running completed-----------------------");
                }
                if (data["output"]["status"] === "waiting_for_input") {
                    handleInput();
                    textToConsole(data["output"]["output"]);
                    setConsoleId(data["code_id"]);
                }
                setLockedText(prev => prev + "\n" + data["output"]["output"]);
            }
        });
    };

    const onConsoleKeyDown = (e) => {
        const textarea = webConsole.current;
        if (e.key === "Backspace" && textarea.selectionStart <= lockedText.length) {
            e.preventDefault();
        }
        if (waitingForInput) {
            if (e.ctrlKey) {
                if (e.ctrlKey && e.key.toLowerCase() === "z") {
                    e.preventDefault();
                    if (inputHistory.length > 1) {
                        setInput(inputHistory[inputHistory.length - 2]);
                        setInputHistory(prev => prev.slice(0, -1));
                        webConsole.current.value = lockedText + inputHistory[inputHistory.length - 2];
                    }
                    return;
                }
                if (e.ctrlKey && e.key.toLowerCase() === 'v') {
                    navigator.clipboard.readText().then(clipText => {
                        const newInput = input.slice(0, inputCursorPos) + clipText + input.slice(inputCursorPos);
                        setInput(newInput);
                        setInputHistory(prev => [...prev, newInput]);
                        setInputCursorPos(inputCursorPos + clipText.length);
                    });
                    return;
                }
            }
            if (e.key === "Backspace" && input.length > 0 && inputCursorPos != 0) {
                setInput(input.slice(0, inputCursorPos - 1) + input.slice(inputCursorPos))
                setInputCursorPos(inputCursorPos - 1);
            } else if (e.key === "Delete" && inputCursorPos + 1 < input.length) {
                setInput(input.slice(0, inputCursorPos) + input.slice(inputCursorPos + 1))
            } else if (e.key === "ArrowLeft" && inputCursorPos > 0) {
                setInputCursorPos(inputCursorPos - 1);
            } else if (e.key === "ArrowRight" && inputCursorPos < input.length) {
                setInputCursorPos(inputCursorPos + 1);
            } else if (e.key === "Enter") {
                sendInput();
            }
            else {
                if (/^[a-zA-Z0-9]$/.test(e.key)) {
                    const newInput = input.slice(0, inputCursorPos) + e.key + input.slice(inputCursorPos);
                    setInput(newInput);
                    setInputHistory(prev => [...prev, newInput]);
                    setInputCursorPos(inputCursorPos + 1);
                }
            }
        }
    };

    const onConsoleClick = () => {
        const textarea = webConsole.current;
        if (textarea.selectionStart < lockedText.length) {
            textarea.setSelectionRange(lockedText.length, lockedText.length);
        }
    };

    const textToConsole = (text, add = true) => {
        if (add) {
            webConsole.current.value += text;
        } else {
            webConsole.current.value = text;
        }
    }

    const handleExerciseOpenBtnClick = () => {
        getExerciseList();
        setExerciseChoose(true);
    }

    const handleSendBtnClick = () => {
        saveData(editorValue);
        textToConsole("Running code...", false);
        fetch("https://localhost:3001/api/exercise/check-exercise", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId: exercise._id })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                textToConsole(errorData, false);
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                textToConsole(data["output"], false);
                textToConsole(data["correct"] ? "\n------------------------Correct solution-------------------------" : "\n-------------------------Wrong solution--------------------------");
                textToConsole("\n\n---------------------Answer check completed-----------------------");
            }
        })
    }

    return (
        <div className="console-wrap">
            <div className="console__buttons-wrap">
                <button className="console__btn run-btn" onClick={handleRunBtnClick} title="Run code"><p>{t("run")}</p><img src={run_image} alt="" /></button>
                {exerciseOpened &&
                    <button className="console__btn send-btn" onClick={handleSendBtnClick} title="Send exercise answer to be automaticly checked"><p>{t("send")}</p><img src={complete_image} alt="" /></button>
                }
                <button className="console__btn open-exercise-btn" onClick={handleExerciseOpenBtnClick}><p>{t("open-exercise")}</p><img src={open_exercise_image} alt="" /></button>
            </div>
            <div className="console">
                <textarea ref={webConsole} onKeyDown={onConsoleKeyDown} onClick={onConsoleClick} className="console-content" readOnly={!waitingForInput}></textarea>
            </div>
        </div>
    )
}

export default Console