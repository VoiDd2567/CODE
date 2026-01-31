import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import DescriprionBlock from "./componenets/descriptionBlock";
import AutocheckValues from "./componenets/autocheckValues";
import FileMenu from "./componenets/fileMenu";
import cross from "../../pictures/cross-b.png"
import client_config from "../../client_config.json"

const deafultData = {
    "programmingLng": "py",
    "inputCount": "1",
    "answerCheckType": "checkCodeOutput",
    "minimalPercent": "100",
    "type": "code",
    "autoCheck": true,
    "files": { 1: { name: "main.py", value: "#Write your code here\n\n" } },
    "name": "",
    "description": { "eng": "", "est": "" },
    "inputAnswers": [{ input: [], output: "" }],
    "withoutInputAnswer": "",
    "functionName": "",
    "functionReturns": ""
}

const ExerciseEditor = ({ exerciseId, setOpenExerciseEditor }) => {
    const { t } = useTranslation();
    const [autocheckType, setAutocheckType] = useState(t("output_check_input"))
    const [autocheckCheckAmount, setAutocheckCheckAmount] = useState(1)
    const [files, setFiles] = useState(true)
    const [notifications, setNotifications] = useState([])
    const [data, setData] = useState({ ...deafultData })

    useEffect(() => {
        if (exerciseId) {
            getExercise(exerciseId);
        } else {
            setOpenExerciseEditor(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseId])

    const addNotification = (message, type = "green") => {
        setNotifications(prev => [
            ...prev,
            { message, type }
        ])
    }

    const getExercise = (exerciseId) => {
        setData({ ...deafultData });
        setAutocheckType(t("output_check_input"))
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
                if (dataG.answerCheckType === "no-answer-check") {
                    delete dataG.answerCheckType;
                } else {
                    setAutocheckType(autoCheckTypeName(dataG))
                }

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


        fetch(`${client_config.SERVER_IP}/api/exercise/update-exercise`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ exerciseId: exerciseId, data: data })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                addNotification(errorMessage, "red")
            } else {
                addNotification(t("exercise_saved"), "green")
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
    }

    const handleAutocheckType = (e) => {
        const v = e.target.value
        setAutocheckType(v);

        const typeMap = {
            [t("func_check")]: "checkFuncReturn",
            [t("output_check")]: "checkCodeOutput",
            [t("output_check_input")]: "checkCodeOutput"
        }

        addData("answerCheckType", typeMap[v])

        if (v === t("output_check_input")) {
            addData("inputCount", 1)
            setAutocheckCheckAmount(1)
        } else {
            addData("inputCount", 0)
        }
    }

    const autoCheckTypeName = (d) => {
        if (d.answerCheckType === "checkCodeOutput" && d.inputCount > 0) {
            return t("output_check_input")
        }
        if (d.answerCheckType === "checkCodeOutput") {
            return t("output_check")
        }
        return t("func_check")
    }

    return (<div className="exercise_editor-form-wrap">
        <div className="exercise_editor_page-form">
            <div className="exercise_editor_page-form-items_line">
                <div className="exercise_editor_page-form-item">
                    <div className="exercise_editor_page-form-item-label">{t("name")}</div>
                    <textarea className="exercise_editor_page-form-item-textarea" defaultValue={data.name} onInput={(e) => addData("name", e.target.value)} autoFocus></textarea>
                </div>
                <div className="exercise_editor_page-form-item">
                    <div className="exercise_editor_page-form-item-label">{t("code_lng")}</div>
                    <select value={data.programmingLng} className="exercise_editor_page-form-item-select" onChange={(e) => addData("programmingLng", e.target.value)}>
                        <option value={"py"}>Python</option>
                        <option value={"js"}>JavaScript</option>
                    </select>
                </div>
            </div>
            <DescriprionBlock setDesc={(d) => addData("description", d)} startValue={data.description} />
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("autocheck")}</div>
                <input type="checkbox" className="exercise_editor_page-form-item-checkbox" onChange={() => { addData("autoCheck", !data.autoCheck) }} checked={data.autoCheck} />
            </div>
            {data.autoCheck && (
                <>
                    <div className="exercise_editor_page-form-items_line">
                        <div className="exercise_editor_page-form-item">
                            <div className="exercise_editor_page-form-item-label">{t("autocheck_type")}</div>
                            <select className="exercise_editor_page-form-item-select" defaultValue={data.answerCheckType} onChange={(e) => handleAutocheckType(e)}>
                                <option value={t("output_check_input")}>{t("output_check_input")}</option>
                                <option value={t("func_check")}>{t("func_check")}</option>
                                <option value={t("output_check")}>{t("output_check")}</option>
                            </select>
                        </div>
                        {autocheckType === t("func_check") && (
                            <div className="exercise_editor_page-form-item">
                                <div className="exercise_editor_page-form-item-label">{t("function_name")}</div>
                                <textarea className="exercise_editor_page-form-item-textarea small-textarea" onInput={(e) => addData("functionName", e.target.value)}></textarea>
                            </div>)}
                        {(autocheckType === t("func_check") || autocheckType === t("output_check_input")) && (
                            <div className="exercise_editor_page-form-item">
                                <div className="exercise_editor_page-form-item-label">{autocheckType === t("func_check") ? t("param_amount") : t("input_amount")}</div>
                                <input type="number" min="1" className="exercise_editor_page-form-item-counter" value={autocheckCheckAmount} onChange={(e) => { setAutocheckCheckAmount(e.target.value); addData("inputCount", e.target.value) }}></input>
                            </div>)}
                    </div>
                    <div className="exercise_editor_page-form-item">
                        <div className="exercise_editor_page-form-item-label">{t("complete_percent")}</div>
                        <input type="number" min="1" max="100" defaultValue="100" className="exercise_editor_page-form-item-counter" onChange={(e) => { addData("minimalPercent", e.target.value) }}></input>
                    </div>
                    {autocheckType === t("output_check") && (
                        <div className="exercise_editor_page-form-item">
                            <div className="exercise_editor_page-form-item-label">{t("Output")}</div>
                            <textarea className="exercise_editor_page-form-item-textarea" onInput={(e) => addData("withoutInputAnswer", e.target.value)}></textarea>
                        </div>)}
                    {(autocheckType === t("output_check_input") || autocheckType === t("func_check")) && (<AutocheckValues inputAmount={autocheckCheckAmount} setInputs={(p) => addData("inputAnswers", p)} func={autocheckType === t("func_check")} />)}
                </>
            )}
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("Files")}</div>
                <input type="checkbox" className="exercise_editor_page-form-item-checkbox" onChange={() => setFiles(!files)} checked={files} />
            </div>
            {files && (<>
                <FileMenu addFiles={(f) => addData("files", f)} startFiles={data.files} />
            </>)}
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