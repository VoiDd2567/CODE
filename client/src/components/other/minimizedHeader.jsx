import { useState } from "react";
import { Navigate } from "react-router-dom";
import logo from "../../pictures/logo.png";

const MinimizedHeader = () => {
    const [redirectHome, setRedirectHome] = useState(false);

    const returnHome = () => {
        setRedirectHome(true);
    }

    if (redirectHome) {
        return <Navigate to="/" replace />
    }
    return (
        <div className="minimized-header" style={{ "height": "9vh", "backgroundColor": "#222831", "display": "flex", "alignItems": "center" }}>
            <img onClick={returnHome} src={logo} alt="Logo" style={{ "width": "10vw", "marginLeft": "2vw", "cursor": "pointer" }} />
        </div>
    );
}

export default MinimizedHeader;