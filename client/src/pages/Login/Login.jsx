import { useState, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../../components/LanguageContext/LanguageContext"
import { Navigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import LoginingPageLogo from "../../components/other/logginingPagesLogo";
import "./login.css";
import client_config from "../../client_config.json"

const Login = () => {
    const { t, i18n } = useTranslation();

    const [redirectToRegistration, setRedirectToRegistration] = useState(false);
    const [redirectToPasswordReset, setRedirectToPasswordReset] = useState(false);
    const [redirectBack, setRedirectBack] = useState(false);
    const username = useRef(null);
    const password = useRef(null);
    const errorMessage = useRef(null);
    const { lng, setLng } = useContext(LanguageContext);

    const fetchData = (event) => {
        event.preventDefault();

        fetch(`${client_config.SERVER_IP}/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.current.value,
                password: password.current.value
            }),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                i18n.changeLanguage(data["user"].defaultLng);
                setRedirectBack(true);
            }
        }).catch(async error => {
            errorMessage.current.textContent = error || 'Error';
            errorMessage.current.hidden = false;
            console.error('ERROR with sending data', error);
        });
    };


    const handleToRegisterClick = () => {
        setRedirectToRegistration(true);
    };

    const changeLng = () => {
        let newLng = "est"
        if (lng === newLng) {
            newLng = "eng"
        }

        setLng(newLng);
        i18n.changeLanguage(newLng);

        fetch(`${client_config.SERVER_IP}/api/user/lng`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newLng }),
        })

    };

    if (redirectToRegistration) {
        return <Navigate to="/registration" replace />;
    }

    if (redirectToPasswordReset) {
        return <Navigate to="/password-reseting" replace />;
    }

    if (redirectBack) {
        window.location.replace("/")
    }

    return (<>
        <div className="login-page">
            <LoginingPageLogo />
            <form className="login-page__form">
                <label className="login-page__error" ref={errorMessage} hidden></label>
                <input name="username" ref={username} className="login-page__input" placeholder={t("username")} required />
                <PasswordInput password={password} pholder={t("password")} />
                <a className="login_page-forgot_password login-page__link" onClick={() => setRedirectToPasswordReset(true)}>{t("forgot_password_q")}</a>
                <button className="login-page__send-form-btn" onClick={fetchData}>{t("login")}</button>
                <div className="login-page__registry">
                    <label className="login-page__label">{t("account_dont_exist_q")}</label>
                    <a className="login-page__link" onClick={handleToRegisterClick}>{t("registrate")}</a>
                </div>
            </form>
            <div className="registration-page__back-button" onClick={() => setRedirectBack(true)}>{t("back")}</div>

        </div>
        <div className="log-lng_switch">
            <div className={`lng_switch-txt`}>EST</div>
            <label className="lng_switch-switch">
                <input
                    type="checkbox"
                    checked={lng === "eng"}
                    onChange={changeLng}
                />
                <span></span>
            </label>
            <div className={`lng_switch-txt`}>ENG</div>
        </div>
    </>
    );
};

export default Login;
