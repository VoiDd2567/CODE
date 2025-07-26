import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const TimerToCodeEnd = ({ endDate, onTimeout }) => {
    const { t } = useTranslation();

    const getTimeLeft = () => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.floor((end - now) / 1000);
        return diff > 0 ? diff : 0
    }

    const [timeLeft, setTimeLeft] = useState(getTimeLeft())

    useEffect(() => {
        setTimeLeft(getTimeLeft());
        const timerId = setInterval(() => {
            const remaining = getTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerId);
                onTimeout();
            }
        }, 1000);
        return () => clearInterval(timerId)
    }, [onTimeout])

    const formatTime = (num) => (num < 10 ? "0" + num : num);

    const minutes = formatTime(Math.floor(timeLeft / 60));
    const seconds = formatTime(timeLeft % 60);

    return (
        <label className="code-page__code-info">{t("code_info_works")}{minutes}:{seconds}</label>
    )
}

export default TimerToCodeEnd