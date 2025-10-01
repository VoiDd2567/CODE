import "./exerciseSettings.css"

const ExerciseSettings = ({ setOpenSettings }) => {
    return (<div className="exercise_settings-wrap">
        <div className="exercise_settings">
            <div className="cross-wrap"><div className="cross" onClick={() => setOpenSettings(false)}></div></div>
        </div>
    </div>)
};

export default ExerciseSettings;