import { useEffect, useState, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import client_config from "../../client_config.json"

const NewCodeSend = ({ endDate, onTimeout, setNewCodeSend, successMessage, errorMessage, newCodeSendDiv }) => {
    const { t } = useTranslation();


    const codeTimer = useRef(null);
    const codeBtn = useRef(null);

    const handleNewCodeSend = () => {
        if (codeBtn.current.classList.contains("active")) {
            fetch(`${client_config.SERVER_IP}/api/auth/get-new-reg-code`, {
                method: "GET",
                credentials: "include"
            }).then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    errorMessage.textContent = errorData.error || 'Error';
                    errorMessage.hidden = false;
                    setTimeout(() => {
                        errorMessage.hidden = true
                    }, 5000)
                    throw new Error(`Error ${res.status}`);
                } else {
                    const data = await res.json();
                    setNewCodeSend(new Date(data.newCodeExpires).toISOString())

                    successMessage.current.textContent = t("new_code_get_success");
                    successMessage.current.hidden = false
                    setTimeout(() => {
                        successMessage.current.hidden = true
                    }, 30000)
                    changeNewCodeAppearance(false);
                }
            })
        }
    }

    const getTimeLeft = useCallback(() => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.floor((end - now) / 1000);
        return diff > 0 ? diff : 0
    }, [endDate])

    const [timeLeft, setTimeLeft] = useState(getTimeLeft())

    const changeNewCodeAppearance = (reseted) => {
        if (reseted) {
            newCodeSendDiv.current.classList.toggle('active');
            codeBtn.current.classList.toggle('active');
            codeTimer.current.hidden = true;
        } else {
            newCodeSendDiv.current.classList.toggle('active');
            codeBtn.current.classList.toggle('active');
            codeTimer.current.hidden = false;
        }

    }

    useEffect(() => {
        setTimeLeft(getTimeLeft())
        const timerId = setInterval(() => {
            const remaining = getTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerId);
                changeNewCodeAppearance(true);
            }
        }, 1000)
        return () => clearInterval(timerId)
    }, [endDate, onTimeout, getTimeLeft])

    const formatTime = (num) => (num < 10 ? "0" + num : num);

    const minutes = formatTime(Math.floor(timeLeft / 60));
    const seconds = formatTime(timeLeft % 60);

    return (
        <div ref={newCodeSendDiv} className="code-page__new-code-send">
            <div ref={codeTimer} className="code-page__new-code-send__timer">{minutes}:{seconds}</div>
            <label ref={codeBtn} className="code-page__new-code-send-btn" onClick={handleNewCodeSend}>{t("new_code_send")}</label>
        </div>
    )
}

export default NewCodeSend