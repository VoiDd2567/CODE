import { useTranslation } from "react-i18next"

const TeacherStudentChoose = ({ setRole }) => {
    const { t } = useTranslation();

    return (
        <div className="registartion-page__radio-wrap">
            <label className="registration-page__choise-question">{t("role_choice")}</label>
            <div className="registration-page__radio-group">
                <label className="registration-page__radio-label">
                    <input className="registration-page__radio-btn" type="radio" name="role" value="student" onChange={() => setRole("student")} required />
                    {t("student")}
                </label>
                <label className="registration-page__radio-label">
                    <input type="radio" name="role" value="teacher" onChange={() => setRole("teacher")} required />
                    {t("teacher")}
                </label>
            </div>
        </div>
    )
}

export default TeacherStudentChoose