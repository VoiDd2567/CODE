import "./console.css"
import { useTranslation } from "react-i18next";
import run_image from "../../pictures/run-btn.png"
import complete_image from "../../pictures/complete-btn.png"
import open_exercise_image from "../../pictures/open-exercise-btn.png"

const Console = ({ getExercise, setExerciseChoose, files, getExerciseList, exerciseOpened }) => {
    const { t } = useTranslation();

    const handleRunBtnClick = () => {
        fetch("https://localhost:3001/api/check-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ files: files })
        })
    }

    const handleExerciseOpenBtnClick = () => {
        getExerciseList();
        setExerciseChoose(true);
    }

    return (
        <div className="console-wrap">
            <div className="console__buttons-wrap">
                <button className="console__btn run-btn" onClick={handleRunBtnClick}><p>{t("run")}</p><img src={run_image} alt="" /></button>
                {exerciseOpened &&
                    <button className="console__btn send-btn"><p>{t("send")}</p><img src={complete_image} alt="" /></button>
                }
                <button className="console__btn open-exercise-btn" onClick={handleExerciseOpenBtnClick}><p>{t("open-exercise")}</p><img src={open_exercise_image} alt="" /></button>
            </div>
            <div className="console">
                <p className="console-content"></p>
            </div>
        </div>
    )
}

export default Console