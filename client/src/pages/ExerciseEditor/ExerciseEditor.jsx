import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

import DescriprionBlock from "./componenets/descriptionBlock";
import FileMenu from "./componenets/fileMenu";
import TestCase from "./componenets/testCase"

import cross from "../../pictures/cross-b.png"
import client_config from "../../client_config.json"

const deafultData = {
    "name": "",
    "programmingLng": "py",
    "minimalPercent": "100",
    "autoCheck": true,
    "files": { 1: { name: "main.py", value: "#Write your code here\n\n" } },
    "description": { "eng": "", "est": "" },
    "exerciseType": "outputCheck",
    "completeSolution": ""
}

const ExerciseEditor = ({ exerciseId, setOpenExerciseEditor, setIsSaved }) => {
    const { t } = useTranslation();

    const [data, setData] = useState({ ...deafultData })
    const [testCases, setTestCases] = useState([])
    const [notifications, setNotifications] = useState([])
    const textareaRef = useRef(null);

    useEffect(() => {
        if (exerciseId) {
            getExercise(exerciseId);
        } else {
            setOpenExerciseEditor(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseId])

    useEffect(() => {
        adjustTextareaHeight();
    }, [data.completeSol]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const addNotification = (message, type = "green") => {
        setNotifications(prev => [
            ...prev,
            { message, type }
        ])
    }

    const getExercise = (exerciseId) => {
        setData({ ...deafultData });

        fetch(`${client_config.SERVER_IP}/api/exercise/get-exercise-data`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ exerciseId: exerciseId })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                addNotification(errorMessage, "red")
            } else {
                const dataG = (await res.json()).data;

                const filesArray = [];
                Object.keys(dataG.files).forEach(name => {
                    filesArray.push({
                        name: name,
                        value: dataG.files[name]
                    });
                });
                dataG.files = filesArray;

                const originalDescription = {};
                Object.keys(dataG.description).forEach(lang => {
                    let desc = dataG.description[lang];
                    desc = desc.replace(/\\n/g, '\n');
                    desc = desc.replace(/<<editor>>([\s\S]*?)<<\/editor>>/g, '[CODE_BLOCK]$1[/CODE_BLOCK]');
                    originalDescription[lang] = desc;
                });
                dataG.description = originalDescription;

                parseTestCasesText(dataG.checksFile)
                console.log(dataG)
                setData(dataG)
            }
        }).catch(error => {
            addNotification(error.message, "red")
        });
    }

    const handleExerciseSave = () => {
        if (!Object.keys(data).includes("name") || data?.name === "") {
            addNotification(`${t("name")} ${t("required")}`, "red")
            return;
        }
        if (!Object.keys(data).includes("description") || data?.description === "") {
            addNotification(`${t("description")} ${t("required")}`, "red")
            return;
        }

        const checksFileText = buildTestCasesText();
        console.log(checksFileText);

        // Create updated data object with checksFile included
        const updatedData = {
            ...data,
            checksFile: checksFileText
        };

        fetch(`${client_config.SERVER_IP}/api/exercise/update-exercise`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ exerciseId: exerciseId, data: updatedData })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                addNotification(errorMessage, "red")
            } else {
                addNotification(t("exercise_saved"), "green")
                setIsSaved(true)
            }
        }).catch(error => {
            addNotification(error.message, "red")
        });
    }

    const removeNotif = (id) => {
        setNotifications(prev => prev.filter((_, i) => i !== id))
    }

    const addData = (key, value) => {
        setData(prev => ({
            ...prev,
            [key]: value
        }))
        setIsSaved(false)
    }

    const handleAddTestCase = () => {
        const l = testCases.length
        let newCase;
        if (l === 0) {
            newCase = { id: 0, inputs: [], file: { filename: "a.txt", value: "" }, params: "" }
        } else {
            let inp = testCases[l - 1].inputs ? Array(testCases[l - 1].inputs.length).fill("") : null
            let f = testCases[l - 1].file ? { filename: testCases[l - 1].file.filename, value: "" } : null
            newCase = { id: testCases[l - 1].id + 1, inputs: inp, file: f, params: "" }
        }
        setTestCases(prev => [...prev, newCase]
        );
    }

    const updateTestCases = (testCase) => {
        setTestCases(prev =>
            prev.map(tc =>
                tc.id === testCase.id
                    ? { ...testCase }
                    : tc
            )
        );
    };

    const delTestCase = (id) => {
        setTestCases(prev =>
            prev.filter(tc => tc.id !== id)
        );
    };

    const buildTestCasesText = () => {
        return testCases.map(testCase => {
            let caseText = '';

            if (testCase.inputs && testCase.inputs.length > 0) {
                const inputsStr = testCase.inputs.join(';;');
                caseText += `<-input->${inputsStr}</-input->\n`;
            }

            if (testCase.params && testCase.params.trim() !== '') {
                caseText += `<-param->${testCase.params}</-param->\n`;
            }

            if (testCase.file && testCase.file.filename && testCase.file.value !== undefined) {
                caseText += `<-file->"${testCase.file.filename}" : "${testCase.file.value}"</-file->\n`;
            }

            return caseText.trim();
        }).join('\n --------------- \n');
    };

    const parseTestCasesText = (text) => {
        if (!text || text.trim() === '') {
            return [];
        }

        const casesText = text.split(' --------------- ');

        setTestCases(casesText.map((caseText, index) => {
            const testCase = { id: index, inputs: null, params: "", file: null };

            const inputMatch = caseText.match(/<-input->(.*?)<\/-input->/s);
            if (inputMatch) {
                const inputsStr = inputMatch[1];
                testCase.inputs = inputsStr.split(';;');
            }

            const paramMatch = caseText.match(/<-param->(.*?)<\/-param->/s);
            if (paramMatch) {
                testCase.params = paramMatch[1];
            }

            const fileMatch = caseText.match(/<-file->\\?"(.*?)\\?" : \\?"(.*?)\\?"<\/-file->/s);
            if (fileMatch) {
                testCase.file = {
                    filename: fileMatch[1],
                    value: fileMatch[2]
                };
            }

            return testCase;
        }));
    };

    return (<div className="exercise_editor-form-wrap">
        <div className="exercise_editor_page-form">
            <div className="exercise_editor_page-form-items_line">
                <div className="exercise_editor_page-form-item">
                    <div className="exercise_editor_page-form-item-label">{t("name")}</div>
                    <textarea className="exercise_editor_page-form-item-textarea" value={data.name} onInput={(e) => addData("name", e.target.value)} autoFocus></textarea>
                </div>
            </div>
            <DescriprionBlock setDesc={(d) => addData("description", d)} startValue={data.description} />
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("autocheck")}</div>
                <input type="checkbox" className="exercise_editor_page-form-item-checkbox" onChange={() => { addData("autoCheck", !data.autoCheck) }} checked={data.autoCheck} />
            </div>
            {data.autoCheck && (
                <>
                    <div className="exercise_editor_page-completeSol-wrap">
                        <div className="exercise_editor_page-completeSol">
                            <div className="exercise_editor_page-completeSol-header">{t("complete_sol")}</div>
                            <textarea
                                ref={textareaRef}
                                className="exercise_editor_page-completeSol-textarea"
                                value={data.completeSolution || ''}
                                onInput={(e) => {
                                    addData("completeSolution", e.target.value);
                                    adjustTextareaHeight();
                                }}
                            />
                        </div>
                    </div>
                    <div className="exercise_editor_page-line">
                        <div className="exercise_editor_page-execise_type">
                            <div className="exercise_editor_page-execise_type-header">{t("exercise_type")}</div>
                            <div className="exercise_editor_page-execise_type-choises">
                                <div onClick={() => addData("exerciseType", "outputCheck")} className={`exercise_editor_page-execise_type-choise ${data.exerciseType == "outputCheck" ? "active" : ""}`}>📤 {t("outputCheck")}</div>
                                <div onClick={() => addData("exerciseType", "funcCheck")} className={`exercise_editor_page-execise_type-choise ${data.exerciseType == "outputCheck" ? "" : "active"}`}>⚙️ {t("funcCheck")}</div>
                            </div>
                        </div>
                        {data.exerciseType === "funcCheck" &&
                            (<div className="exercise_editor_page-funcName-wrap">
                                <div className="exercise_editor_page-funcName">
                                    <div className="exercise_editor_page-funcName-header">{t("function_name")}</div>
                                    <input type="text" className="exercise_editor_page-funcName-input" value={data.funcName} onChange={(e) => addData("funcName", e.target.value)} />
                                </div>
                            </div>)}
                    </div>
                    <div className="exercise_editor_page-exercise_cases-wrap">
                        <button className="exercise_editor_page-add_case_btn" onClick={handleAddTestCase}>{t("add_case")}</button>
                        <div className="exercise_editor_page-exercise_cases">
                            {testCases.map(testCase => (<TestCase key={testCase.id} testCase={testCase} addCase={updateTestCases} exType={data.exerciseType} delTestCase={delTestCase} />))}
                        </div>
                    </div>
                </>
            )}
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("Files")}</div>
            </div>
            <FileMenu addFiles={(f) => addData("files", f)} startFiles={data.files} />
            <div className="exercise_editor_page-save_btn-wrap">
                <div className="exercise_editor_page-save_btn" onClick={handleExerciseSave}>{t("save")}</div>
            </div>
            <div className="exercise_editor_page_bottom"></div>
        </div>
        <div className="exercise_editor_page-notifications">
            {notifications.map((notif, id) => {
                return (<div key={id} className={`exercise_editor_page-notification notification-${notif.type}`} >
                    <div className="notification-text">{notif.message}</div>
                    <div className="notification-delete"><img src={cross} alt="Close" onClick={() => removeNotif(id)} /></div>
                </div>)
            })}
        </div>
    </div>)

}

export default ExerciseEditor