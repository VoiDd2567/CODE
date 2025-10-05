import "./exerciseSettings.css"
import SettingsInput from "../../components/ExerciseSettingsComponents/settingsInput";
import SettingsSelect from "../../components/ExerciseSettingsComponents/settingsSelect";
import SettingsCheckbox from "../../components/ExerciseSettingsComponents/settingsCheckbox";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ExerciseSettings = ({ setOpenSettings }) => {
    const { t } = useTranslation()
    const exName = useRef(null)
    const exDescription = useRef(null)
    const exAutocheck = useRef(null)
    const [exLngValue, setExLngValue] = useState("");
    const [exTypeValue, setExTypeValue] = useState("");
    const [openAutoCheckType, setOpenAutoCheckType] = useState(false)

    useEffect(() => {
        const el = exDescription.current;
        if (!el) return;

        const resize = () => {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        };

        el.addEventListener("input", resize);
        resize();

        return () => el.removeEventListener("input", resize);
    }, []);

    useEffect(() => {
        if (exTypeValue === t("code_type")) {
            setOpenAutoCheckType(true);
        }
    }, [exTypeValue, t])

    return (<div className="exercise_settings-wrap">
        <div className="exercise_settings">
            <div className="cross" onClick={() => setOpenSettings(false)}></div>
            <div className="heading">{t("exercise_settings")}</div>
            <div className="line">
                <SettingsInput label={t("name")} inputRef={exName} width={"55%"} />
                <SettingsSelect label={t("language")} onChange={(e) => setExLngValue(e.target.value)} options={["Est", "Eng"]} />
            </div>
            <div className="line">
                <SettingsSelect label={t("exercise_type")} onChange={(e) => setExTypeValue(e.target.value)} options={[t("select_type"), t("code_type")]} />
                <SettingsCheckbox label={t("autocheck")} checkBoxRef={exAutocheck} />
            </div>
            <div className="line">
                <SettingsInput label={t("description")} inputRef={exDescription} width={"85%"} enterAllowed={true} />
            </div>
        </div>
    </div>)
};

export default ExerciseSettings;