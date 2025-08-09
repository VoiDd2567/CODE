import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "./login.css";
import logo from "../../pictures/logo.png";

const Login = () => {
    const { t, i18n } = useTranslation();

    const [redirectToRegistration, setRedirectToRegistration] = useState(false);
    const [redirectBack, setRedirectBack] = useState(false);
    const username = useRef(null);
    const password = useRef(null);
    const errorMessage = useRef(null);

    const fetchData = (event) => {
        event.preventDefault();

        fetch('https://localhost:3001/api/login', {
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
                console.log(res)
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                console.log(res)
                const data = await res.json();
                i18n.changeLanguage(data["user"].defaultLng);
                setRedirectBack(true);
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    };


    const handleToRegisterClick = () => {
        setRedirectToRegistration(true);
    };

    if (redirectToRegistration) {
        return <Navigate to="/registration" replace />;
    }

    if (redirectBack) {
        window.location.replace("/")
    }

    return (
        <div className="login-page">
            <div className="login-page__logo"><img src={logo} alt="Logo" /></div>
            <form className="login-page__form">
                <label className="login-page__error" ref={errorMessage} hidden></label>
                <input name="username" ref={username} className="login-page__input" placeholder={t("username")} required />
                <PasswordInput password={password} pholder={t("password")} />
                <button className="login-page__send-form-btn" onClick={fetchData}>{t("login")}</button>
                <div className="login-page__registry">
                    <label className="login-page__label">{t("account_dont_exist_q")}</label>
                    <a className="login-page__link" onClick={handleToRegisterClick}>{t("registrate")}</a>
                </div>
            </form>
            <div className="registration-page__back-button" onClick={() => setRedirectBack(true)}>Back</div>
        </div>
    );
};

export default Login;
