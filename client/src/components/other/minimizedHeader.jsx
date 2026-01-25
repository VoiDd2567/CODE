import { useState, useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { LanguageContext } from "../LanguageContext/LanguageContext"
import { useTranslation } from "react-i18next";
import logo from "../../pictures/logo.png";
import accountOpenImg from "../../pictures/account-circle-open.png"
import accountCloseImg from "../../pictures/account-circle-close.png"
import exercise_yellow from "../../pictures/exercise_yellow.png"
import code_yellow from "../../pictures/code_yellow.png"
import client_config from "../../client_config.json"
import "./mHeader.css"

const MinimizedHeader = ({ showExercise, showCode, fixed }) => {
    const { t, i18n } = useTranslation()

    const header = useRef(null)
    const [redirectHome, setRedirectHome] = useState(false);
    const [redirectExerciseEditor, setRedirectExerciseEditor] = useState(false);
    const [redirectCodeEditor, setRedirectCodeEditor] = useState(false);
    const [redirectToProfile, setRedirectToProfile] = useState(false)
    const [accountOpen, setAccountOpen] = useState(false)

    const { user } = useContext(UserContext);
    const { lng, setLng } = useContext(LanguageContext);

    useEffect(() => {
        if (fixed) {
            header.current.style.position = "fixed";
        } else {
            header.current.style.position = "inherit";
        }
    }, [fixed])

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

    const logout = () => {
        fetch(`${client_config.SERVER_IP}/api/auth/logout`, {
            method: 'GET',
            credentials: 'include',
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData)
                throw new Error(`Error ${res.status}`);
            } else {
                window.location.reload();
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    }

    const returnHome = () => {
        setRedirectHome(true);
    }

    if (redirectHome) {
        return <Navigate to="/" replace />
    }

    if (redirectExerciseEditor) {
        return <Navigate to="/exercise-editor" replace />
    }

    if (redirectToProfile) {
        return <Navigate to="/profile-settings" replace />;
    }

    if (redirectCodeEditor) {
        return <Navigate to="/code-editor" replace />;
    }

    return (
        <div className="m_header" ref={header}>
            <img className="m_header-logo" onClick={returnHome} src={logo} alt="Logo" />
            <div className="m_header-inside">
                <div className="m_header-lng_switch">
                    <div className={`lng_switch-txt ${lng === "est" ? "" : "small-lng"}`}>EST</div>
                    <label className="lng_switch-switch">
                        <input type="checkbox" onClick={changeLng} />
                        <span></span>
                    </label>
                    <div className={`lng_switch-txt ${lng === "eng" ? "" : "small-lng"}`}>ENG</div>
                </div>
                {user.weight === "teacher" && (<>
                    {showExercise && (
                        <div className="m_header-exercise_editor">
                            <img
                                src={exercise_yellow}
                                onClick={() => setRedirectExerciseEditor(true)}
                                title={t("exercise_editor")}
                            />
                        </div>
                    )}
                    {showCode && (
                        <div className="m_header-exercise_editor">
                            <img
                                src={code_yellow}
                                onClick={() => setRedirectCodeEditor(true)}
                                title={t("code_editor")}
                            />
                        </div>
                    )}
                </>)}
                <div className="m_header-account">
                    <div className="m_header-account-img">
                        <img src={accountOpen ? accountCloseImg : accountOpenImg} alt="Account" onClick={() => setAccountOpen(!accountOpen)} />
                        {accountOpen && (
                            <div className="account-menu">
                                <div onClick={() => { setRedirectToProfile(true) }}>{t("settings")}</div>
                                <div style={{ "color": "#c62522ff" }} onClick={logout}>{t("logout")}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MinimizedHeader;