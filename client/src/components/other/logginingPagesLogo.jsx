import logo from "../../pictures/logo.png";

const LogginingPageLogo = () => {
    return (
        <div className="logining-page__logo" style={{ "marginTop": "10vh", "width": "25vw", "paddingBottom": "5vh" }}>
            <img src={logo} alt="Logo" style={{ "width": "100%" }} />
        </div>
    )
}

export default LogginingPageLogo;