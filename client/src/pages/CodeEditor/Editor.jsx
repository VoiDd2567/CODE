import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./editor.css"

const Editor = ({ setEditorValue, chosenFileValue, editor, mini, saveData, setFileSaved }) => {
    const { t } = useTranslation();
    const [numbersTextareaValue, setNumbersTextareaValue] = useState("");
    const numbersTa = useRef(null);
    const isSyncing = useRef(false);
    const [previousText, setPreviousText] = useState("");

    useEffect(() => {
        editor.current.value = chosenFileValue;
        setPreviousText(chosenFileValue);
        setNumbers();
    }, [chosenFileValue, editor]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveData(previousText)
        }, 2000);

        return () => clearTimeout(timeout);
    }, [previousText, saveData]);

    const syncScroll = (source, target) => {
        if (target.current) {
            target.current.scrollTop = source.current.scrollTop;
        }
    };

    const textareaPress = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();

            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const value = textarea.value;

            textarea.value = value.substring(0, start) + "\t" + value.substring(end)
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    }

    const setNumbers = () => {
        const stringCount = [...editor.current.value].filter(c => c === "\n").length;
        let textareaNewValue = ""
        for (let i = 0; stringCount >= i; i++) {
            textareaNewValue += `${i + 1}\n`
        }
        setNumbersTextareaValue(textareaNewValue);
        syncScroll(editor, numbersTa);
    }

    const handleScroll = () => {
        if (isSyncing.current) return;

        isSyncing.current = true;
        numbersTa.current.scrollTop = editor.current.scrollTop;
        setTimeout(() => {
            isSyncing.current = false;
        }, 0);
    }

    const handleChange = () => {
        const eValue = editor.current.value
        if (!eValue) return;
        if (eValue.length > previousText.length) {
            if (eValue.length > 10000) {
                editor.current.value = previousText;
                alert(t("too_many_characters_editor"))
            }
        }
        const stringCount = [...eValue].filter(c => c === "\n").length;
        if (stringCount > 998) {
            editor.current.value = previousText;
            alert(t("too_many_strings_editor"))
        }

        setFileSaved(false);
        setPreviousText(editor.current.value)
        setEditorValue(editor.current.value)
        setNumbers();
    };

    return (
        <div className={`editor-wrap ${mini ? "opened" : ""}`}>
            <textarea ref={numbersTa} className="editor__string-numbers" defaultValue={numbersTextareaValue}></textarea>
            <textarea ref={editor} onScroll={handleScroll} onChange={handleChange} onKeyDown={(e) => textareaPress(e)} type="text" className="editor" />
        </div>
    )
}

export default Editor