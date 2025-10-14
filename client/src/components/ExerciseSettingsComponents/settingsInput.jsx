import "./input.css"

const SettingsInput = ({ label, inputRef, inputType = "text", width = null, enterAllowed = false, onChange = "", value = "" }) => {
    const handleKeyDown = (e) => {
        if (!enterAllowed) {
            if (e.key === "Enter") {
                e.preventDefault();
                return;
            }
        }
    }

    return (
        <div className="settingsInput" style={{ "width": width ? width : "auto" }}>
            {label && (<label>{label}</label>)}
            <textarea ref={inputRef} type={inputType} onKeyDown={handleKeyDown} defaultValue={value} onChange={(e) => onChange(e)} />
        </div>
    )
}

export default SettingsInput;