import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./editor.css"
import python_icon from "../../pictures/py-icon.png"
import js_icon from "../../pictures/js-icon.png"

const Editor = ({
    w = null,
    h = null,
    editorValue = "",
    setEditorValue = null,
    saveData = null,
    setFileSaved = null,
    canBeChanged = true,
    main = false,
    color = "#a9aaad",
    getValue = null,
    description = null,
    icon = "py",
    fixedHeight = true,
    lineHeight = 2.5 }) => {

    const { t } = useTranslation();
    const [numbersTextareaValue, setNumbersTextareaValue] = useState("");
    const editorWrap = useRef(null);
    const editor = useRef(null);
    const numbersTa = useRef(null);
    const isSyncing = useRef(false);
    const [previousText, setPreviousText] = useState("");
    const [dicon, setdIcon] = useState(python_icon);

    useEffect(() => {
        editorWrap.current.style.width = w ? `${w < 10 ? 10 : w}vw` : "auto"

        if (fixedHeight) {
            editorWrap.current.style.height = h ? `${h < 3.7 ? 3.7 : h}vh` : "auto"
        } else {
            updateDynamicHeight();
        }

        editorWrap.current.style.borderRadius = main ? "2.5vh" : "1vh";
        editor.current.style.fontSize = main ? "1vw" : "1.5vh";
        numbersTa.current.style.fontSize = main ? "1vw" : "1.5vh";
        editor.current.style.paddingTop = main ? "2vh" : "1vh";
        numbersTa.current.style.paddingTop = main ? "2vh" : "1vh";
        numbersTa.current.style.width = main ? "2.5vw" : "10%";
        editor.current.style.backgroundColor = color;
        numbersTa.current.style.backgroundColor = color;
        editorWrap.current.style.backgroundColor = color;

        if (!fixedHeight) {
            editor.current.style.overflow = "hidden";
            numbersTa.current.style.overflow = "hidden";
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [w, h, main, color, fixedHeight])

    useEffect(() => {
        if (description) {
            addDescription();
        }
    }, [description])

    useEffect(() => {
        if (icon === "py") {
            setdIcon(python_icon)
        } else if (icon === "js") {
            setdIcon(js_icon);
        }
    }, [icon])

    useEffect(() => {
        editor.current.value = editorValue;
        setPreviousText(editorValue);
        setNumbers();
        if (!fixedHeight) {
            updateDynamicHeight();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (saveData) {
                saveData(previousText)
            }
        }, 2000);

        return () => clearTimeout(timeout);
    }, [previousText, saveData]);

    const updateDynamicHeight = () => {
        if (fixedHeight || !editor.current) return;

        const lineCount = (editor.current.value.match(/\n/g) || []).length + 1;
        const calculatedHeight = lineCount * lineHeight;
        const minHeight = 3.7;
        const finalHeight = Math.max(calculatedHeight, minHeight);

        editorWrap.current.style.height = `${finalHeight}vh`;
        editor.current.style.height = "100%";
        numbersTa.current.style.height = "100%";
    };

    const syncScroll = (source, target) => {
        if (target.current) {
            target.current.scrollTop = source.current.scrollTop;
        }
    };


    const getIndentation = (line) => {
        const match = line.match(/^(\s*)/);
        return match ? match[1] : '';
    };

    const shouldIndent = (line) => {
        const trimmed = line.trim();
        if (icon === 'py') {
            return trimmed.endsWith(':');
        } else if (icon === 'js') {
            return trimmed.endsWith('{') || trimmed.endsWith(':');
        }
        return false;
    };

    const textareaPress = (e) => {
        const textarea = e.target;

        if (e.key === "Tab") {
            e.preventDefault();

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            textarea.value = value.substring(0, start) + "\t" + value.substring(end)
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            handleChange();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();

            const start = textarea.selectionStart;
            const value = textarea.value;

            const beforeCursor = value.substring(0, start);
            const lines = beforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];

            const currentIndent = getIndentation(currentLine);
            const needsExtraIndent = shouldIndent(currentLine);
            const newIndent = needsExtraIndent ? currentIndent + '\t' : currentIndent;

            const afterCursor = value.substring(start);
            const newValue = beforeCursor + '\n' + newIndent + afterCursor;

            textarea.value = newValue;
            const newCursorPos = start + 1 + newIndent.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);

            handleChange();
            return;
        }
    }

    const setNumbers = () => {
        const stringCount = [...editor.current.value].filter(c => c === "\n").length;
        let textareaNewValue = "1\n";
        for (let i = 1; stringCount + 1 > i; i++) {
            textareaNewValue += `${i + 1}\n`;
        }
        setNumbersTextareaValue(textareaNewValue);
        if (fixedHeight) {
            syncScroll(editor, numbersTa);
        }
    }

    const handleScroll = () => {
        if (isSyncing.current || !fixedHeight) return;

        isSyncing.current = true;
        numbersTa.current.scrollTop = editor.current.scrollTop;
        setTimeout(() => {
            isSyncing.current = false;
        }, 0);

    }

    const handleChange = () => {
        const eValue = editor.current.value

        setNumbers();

        if (!fixedHeight) {
            updateDynamicHeight();
        }

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
        if (setFileSaved) {
            setFileSaved(false);
            setPreviousText(editor.current.value)
            setEditorValue(editor.current.value)
        }
        if (getValue) {
            getValue(editor.current.value)
        }

    };

    const addDescription = () => {
        editorWrap.current.style.borderTopRightRadius = "0vh";
        editorWrap.current.style.borderTopLeftRadius = "0vh"
    }

    return (
        <div style={{ position: 'relative' }}>
            {description && (<div>
                <div className="editor-description">
                    <img src={dicon} alt="icon" /><p>{description}</p>
                </div>
            </div>)}
            <div ref={editorWrap} className="editor-wrap">
                <textarea ref={numbersTa} className="editor__string-numbers" defaultValue={numbersTextareaValue}></textarea>
                <textarea
                    ref={editor}
                    onScroll={handleScroll}
                    onChange={handleChange}
                    onKeyDown={(e) => textareaPress(e)}
                    readOnly={!canBeChanged}
                    type="text"
                    className="editor"
                    defaultValue={editorValue}
                />
            </div>
        </div>
    )
}

export default Editor