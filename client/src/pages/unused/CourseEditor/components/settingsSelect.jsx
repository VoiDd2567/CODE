const SettingsSelect = ({ label, options, onChange, value, noDefault = true }) => {
    return (
        <div className="settingsInput">
            <label>{label}</label>
            <select
                className="exerciseSelect"
                value={value ?? ""}
                onChange={onChange}
            >
                {noDefault && !value && <option value="" disabled></option>}
                {options.map((value) => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </select>
        </div>
    );
};


export default SettingsSelect;