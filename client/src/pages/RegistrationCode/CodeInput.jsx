import { useState, useRef } from "react";

const CodeInput = ({ length = 6, onComplete, codeInput }) => {
    const [values, setValues] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    const applyDigits = (digits, startIdx) => {
        if (!digits) return;
        const newValues = [...values];
        let i = startIdx;
        for (let d = 0; d < digits.length && i < length; d += 1, i += 1) {
            newValues[i] = digits[d];
        }
        setValues(newValues);

        const nextIdx = Math.min(startIdx + digits.length, length - 1);
        inputsRef.current[nextIdx]?.focus();

        if (newValues.every(v => v !== "") && onComplete) {
            onComplete(newValues.join(""));
        }
    };

    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, "");
        applyDigits(val, idx);
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace") {
            if (idx > 0) {
                if (values[idx] === "") {
                    inputsRef.current[idx - 1].focus();
                }
            }
            const newValues = [...values];
            newValues[idx] = "";
            setValues(newValues);
        }
        if (e.key === "Delete") {
            if (idx < length) {
                const newValues = [...values];
                for (let i = idx; i < length - 1; i++) {
                    newValues[i] = values[i + 1];
                }
                newValues[length - 1] = "";
                setValues(newValues);
            }
        }
        if (e.key === "ArrowRight") {
            if (idx < length - 1) {
                inputsRef.current[idx + 1].focus();
            }
        }
        if (e.key === "ArrowLeft") {
            if (idx > 0) {
                inputsRef.current[idx - 1].focus();
            }
        }
    };

    const handlePaste = (e, idx) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
        applyDigits(pasted, idx);
    };

    return (
        <div ref={codeInput} className="code-page__input-wrap">
            {values.map((val, idx) => (
                <input
                    key={idx}
                    ref={el => (inputsRef.current[idx] = el)}
                    value={val}
                    maxLength={1}
                    onChange={e => handleChange(e, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onPaste={e => handlePaste(e, idx)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
            ))}
        </div>
    );
};

export default CodeInput;
