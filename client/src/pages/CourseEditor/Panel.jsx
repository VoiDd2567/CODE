const Panel = ({ setBorders }) => {
    return (<div className="left_panel-wrap">
        <div className="left_panel">
            <div className="panel-options">
                <div className="panel-option">
                    <label>Show block border</label>
                    <input type="checkbox" onChange={() => setBorders(false)} />
                </div>
                <div className="panel-option">
                    <label>Student view</label>
                    <input type="checkbox" />
                </div>
            </div>
        </div>
    </div>)
}

export default Panel;