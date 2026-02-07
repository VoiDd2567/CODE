import SettingsInput from "./settingsInput";
import arrow from "../../../pictures/arrow-r.png"
import { useTranslation } from "react-i18next";
import deleteImg from "../../../pictures/delete.png";
import deleteRedImg from "../../../pictures/delete-red.png";

const InOut = ({ setInputText, setOutputText, inputValue, outputValue, deleteTest }) => {
    const { t } = useTranslation();

    const handleChange = (e, type) => {
        const value = e.target.value;
        if (type === "out") {
            setOutputText(value)
            return
        }
        if (type === "in") {
            setInputText(value)
            return
        }
    }

    return (<div className="inOut">
        <SettingsInput width={"100%"} label={t("input")} enterAllowed={true} onChange={(e) => handleChange(e, "in")} value={inputValue} />
        <div className="arrow-img"><img src={arrow} alt="To" /></div>
        <SettingsInput width={"100%"} label={t("output")} enterAllowed={true} onChange={(e) => handleChange(e, "out")} value={outputValue} />
        <div className="inOut-del" onClick={deleteTest} style={{ backgroundImage: `url(${deleteImg})` }}
            onMouseEnter={e => e.currentTarget.style.backgroundImage = `url(${deleteRedImg})`}
            onMouseLeave={e => e.currentTarget.style.backgroundImage = `url(${deleteImg})`}></div>
    </div>)
}

export default InOut;