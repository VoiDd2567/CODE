import { useTranslation } from "react-i18next";

const SecurityWindow = () => {
    const { t } = useTranslation();

    return (<div className="profile_page-window">
        <div className="profile_page-window-main">
            <label className="profile_page-window-main-label" htmlFor="">{t("last_password_change")} : 22.02.14</label>
            <button className="change_password_btn">{t("change_password")}</button>
        </div>
    </div>)
}

export default SecurityWindow;