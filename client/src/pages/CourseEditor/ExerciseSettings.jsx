import "./exerciseSettings.css"
import SettingsInput from "../../components/ExerciseSettingsComponents/settingsInput";
import SettingsSelect from "../../components/ExerciseSettingsComponents/settingsSelect";
import SettingsCheckbox from "../../components/ExerciseSettingsComponents/settingsCheckbox";
import AutoCheckInput from "../../components/ExerciseSettingsComponents/AutoCheckInput";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ExerciseSettings = ({ setOpenSettings }) => {
    const { t } = useTranslation()
    const exName = useRef(null)
    const exDescription = useRef(null)
    const exAutocheck = useRef(null)
    const [exLngValue, setExLngValue] = useState("");
    const [exTypeValue, setExTypeValue] = useState("");
    const [openAutoCheck, setOpenAutoCheck] = useState(false)
    const [openAutoCheckTypeOpen, setOpenAutoCheckTypeOpen] = useState(false)
    const [openAutoCheckType, setOpenAutoCheckType] = useState(null)
    const [autoCheck, setAutoCheck] = useState(false);

    useEffect(() => {
        const el = exDescription.current;
        return resizeInput(el)
    }, [exDescription]);

    const resizeInput = (el) => {
        if (!el) return;

        const resize = () => {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        };

        el.addEventListener("input", resize);
        resize();

        return () => el.removeEventListener("input", resize);
    }

    const handleExTypeChange = (e) => {
        if (e.target.value === t("code_type")) {
            setOpenAutoCheck(true);
        } else {
            setOpenAutoCheck(false);
        }
    }

    const handleAutocheckChange = (e) => {
        const checked = e.target.checked
        setAutoCheck(checked)
        setOpenAutoCheckTypeOpen(checked);
    }

    const handleAutocheckTypeChange = (e) => {
        const changed = e.target.value
        setOpenAutoCheckType(changed)
    }

    return (<div className="exercise_settings-wrap">
        <div className="exercise_settings">
            <div className="cross-ex" onClick={() => setOpenSettings(false)}></div>
            <div className="heading">{t("exercise_settings")}</div>
            <div className="line">
                <SettingsInput label={t("name")} inputRef={exName} width={"55%"} />
                <SettingsSelect label={t("language")} onChange={(e) => setExLngValue(e.target.value)} options={["Est", "Eng"]} />
            </div>
            <div className="line centered-line">
                <SettingsSelect label={t("exercise_type")} onChange={(e) => handleExTypeChange(e)} options={[t("select_type"), t("code_type")]} />
                {
                    openAutoCheck && (
                        <SettingsCheckbox key={autoCheck.toString()} label={t("autocheck")} checked={autoCheck} onChange={(e) => handleAutocheckChange(e)} divClass="autocheck" />
                    )
                }
            </div>
            <div className="line">
                <SettingsInput label={t("description")} inputRef={exDescription} width={"85%"} enterAllowed={true} />
            </div>
            {openAutoCheckTypeOpen && (
                <div className="line">
                    <SettingsSelect label={t("autocheck_type")} options={[t("output_check"), t("output_check_input"), t("func_check")]} onChange={(e) => handleAutocheckTypeChange(e)} />
                </div>
            )}
            {(openAutoCheckType === t("output_check_input") || openAutoCheckType === t("func_check")) && (
                <div className="line">
                    <AutoCheckInput setList={(e) => console.log(e)} />
                </div>
            )}

        </div>
    </div>)
};

export default ExerciseSettings;