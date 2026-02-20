import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import "./askWindow.css"

const AskWindow = ({ question, func, open, setOpen, negFunc = () => { } }) => {
    const { t } = useTranslation();


    if (!open) return null;

    return createPortal(<div className="ask_window-wrap">
        <div className="ask_window">
            <div className="ask_window-question">{question}</div>
            <div className="ask_window-line">
                <div className="ask_window-option negative" onClick={() => { setOpen(false); func() }}>{t("yes")}</div>
                <div className="ask_window-option positive" onClick={() => { setOpen(false); negFunc() }}>{t("no")}</div>
            </div>
        </div>
    </div>, document.body)
}

export default AskWindow;
