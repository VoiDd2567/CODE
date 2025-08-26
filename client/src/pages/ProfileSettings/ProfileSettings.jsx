import "./profileSettings.css"
import "./profile_windows/windowStyle.css"
import ProfileHeader from "./other/ProfileHeader"
import CategoryChoose from "./other/CategoryChoose"
import GeneralWindow from "./profile_windows/GeneralWindow"
import ClassWindow from "./profile_windows/ClassWindow"
import SecurityWindow from "./profile_windows/SecurityWindow"
import PaymentSettingsWindow from "./profile_windows/PaymentSettingsWindow"
import DelAccountWindow from "./profile_windows/DelAccountWindow"
import { useState, useEffect } from "react"

const ProfileSettings = () => {

    const [openedWindow, setOpenedWindow] = useState("general");
    const [openedWindowDiv, setOpenedWindowDiv] = useState(<GeneralWindow />)
    const [user, setUser] = useState(null)

    useEffect(() => {
        fetch("https://localhost:3001/api/user/user", {
            method: "GET",
            credentials: "include"
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text;
                alert(errorData)
                console.log(errorData)
            } else {
                const data = await res.json();
                setUser(data["user"])
            }
        })
    }, [])

    useEffect(() => {
        const all_windows = {
            "general": <GeneralWindow user={user} />,
            "class": <ClassWindow />,
            "security": <SecurityWindow />,
            "payment": <PaymentSettingsWindow />,
            "delAccount": <DelAccountWindow />
        }
        setOpenedWindowDiv(all_windows[openedWindow])
    }, [openedWindow, user])

    return (
        <div>
            <ProfileHeader />
            <div className="profile_page-main">
                <CategoryChoose setOpenedWindow={setOpenedWindow} />
                {openedWindowDiv}
            </div>
        </div>)
}

export default ProfileSettings;