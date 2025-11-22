import { useEffect, useRef, useState, useContext } from "react";
import Editor from "../../components/Editor/Editor"
import CompactCodeEditor from "../../components/CompactCodeEditor/CompactCodeEditor";
import "./blocks.css"
import setting_icon from "../../pictures/setting-icon.png"
import { UserContext } from "../../components/UserContext";
import correct from "../../pictures/complete-green.png";
import incorrect from "../../pictures/incomplete.png";

const TextBlock = ({ id, value, borders, setEditorValue }) => {
    const block = useRef(null)

    useEffect(() => {
        block.current.style.border = borders ? "1px solid black" : "none"
    }, [borders])

    const handleInput = () => {
        const newValue = block.current.value;

        setEditorValue(prev =>
            prev.map((item) => {
                const key = Object.keys(item)[0];
                if (key === id) {
                    return {
                        [key]: {
                            ...item[key],
                            value: newValue
                        }
                    };
                }
                return item;
            })
        );
    };

    return (
        <textarea ref={block}
            className="text_block block"
            onInput={handleInput}
            defaultValue={value}></textarea>
    );
};

const EditorBlock = ({ borders, startValue }) => {
    const block = useRef(null)
    const [value, setValue] = useState(startValue)

    useEffect(() => {
        block.current.style.border = borders ? "1px solid black" : "none"
    }, [borders])

    const getH = () => {
        return value.split("").filter(c => c === "\n").length + 1;
    }

    return (
        <div ref={block} className="editor_block-wrap block">
            <Editor w={"60"} h={getH() * 2.3} color={"white"} getValue={setValue} editorValue={value} description={"Python"} />
        </div>
    )
}

const ExerciseBlock = ({ borders, setOpenSettings, data }) => {
    const block = useRef(null)

    useEffect(() => {
        block.current.style.border = borders ? "1px solid black" : "none"
    }, [borders])

    return (<div ref={block} className="exercise_block-wrap block">
        <div className="exercise_block-settings">
            <img src={setting_icon} alt="Settings" onClick={() => setOpenSettings()} />
        </div>
        <CompactCodeEditor h={20} />
    </div>)
}

const ChooseBlock = ({ borders, id, setOpenSettings, data }) => {
    const block = useRef(null)
    const user = useContext(UserContext)
    const [lng, setLng] = useState(null)

    useEffect(() => {
        if (data?.description) {
            // Check if user's default language exists in description keys
            if (data.description[user.user.defaultLng]) {
                setLng(user.user.defaultLng)
            } else {
                // Fallback to first available language
                setLng(Object.keys(data.description)[0])
            }
        }
    }, [user, data])

    useEffect(() => {
        if (block.current) {
            block.current.style.border = borders ? "1px solid black" : "none"
        }
    }, [borders])

    return (
        <div ref={block} className="choose-block-wrap block">
            <div className="choose_block-settings">
                <img src={setting_icon} alt="Settings" onClick={() => setOpenSettings(prev => !prev)} />
            </div>
            <div key={id} className="choose">
                <div className="choose-question">
                    {lng && data?.description?.[lng] ? data.description[lng] : "No description"}
                </div>
                <div className="choose-option-area">
                    {data?.options && Object.entries(data.options).map(([optionId, optionData]) => (
                        <div className="choose-option-line">
                            <div key={`${optionId}-${optionData.option}`} className="choose-option">
                                {optionData.option}
                            </div>
                            <div className="choose-check"><img src={optionData.correct === true ? correct : incorrect} alt="" /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export { TextBlock, EditorBlock, ExerciseBlock, ChooseBlock };
