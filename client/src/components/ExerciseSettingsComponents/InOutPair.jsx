import SettingsInput from "./settingsInput";
import arrow from "../../pictures/arrow-r.png"
import { useTranslation } from "react-i18next";

const InOut = () => {
    const { t } = useTranslation();

    return (<div className="inOut">
        <SettingsInput width={"100%"} label={t("input")} enterAllowed={true} />
        <div className="arrow-img"><img src={arrow} alt="To" /></div>
        <SettingsInput width={"100%"} label={t("output")} enterAllowed={true} />
    </div>)
}

export default InOut;