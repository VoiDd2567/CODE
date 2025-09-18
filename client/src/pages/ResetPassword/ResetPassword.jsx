import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import LogginingPageLogo from "../../components/other/logginingPagesLogo";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "./resetPassword.css"

const ResetPassword = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    const { t } = useTranslation();
    const errorMessage = useRef(null);
    const [reseted, setReseted] = useState(false)
    const [rightToken, setRightToken] = useState(false)
    const [redirectBack, setRedirectBack] = useState(false);
    const password = useRef();
    const password_repeat = useRef();

    useEffect(() => {
        errorMessage.current.hidden = true;
        fetch('https://localhost:3001/api/auth/check-reset-token', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                userId: uid
            }),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                setRightToken(true)
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    }, [token, uid])

    if (redirectBack) {
        return <Navigate to="/" replace />;
    }

    const handleSend = () => {
        errorMessage.current.hidden = true;
        const pas = password.current.value;
        const pas_repeat = password_repeat.current.value;

        if (pas != pas_repeat) {
            errorMessage.current.textContent = t("paswords_not_same");
            errorMessage.current.hidden = false;
            return;
        }

        fetch('https://localhost:3001/api/auth/reset-password', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                userId: uid,
                password: pas
            }),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                setReseted(true)
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    }

    return (<div className="password_reset_page">
        <LogginingPageLogo />
        <div className="password_reset-page__form">
            <label className="login-page__error" ref={errorMessage} hidden></label>
            {rightToken ?
                reseted ? (<div>
                    <div className="info-label" style={{ "color": "green" }}>{t("password_changed")}</div>
                </div>) :
                    (<div className="password_reset-page__form-wrap">
                        <div className="info-label">{t("enter_new_password")}</div>
                        <PasswordInput password={password} pholder={t("password")} />
                        <PasswordInput password={password_repeat} pholder={t("password_repeat")} />
                        <button className="password_reset-page__form-btn" onClick={handleSend}>{t("send")}</button>
                    </div>) :
                (<div>
                    <div className="info-label">{t("wrong_token")}</div>
                </div>)}
        </div>
        <div className="registration-page__back-button" onClick={() => setRedirectBack(true)}>{t("back")}</div>
    </div>)
}

export default ResetPassword