const Panel = ({ setBorders }) => {
    return (<div className="left_panel-wrap">
        <div className="left_panel">
            <div className="panel-options">
                <div className="panel-option">
                    <p>Show block border</p>
                    <input type="checkbox" onChange={() => setBorders(false)} />
                </div>
                <div className="panel-option">
                    <p>Student view</p>
                    <input type="checkbox" />
                </div>
            </div>
        </div>
    </div>)
}

export default Panel;