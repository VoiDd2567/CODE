import "./input.css"

const SettingsSelect = ({ label, options, onChange }) => {
    return (
        <div className="settingsInput">
            <label>{label}</label>
            <select className="exerciseSelect" id="" onChange={onChange}>
                <option value="" selected disabled></option>
                {options.map((value) => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SettingsSelect;