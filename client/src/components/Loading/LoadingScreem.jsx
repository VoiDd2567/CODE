import "./loadingScreen.css"

const LoadingScreen = () => {
    return (<div className="loadingScreen">
        <p>Loading</p>
        <p id="loadingDot1">.</p>
        <p id="loadingDot2">.</p>
        <p id="loadingDot3">.</p>
    </div>)
}
export default LoadingScreen;