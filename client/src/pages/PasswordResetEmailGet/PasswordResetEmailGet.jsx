import LoginingPageLogo from "../../components/other/logginingPagesLogo";
import "./passwordResetEmailGet.css"
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import client_config from "../../client_config.json"

const PasswordResetEmailGet = () => {
    const { t } = useTranslation();
    const [redirectBack, setRedirectBack] = useState(false);
    const [success, setSuccess] = useState(false)
    const [emailValue, setEmailValue] = useState(null)
    const email = useRef(null)
    const errorMessage = useRef(null);

    if (redirectBack) {
        window.location.replace("/")
    }

    const handleFormClick = () => {
        event.preventDefault();

        setEmailValue(email.current.value)
        fetch(`${client_config.SERVER_IP}/api/auth/send-reset-link`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.current.value
            }),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                setSuccess(true);
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    }

    return (<div className="password_reset_email_get-page">
        <LoginingPageLogo />
        {success ? (<div className="password_reset_email_get-page__form">
            <label className="info-label">{t("email_reset_sent")}</label>
            <label className="info-label">{emailValue}</label>
        </div>) : (
            <div className="password_reset_email_get-page__form">
                <label className="login-page__error" ref={errorMessage} hidden></label>
                <label className="info-label">{t("write_email_to_get_reset")}</label>
                <input name="email" ref={email} className="login-page__input" placeholder={t("email")} required />
                <button className="login-page__send-form-btn" onClick={() => handleFormClick()}>{t("send")}</button>
            </div>
        )
        }
        <div className="registration-page__back-button" onClick={() => setRedirectBack(true)}>{t("back")}</div>
    </div >)
}
export default PasswordResetEmailGet;