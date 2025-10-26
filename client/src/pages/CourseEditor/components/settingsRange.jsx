const SettingsRange = ({ label, inputRef, width = null, onChange = () => { } }) => {
    return (
        <div className="settingsRange" style={{ "width": width ? width : "auto" }}>
            <input className="inputRange" type="number" ref={inputRef} max="100" min="0" defaultValue={"100"} onChange={(e) => onChange(e)} />
            {label && (<label className="rangeLabel">{label}</label>)}
        </div>
    )
}

export default SettingsRange;