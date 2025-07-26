import { useState } from "react";
import eyeOpen from "../../pictures/eye_open.png"
import eyeClosed from "../../pictures/eye_closed.png"
import "./passwordInput.css"

const PasswordInput = ({ password, pholder }) => {
    const [passwordVisible, setPasswordVisibility] = useState(false)

    const changePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisible);
    }

    return (
        <div className="input-wrap">
            <input type={passwordVisible ? "text" : "password"} ref={password} name="password" className="input-password" placeholder={pholder} required />
            <div className="input-eye" id="passwordEye"><img src={passwordVisible ? eyeOpen : eyeClosed} alt="Toggle visibility" onClick={changePasswordVisibility} /></div>
        </div>
    )
}

export default PasswordInput
