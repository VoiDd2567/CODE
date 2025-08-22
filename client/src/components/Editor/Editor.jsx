import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./editor.css"

const Editor = ({ w, h, editorValue, setEditorValue = null, saveData = null, setFileSaved = null, canBeChanged = true, main = false }) => {
    const { t } = useTranslation();
    const [numbersTextareaValue, setNumbersTextareaValue] = useState("");
    const editorWrap = useRef(null);
    const editor = useRef(null);
    const numbersTa = useRef(null);
    const isSyncing = useRef(false);
    const [previousText, setPreviousText] = useState("");


    useEffect(() => {
        editorWrap.current.style.width = `${w < 10 ? 10 : w}vw`
        editorWrap.current.style.height = `${h < 3.7 ? 3.7 : h}vh`
        editorWrap.current.style.borderRadius = main ? "2.5vh" : "1vh";
        editor.current.style.fontSize = main ? "1vw" : "1.5vh";
        numbersTa.current.style.fontSize = main ? "1vw" : "1.5vh";
        editor.current.style.paddingTop = main ? "2vh" : "1vh";
        numbersTa.current.style.paddingTop = main ? "2vh" : "1vh";
        numbersTa.current.style.width = main ? "2.5vw" : "10%";
    }, [w, h, main])

    useEffect(() => {
        editor.current.value = editorValue;
        setPreviousText(editorValue);
        setNumbers();
    }, [editorValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (saveData) {
                saveData(previousText)
            }
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
        handleChange();
    }

    const setNumbers = () => {
        const stringCount = [...editor.current.value].filter(c => c === "\n").length;
        let textareaNewValue = "1\n";
        for (let i = 1; stringCount + 1 > i; i++) {
            textareaNewValue += `${i + 1}\n`;
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

        setNumbers();

        if (!eValue) return;
        if (previousText) {
            if (eValue.length > previousText.length) {
                if (eValue.length > 10000) {
                    editor.current.value = previousText;
                    alert(t("too_many_characters_editor"))
                }
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
    };

    return (
        <div ref={editorWrap} className="editor-wrap">
            <textarea ref={numbersTa} className="editor__string-numbers" defaultValue={numbersTextareaValue}></textarea>
            <textarea ref={editor} onScroll={handleScroll} onChange={handleChange} onKeyDown={(e) => textareaPress(e)} readOnly={!canBeChanged} type="text" className="editor" defaultValue={editorValue} />
        </div>
    )
}

export default Editor