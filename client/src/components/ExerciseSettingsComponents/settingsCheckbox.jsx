const SettingsCheckbox = ({ label, checkBoxRef }) => {
    return (
        <div className="settingCheckbox">
            <input type="checkbox" ref={checkBoxRef} />
            <label>{label}</label>
        </div>
    )
}

export default SettingsCheckbox