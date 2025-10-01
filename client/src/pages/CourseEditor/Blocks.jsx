import { useEffect, useRef, useState } from "react";
import Editor from "../../components/Editor/Editor"
import CompactCodeEditor from "../../components/CompactCodeEditor/CompactCodeEditor";
import ExerciseSettings from "./ExerciseSettings";
import "./blocks.css"
import setting_icon from "../../pictures/setting-icon.png"

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

const EditorBlock = ({ borders }) => {
    const block = useRef(null)
    const [value, setValue] = useState("asdasd")

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

const ExerciseBlock = () => {
    const [openSettings, setOpenSettings] = useState(false)

    return (<div className="exercise_block-wrap block">
        <div className="exercise_block-settings">
            <img src={setting_icon} alt="Settings" onClick={() => setOpenSettings(prev => !prev)} />
        </div>
        <CompactCodeEditor h={20} />
        {openSettings && (<ExerciseSettings setOpenSettings={setOpenSettings} />)}
    </div>)
}

export { TextBlock, EditorBlock, ExerciseBlock };
