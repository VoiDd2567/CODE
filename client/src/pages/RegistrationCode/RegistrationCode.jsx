import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import CodeInput from "./CodeInput"
import TimerToCodeEnd from "./TimerToCodeEnd";
import NewCodeSend from "./NewCodeSend";
import "./registrationCode.css"
import logo from "../../pictures/logo.png";
import { useEffect } from "react";

const RegistrationCode = () => {
    const { t } = useTranslation();
    const [redirectBack, setRedirectHome] = useState(false);
    const [redirectToMain, setRedirectToMain] = useState(false);
    const [codeEndTime, setCodeEndTime] = useState(null);
    const [newCodeSend, setNewCodeSend] = useState(null);
    const [timeouted, setTimeouted] = useState(false);
    const [email, setEmail] = useState(null);
    const [code, setCode] = useState(null);
    const successMessage = useRef(null);
    const errorMessage = useRef(null);
    const codeInputLabel = useRef(null);
    const sendBtn = useRef(null);
    const codeInput = useRef(null);
    const newCodeSendDiv = useRef(null);

    const codeExpireTime = () => {
        fetch("https://localhost:3001/api/auth/reg-code-time", {
            method: "GET",
            credentials: "include"
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                setCodeEndTime(data.data.codeExpires);
                console.log(data)
                setNewCodeSend(data.data.newCodeSend)
                setEmail(data.data.email)
            }
        })
    }

    useEffect(() => {
        codeExpireTime();
    }, [])

    const checkCode = (event) => {
        event.preventDefault();
        fetch("https://localhost:3001/api/auth/check-reg-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                errorMessage.current.textContent = errorData.error || 'Error';
                errorMessage.current.hidden = false;
                if (errorData.redirect) {
                    setTimeout(() => {
                        window.location.replace("/registartion")
                    }, 2000)
                }
                throw new Error(`Error ${res.status}`);
            } else {
                setRedirectToMain(true);
            }
        })
    }

    const handleComplete = (code) => {
        setCode(code)
    }

    const handelTimeouted = () => {
        setTimeouted(true);
    }

    const handleBack = () => {
        setRedirectHome(true);
    };

    if (redirectBack) {
        return <Navigate to="/registration" replace />;
    }

    if (redirectToMain) {
        window.location.replace("/");
    }

    if (timeouted) {
        newCodeSendDiv.current.hidden = true;
        codeInput.current.hidden = true;
        codeInputLabel.current.hidden = true;
        sendBtn.current.hidden = true;
    }

    return (
        <div className="code-page">
            <div className="code-page__logo"><img src={logo} alt="Logo" /></div>
            <form className="code-page__form" onSubmit={checkCode}>
                <label ref={errorMessage} className="code-page__error" hidden></label>
                <label ref={successMessage} className="code-page__success" hidden></label>
                {!timeouted ? (
                    <div className="code-page__labels">
                        <label className="code-page__code-info">{t("code_info_email")}<div className="code-page__code-info__email">{email}</div></label>
                        <TimerToCodeEnd endDate={codeEndTime} onTimeout={handelTimeouted} />
                    </div>) : (
                    <div className="code-page__timeouted-label">{t("new_code_ask")}</div>
                )
                }
                <label ref={codeInputLabel} className="code-page__code-info__write">{t("write_code_below")}</label>
                <CodeInput onComplete={handleComplete} codeInput={codeInput} />
                <button ref={sendBtn} className="code-page__send-form-btn" type="submit">{t("send_code")}</button>
                <NewCodeSend newCodeSendDiv={newCodeSendDiv} endDate={newCodeSend} setNewCodeSend={setNewCodeSend} errorMessage={errorMessage} successMessage={successMessage} hidden />
            </form>
            <div className="registration-page__back-button" onClick={handleBack}>Back</div>
        </div>
    )
}


export default RegistrationCode;