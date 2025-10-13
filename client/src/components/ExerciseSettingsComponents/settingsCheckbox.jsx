const SettingsCheckbox = ({ label, checked, onChange, divClass = "" }) => {
    const handleClick = () => {
        onChange({ target: { checked: !checked } });
    };

    return (
        <div className={`settingCheckbox ${divClass}`} onClick={handleClick}>
            <input
                type="checkbox"
                checked={checked}
                readOnly
            />
            <label>{label}</label>
        </div>
    );
};

export default SettingsCheckbox;