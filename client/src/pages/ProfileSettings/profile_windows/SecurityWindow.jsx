import { useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../components/UserContext";

const SecurityWindow = () => {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const resetMessage = useRef(null);

    useEffect(() => {
        console.log(user.user)
    })

    const handleChangeClick = () => {
        fetch('https://localhost:3001/api/auth/send-reset-link', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.user.email
            }),
        }).then(async res => {
            if (!res.ok) {
                resetMessage.current.textContent = "Couldn't send link. Try again later";
                resetMessage.current.style.color = "red";
                resetMessage.current.hidden = false;
                throw new Error(`Error ${res.status}`);
            } else {
                resetMessage.current.textContent = "Link was sent to your email";
                resetMessage.current.style.color = "green";
                resetMessage.current.hidden = false;
            }
        }).catch(error => {
            console.error('ERROR with sending data', error);
        });
    }

    return (
        <div className="profile_page-window">
            <div className="profile_page-window-main">
                <label className="profile_page-window-main-label" htmlFor="">
                    {t("last_password_change")} : {user.user.passwordLastChanged}
                </label>
                <div className="profile_page-window-reset_password">
                    <button
                        className="change_password_btn"
                        onClick={handleChangeClick}
                    >
                        {t("change_password")}
                    </button>
                    <div
                        className="profile_page-window-reset_password-message"
                        ref={resetMessage}
                        hidden
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default SecurityWindow;