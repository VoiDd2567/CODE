import MinimizedHeader from "../../components/other/minimizedHeader"
import { useTranslation } from "react-i18next";
import { useState } from "react";
import DescriprionBlock from "./componenets/descriptionBlock";
import AutocheckValues from "./componenets/autocheckValues";

import "./exerciseEditor.css"
import "./componenets/components.css"

const ExerciseEditor = () => {
    const { t } = useTranslation();
    const [autocheck, setAutocheck] = useState(true)
    const [autocheckType, setAutocheckType] = useState(t("output_check_input"))
    const [autocheckCheckAmount, setAutocheckCheckAmount] = useState(1)

    return <div className="exercise_editor_page">
        <MinimizedHeader />
        <div className="exercise_editor_page-form">
            <div className="exercise_editor_page-form-item">
                <div className="exercise_editor_page-form-item-label">{t("name")}</div>
                <textarea className="exercise_editor_page-form-item-textarea" autoFocus></textarea>
            </div>
            <DescriprionBlock />
            <div className="exercise_editor_page-form-select">
                <div className="exercise_editor_page-form-section_name">{t("autocheck")}</div>
                <input type="checkbox" className="exercise_editor_page-form-item-checkbox" onChange={() => setAutocheck(!autocheck)} checked={autocheck} />
            </div>
            {autocheck && (
                <>
                    <div className="exercise_editor_page-form-items_line">
                        <div className="exercise_editor_page-form-item">
                            <div className="exercise_editor_page-form-item-label">{t("autocheck_type")}</div>
                            <select className="exercise_editor_page-form-item-select" onChange={(e) => setAutocheckType(e.target.value)}>
                                <option value={t("output_check_input")}>{t("output_check_input")}</option>
                                <option value={t("func_check")}>{t("func_check")}</option>
                                <option value={t("output_check")}>{t("output_check")}</option>
                            </select>
                        </div>
                        {autocheckType === t("func_check") && (
                            <div className="exercise_editor_page-form-item">
                                <div className="exercise_editor_page-form-item-label">{t("function_name")}</div>
                                <textarea className="exercise_editor_page-form-item-textarea small-textarea"></textarea>
                            </div>)}
                        {(autocheckType === t("func_check") || autocheckType === t("output_check_input")) && (
                            <div className="exercise_editor_page-form-item">
                                <div className="exercise_editor_page-form-item-label">{t("check_amount")}</div>
                                <input type="number" min="1" className="exercise_editor_page-form-item-counter" value={autocheckCheckAmount} onChange={(e) => setAutocheckCheckAmount(e.target.value)}></input>
                            </div>)}
                    </div>
                    {autocheckType === t("output_check") && (
                        <div className="exercise_editor_page-form-item">
                            <div className="exercise_editor_page-form-item-label">{t("Output")}</div>
                            <textarea className="exercise_editor_page-form-item-textarea"></textarea>
                        </div>)}
                    {(autocheckType === t("output_check_input") || autocheckType === t("func_check")) && (<AutocheckValues inputAmount={autocheckCheckAmount} />)}
                </>
            )}
            <div className="exercise_editor_page_bottom"></div>
        </div>
    </div>
}

export default ExerciseEditor