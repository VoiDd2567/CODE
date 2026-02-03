import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react";

import deleteImg from "../../../pictures/delete.png";
import deleteRedImg from "../../../pictures/delete-red.png";

//{ id: 1, inputs: [1, 2, 3, "asd"], params: null, file: { filename: "a.txt", value: "123" } }
const TestCase = ({ testCase, addCase, exType, delTestCase }) => {
    const { t } = useTranslation()

    const [editingInputId, setEditingInputId] = useState(null);
    const [editingInputValue, setEditingInputValue] = useState('');
    const [localFileValue, setLocalFileValue] = useState('');
    const textareaRef = useRef(null);
    const fileValueRef = useRef(null);
    const isUserEditingRef = useRef(false);

    const updateCase = (item, value) => {
        let n = { ...testCase }
        n[item] = value
        addCase(n)
    }

    const handleInputClick = (testCaseId, inputIndex, currentValue) => {
        setEditingInputId(`${testCaseId}-${inputIndex}`);
        setEditingInputValue(String(currentValue));
    };

    const handleInputBlur = (testCaseId, inputIndex) => {
        const newInputs = [...testCase.inputs];
        newInputs[inputIndex] = editingInputValue;
        updateCase("inputs", newInputs);
        setEditingInputId(null);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Escape') {
            setEditingInputId(null);
        }
    };

    const handleAddInput = () => {
        const newInputs = [...(testCase.inputs || []), ""];
        updateCase("inputs", newInputs);
    }

    const handleDeleteInput = (inputIndex) => {
        const newInputs = testCase.inputs.filter((_, index) => index !== inputIndex);
        updateCase("inputs", newInputs);
    }

    const updateFile = (name = null, value = null) => {
        const newFile = { filename: name ? name : testCase.file.filename, value: value ? value : testCase.file.value }
        updateCase("file", newFile);
    }

    const handleFileValueChange = (e) => {
        const newValue = e.target.value;
        isUserEditingRef.current = true;
        setLocalFileValue(newValue);
        updateFile(null, newValue);
        // Use requestAnimationFrame to resize after React updates the DOM
        requestAnimationFrame(() => {
            if (fileValueRef.current) {
                fileValueRef.current.style.height = 'auto';
                fileValueRef.current.style.height = fileValueRef.current.scrollHeight + 'px';
            }
            isUserEditingRef.current = false;
        });
    }

    const handleFileValueFocus = () => {
        isUserEditingRef.current = true;
    }

    const handleFileValueBlur = () => {
        isUserEditingRef.current = false;
    }

    useEffect(() => {
        if (testCase.file && !isUserEditingRef.current) {
            setLocalFileValue(testCase.file.value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testCase.file?.value]);

    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;

            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = window.getComputedStyle(textarea).font;
            const lines = textarea.value.split('\n');
            const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
            const calculatedWidth = Math.max(maxWidth + 30, 100);
            const maxAllowedWidth = window.innerWidth * 0.4;
            textarea.style.width = Math.min(calculatedWidth, maxAllowedWidth) + 'px';
        }
    }, [editingInputId, editingInputValue]);

    useEffect(() => {
        if (fileValueRef.current) {
            fileValueRef.current.style.height = 'auto';
            fileValueRef.current.style.height = fileValueRef.current.scrollHeight + 'px';
        }
    }, [localFileValue]);

    return (
        <div className="testCase-wrap">
            <div className="testCase">
                <div className="testCase-line">
                    <div className="testCase-header">{t("testcase")} #{testCase.id}</div>
                    <div className="testCase-infoLine">
                        <div className="testCase-items">
                            <div className="testCase-item">
                                <input type="checkbox" className="testCase-checkbox" checked={testCase.inputs} onChange={(e) => updateCase("inputs", e.target.checked ? [] : null)}></input>
                                <label>{t("inputs")}</label>
                            </div>
                            <div className="testCase-item">
                                <input type="checkbox" className="testCase-checkbox" checked={testCase.file} onChange={(e) => updateCase("file", e.target.checked ? { filename: "a.txt", value: "" } : null)}></input>
                                <label>{t("file")}</label>
                            </div>
                        </div>
                        <div className="testCase-delete-btn" onClick={() => delTestCase(testCase.id)} style={{ backgroundImage: `url(${deleteImg})` }}
                            onMouseEnter={e => e.currentTarget.style.backgroundImage = `url(${deleteRedImg})`}
                            onMouseLeave={e => e.currentTarget.style.backgroundImage = `url(${deleteImg})`}></div>
                    </div>
                </div>
                {testCase.inputs && (() => {
                    const numRows = Math.ceil(testCase.inputs.length / 4);
                    const rows = [];

                    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                        rows.push(
                            <div className="testCase-inputs-row" key={rowIndex}>
                                {testCase.inputs.slice(rowIndex * 4, (rowIndex + 1) * 4).map((input, index) => {
                                    const globalIndex = index + 4 * rowIndex;
                                    return (
                                        <div className="testCase-input-wrap" key={index}>
                                            <div className="testCase-input-line">
                                                <div className="testCase-input-header">{t("input")} {globalIndex + 1}</div>
                                                <div className="testCase-input-del" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteInput(globalIndex);
                                                }}>
                                                    <img src={deleteRedImg} alt="" />
                                                </div>
                                            </div>
                                            {editingInputId === `${testCase.id}-${globalIndex}` ? (
                                                <textarea
                                                    ref={textareaRef}
                                                    className="testCase-input-edit"
                                                    value={editingInputValue}
                                                    onChange={(e) => setEditingInputValue(e.target.value)}
                                                    onBlur={() => handleInputBlur(testCase.id, globalIndex)}
                                                    onKeyDown={(e) => handleInputKeyDown(e)}
                                                    autoFocus
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';

                                                        const canvas = document.createElement('canvas');
                                                        const context = canvas.getContext('2d');
                                                        context.font = window.getComputedStyle(e.target).font;
                                                        const lines = e.target.value.split('\n');
                                                        const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
                                                        const calculatedWidth = Math.max(maxWidth + 30, 100);
                                                        const maxAllowedWidth = window.innerWidth * 0.4;
                                                        e.target.style.width = Math.min(calculatedWidth, maxAllowedWidth) + 'px';
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="testCase-input"
                                                    onClick={() => handleInputClick(testCase.id, globalIndex, input)}
                                                >
                                                    {String(input).split('\n').map((line, i) => (
                                                        <div key={i}>{line || '\u00A0'}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }

                    return (
                        <div className="testCase-inputs-wrap">
                            <button className="textCase-inputs-btn" onClick={handleAddInput}>{t("add_input")}</button>
                            <div className="testCase-inputs">
                                {rows}
                            </div>
                        </div>
                    );
                })()}
                {testCase.file && (
                    <div className="testCase-file-wrap">
                        <div className="testCase-file">
                            <label>{t("filename")}</label>
                            <input className="testCase-file-name" value={testCase.file.filename} onChange={(e) => updateFile(e.target.value)}></input>
                            <label>{t("file_value")}</label>
                            <textarea
                                ref={fileValueRef}
                                className="testCase-file-value"
                                value={localFileValue}
                                onChange={handleFileValueChange}
                                onFocus={handleFileValueFocus}
                                onBlur={handleFileValueBlur}
                            ></textarea>
                        </div>
                    </div>
                )}
                {exType === "funcCheck" && (
                    <div className="testCase-params">
                        <div className="testCase-params-header">{t("func_params")}</div>
                        <input className="testCase-params-input" value={testCase.params ? testCase.params : ""} onChange={(e) => updateCase("params", e.target.value)} />
                    </div>
                )}
            </div>
        </div >
    )
}

export default TestCase