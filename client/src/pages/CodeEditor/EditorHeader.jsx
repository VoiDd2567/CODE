import "./editorHeader.css";
import logo from "../../pictures/logo.png";
import { useState } from "react";
import { Navigate } from "react-router-dom";


function EditorHeader() {
    const [redirectHome, setRedirectHome] = useState(false);

    const returnHome = () => {
        setRedirectHome(true);
    }

    if (redirectHome) {
        return <Navigate to="/" replace />
    }
    return (
        <div className="code-editor-page__header">
            <img onClick={returnHome} src={logo} alt="Logo" />
        </div>
    );
}

export default EditorHeader;
