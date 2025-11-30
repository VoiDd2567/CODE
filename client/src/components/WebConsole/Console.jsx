import "./console.css"
import { useTranslation } from "react-i18next";
import run_image from "../../pictures/run-btn.png"
import complete_image from "../../pictures/complete-btn.png"
import open_exercise_image from "../../pictures/open-exercise-btn.png"
import { useRef, useState, useEffect } from "react";
import client_config from "../../client_config.json"

const Console = ({
    setExerciseChoose = null,
    files = null,
    getExerciseList = null,
    exerciseOpened = false,
    chosenFile = null,
    saveData = null,
    editorValue = null,
    exercise = null,
    inserted = false,
    h = "auto",
    w = "auto",
    example = false }) => {

    const { t } = useTranslation();
    const webConsole = useRef(null);
    const consoleWrap = useRef(null);
    const pageWrap = useRef(null);
    const [lockedText, setLockedText] = useState("");
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [input, setInput] = useState("")
    const [inputCursorPos, setInputCursorPos] = useState(0);
    const [inputHistory, setInputHistory] = useState([""]);
    const [consoleId, setConsoleId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [runningCodeTimeout, setRunningCodeTimeout] = useState(null)

    useEffect(() => {
        webConsole.current.setSelectionRange(lockedText.length, lockedText.length);
    }, [lockedText])

    useEffect(() => {
        if (inserted) {
            pageWrap.current.style.height = `${h}vh`
            consoleWrap.current.style.height = `${h - 5.5}vh`;
            consoleWrap.current.style.width = `${w}vw`
            pageWrap.current.style.width = `${w}vw`
        }
    }, [inserted, h, exerciseOpened, w])

    const handleRunBtnClick = () => {
        const fileType = chosenFile.split(".")[1]
        startRunningCodeText();
        fetch(`${client_config.SERVER_IP}/api/code/render-code`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ files: files, mainFile: chosenFile, fileType })
        }).then(async res => {
            setRunningCodeTimeout(prevTimeout => {
                if (prevTimeout) {
                    clearTimeout(prevTimeout);
                }
                return null;
            });
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
                    textToConsole("\n\n<-Code running completed->");
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

        fetch(`${client_config.SERVER_IP}/api/code/send-input`, {
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
                    textToConsole("\n\n<-Code running completed->");
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
        setTimeout(() => {
            startRunningCodeText();
            fetch(`${client_config.SERVER_IP}/api/exercise/check-exercise`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ exerciseId: exercise._id })
            }).then(async res => {
                setRunningCodeTimeout(prevTimeout => {
                    if (prevTimeout) {
                        clearTimeout(prevTimeout);
                    }
                    return null;
                });
                if (!res.ok) {
                    const errorData = await res.text();
                    textToConsole(errorData, false);
                    throw new Error(`Error ${res.status}`);
                } else {
                    const data = await res.json();
                    textToConsole(data["correct"] >= data["minimal_percent"] ? "SUCESS\n\n" : "WRONG\n\n", false)
                    textToConsole(data["output"]);
                    const output = `\n-------------------${data["correct"] >= data["minimal_percent"] ? "Correct" : "Wrong"} solution (${data["correct"]}/100)--------------------`;
                    textToConsole(output)
                    textToConsole("\n\n---------------------Answer check completed-----------------------");
                }
            })
        }, 500)
    }

    const startRunningCodeText = () => {
        setRunningCodeTimeout(prevTimeout => {
            if (prevTimeout) {
                clearTimeout(prevTimeout);
            }
            return null;
        });

        textToConsole("Running code...\n", false);

        const timeoutId = setTimeout(() => {
            textToConsole(
                "Running takes too long, server can be down, or there may have appeared error\n"
            );
            setRunningCodeTimeout(null);
        }, 15000);

        setRunningCodeTimeout(timeoutId);
    };

    return (
        <div className="console-wrap" ref={pageWrap}>
            <div className="console__buttons-wrap">
                <button className="console__btn run-btn" onClick={handleRunBtnClick} title="Run code"><p>{t("run")}</p><img src={run_image} alt="" /></button>
                {(exerciseOpened || inserted) &&
                    <button className={`console__btn send-btn ${example ? "send-disabled" : ""}`} onClick={handleSendBtnClick} title="Send exercise answer to be automaticly checked"><p>{t("send")}</p><img src={complete_image} alt="" /></button>
                }
                {!inserted && (<button className="console__btn open-exercise-btn" onClick={handleExerciseOpenBtnClick}><p>{t("open-exercise")}</p><img src={open_exercise_image} alt="" /></button>)}
            </div>
            <div className="console" ref={consoleWrap}>
                <textarea ref={webConsole} onKeyDown={onConsoleKeyDown} onClick={onConsoleClick} className="console-content" readOnly={!waitingForInput}></textarea>
            </div>
        </div>
    )
}

export default Console