import { useState, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import TeacherStudentChoose from "./TeacherStudentChoose";
import LoginingPageLogo from "../../components/other/logginingPagesLogo";
import { LanguageContext } from "../../components/LanguageContext/LanguageContext";
import "./registration.css";
import client_config from "../../client_config.json"

const Registration = () => {
    const { t, i18n } = useTranslation();
    const { lng, setLng } = useContext(LanguageContext);

    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [redirectBack, setRedirectBack] = useState(false);
    const [redirectToCode, setRedirectCode] = useState(false)
    const [role, setRole] = useState("student");
    const [regText, setRegText] = useState(t("registrate"))
    const username = useRef(null);
    const password = useRef(null);
    const password_repeat = useRef(null);
    const email = useRef(null);
    const policy = useRef(null);
    const errorMessage = useRef(null);
    const fetchData = (event) => {
        event.preventDefault();
        setRegText(t("waiting"));

        fetch(`${client_config.SERVER_IP}/api/auth/registration`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.current.value,
                password: password.current.value,
                password_repeat: password_repeat.current.value,
                email: email.current.value,
                role,
                policy: policy.current.checked,
                lng: lng
            }),
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
            } else {
                const data = await res.json();
                if (data.message == "Success") {
                    setRedirectCode(true);
                }
            }
            setRegText(t("registrate"))
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
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
            body: JSON.stringify({ lng: newLng }),
        })
    };

    if (redirectToCode) {
        return <Navigate to="/registration-code" replace />;
    }

    if (redirectToLogin) {
        return <Navigate to="/login" replace />;
    }

    if (redirectBack) {
        return <Navigate to="/" replace />;
    }

    return (<>
        <div className="registration-page">
            <LoginingPageLogo />
            <form className="registration-page__form">
                <label className="registration-page__error" ref={errorMessage} hidden></label>
                <input name="username" className="registration-page__input" ref={username} placeholder={t("username")} required />
                <PasswordInput password={password} pholder={t("password")} />
                <PasswordInput password={password_repeat} pholder={t("password_repeat")} />
                <input name="email" className="registration-page__input" ref={email} placeholder={t("email")} />
                <TeacherStudentChoose setRole={setRole} />
                <div className="registration-page__agree-terms-of-use">
                    <label htmlFor="acceptPolicy" className="registration-page__label terms-of-use-ask-label">{t("agreement_question")}<a href="https://docs.google.com/document/d/14fUs8iqHhFe-m_9bdYyN8Vhf-TCETn-tz-whVJkO90w/edit?usp=sharing"> {t("terms_of_use")}</a></label>
                    <input name="acceptPolicy" ref={policy} type="checkbox" className="registration-page__checkbox" required />
                </div>
                <button className="registration-page__send-form-btn" onClick={fetchData} >{regText}</button>
                <div className="registration-page__registry">
                    <label className="registration-page__label">{t("account_exists_q")}</label>
                    <a className="registration-page__link" onClick={() => setRedirectToLogin(true)}>{t("login")}</a>
                </div>
            </form >
            <div className="registration-page__back-button" onClick={() => setRedirectBack(true)}>{t("back")}</div>
        </div >
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

export default Registration;
