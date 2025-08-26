
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const GeneralWindow = (user) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
        if (!user) return;
        else {
            if (!("user" in user)) { return; }
            if (!user.user) { return; }
            else {
                setUsername(user.user.username)
                setEmail(user.user.email)
            }
        }
    }, [user])

    return (<div className="profile_page-window">
        <div className="profile_page-window-main">
            <form action="">
                <label className="profile_page-window-main-label">{t("username")}</label>
                <input type="text" className="profile_page-window-main-input" defaultValue={username} placeholder={t("your_username")} disabled />
                <label className="profile_page-window-main-label">{t("email")}</label>
                <input type="text" className="profile_page-window-main-input" defaultValue={email} placeholder={t("your_username")} disabled />
                <label className="profile_page-window-main-label">{t("language")}</label>
                <select name="lng" id="" className="profile_page-window-main-select">
                    <option value="English">English</option>
                    <option value="Eesti">Eesti</option>
                </select>
            </form>
        </div>
    </div>)
}

export default GeneralWindow;