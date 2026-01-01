import MinimizedHeader from "../../components/other/minimizedHeader"
import { useTranslation } from "react-i18next";
import { useState } from "react";
import DescriprionBlock from "./componenets/descriptionBlock";
import AutocheckValues from "./componenets/autocheckValues";
import FileMenu from "./componenets/fileMenu";
import cross from "../../pictures/cross-b.png"
import client_config from "../../client_config.json"

import "./exerciseEditor.css"
import "./componenets/components.css"

const ExerciseEditor = () => {
    const { t } = useTranslation();
    const [autocheck, setAutocheck] = useState(true)
    const [autocheckType, setAutocheckType] = useState(t("output_check_input"))
    const [autocheckCheckAmount, setAutocheckCheckAmount] = useState(1)
    const [files, setFiles] = useState(true)
    const [notifications, setNotifications] = useState([])
    const [data, setData] = useState({
        "programmingLng": "py",
        "inputCount": "1",
        "answerCheckType": "checkCodeOutput",
        "minimalPercent": "100"
    })

    const addNotification = (message, type = "green") => {
        setNotifications(prev => [
            ...prev,
            { message, type }
        ])
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

        addData("type", "code")

        fetch(`${client_config.SERVER_IP}/api/exercise/new-exercise`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: data })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                addNotification(errorData, "red")
            } else {
                const ans = await res.json();
                addNotification(`Exercise created with id - ${ans.id}`, "green")
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

        addData("autoCheckType", typeMap[v])

        if (v === t("output_check_input")) {
            addData("inputCount", 1)
            setAutocheckCheckAmount(1)
        } else {
            addData("inputCount", 0)
        }
    }

    return <div className="exercise_editor_page">
        <MinimizedHeader />
        <div className="exercise_editor_page-form">
            <div className="exercise_editor_page-form-items_line">
                <div className="exercise_editor_page-form-item">
                    <div className="exercise_editor_page-form-item-label">{t("name")}</div>
                    <textarea className="exercise_editor_page-form-item-textarea" onInput={(e) => addData("name", e.target.value)} autoFocus></textarea>
                </div>
                <div className="exercise_editor_page-form-item">
                    <div className="exercise_editor_page-form-item-label">{t("code_lng")}</div>
                    <select className="exercise_editor_page-form-item-select" onChange={(e) => addData("programmingLng", e.target.value)}>
                        <option value={"py"}>Python</option>
                        <option value={"js"}>JavaScript</option>
                    </select>
                </div>
            </div>
            <DescriprionBlock setDesc={(d) => addData("description", d)} />
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("autocheck")}</div>
                <input type="checkbox" className="exercise_editor_page-form-item-checkbox" onChange={() => { setAutocheck(!autocheck); addData("autoCheck", !autocheck) }} checked={autocheck} />
            </div>
            {autocheck && (
                <>
                    <div className="exercise_editor_page-form-items_line">
                        <div className="exercise_editor_page-form-item">
                            <div className="exercise_editor_page-form-item-label">{t("autocheck_type")}</div>
                            <select className="exercise_editor_page-form-item-select" onChange={(e) => handleAutocheckType(e)}>
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
                <FileMenu addFiles={(f) => addData("files", f)} />
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
    </div>
}

export default ExerciseEditor