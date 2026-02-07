import AskWindow from "../../../components/AskWindow/AskWindow"
import { useTranslation } from "react-i18next";

const DelAccountWindow = () => {
    const { t } = useTranslation()

    return (<div className="profile_page-window">
        You can't delete account ({t("placeholder")})
    </div>)
}

export default DelAccountWindow;