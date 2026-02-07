const Panel = ({ setBorders, setStudentView, setLng }) => {
    return (<div className="left_panel-wrap">
        <div className="left_panel">
            <div className="panel-options">
                <div className="panel-option">
                    <p>Show block border</p>
                    <input type="checkbox" onChange={() => setBorders()} />
                </div>
                <div className="panel-option">
                    <p>Student view</p>
                    <input type="checkbox" onChange={() => setStudentView()} />
                </div>
                <div className="panel-option">
                    <p>Est/Eng</p>
                    <input type="checkbox" onChange={() => setLng()} />
                </div>
            </div>
        </div>
    </div>)
}

export default Panel;