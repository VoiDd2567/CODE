import { useState } from "react"
import AskWindow from "../../../components/AskWindow/AskWindow"
import client_config from "../../../client_config.json"
import { useTranslation } from "react-i18next"

const DeleteAccountWindow = ({ user }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [messageColor, setMessageColor] = useState("black")
    const [isAskOpen, setIsAskOpen] = useState(false)

    const handleDelete = async () => {
        if (!password.trim()) {
            setMessage("Please enter your password.")
            setMessageColor("red")
            return
        }

        setMessage("Deleting account...")
        setMessageColor("black")
        try {
            const res = await fetch(`${client_config.SERVER_IP}/api/auth/delete-account`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user?._id || user?.id,
                    email: user?.email,
                    password,
                }),
            })

            if (!res.ok) {
                console.log(res)
                setMessage("Failed to delete account. Check password and try again.")
                setMessageColor("red")
                return
            }

            setMessage("Account deleted.")
            setMessageColor("green")
            setTimeout(() => {
                window.location.href = "/"
            }, 600)
        } catch (error) {
            console.error("Delete account failed:", error)
            setMessage("Failed to delete account. Try again later.")
            setMessageColor("red")
        }
    }

    return (
        <div className="profile_page-window">
            <div className="profile_page-window-main">
                <label className="profile_page-window-main-label">{t("password")}</label>
                <input
                    type="password"
                    className="profile_page-window-main-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("enter_password")}
                />
                <div className="profile_page-window-reset_password">
                    <button
                        className="change_password_btn"
                        style={{ backgroundColor: "#c03838", color: "white" }}
                        onClick={() => setIsAskOpen(true)}
                    >
                        {t("del_account")}
                    </button>
                    <div className="profile_page-window-reset_password-message" style={{ color: messageColor }}>
                        {message}
                    </div>
                </div>
                <AskWindow
                    question={t("del_account_q")}
                    func={handleDelete}
                    open={isAskOpen}
                    setOpen={setIsAskOpen}
                />
            </div>
        </div>
    )
}

export default DeleteAccountWindow
