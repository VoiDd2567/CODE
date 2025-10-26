import deleteImg from "../../../pictures/delete.png";
import deleteRedImg from "../../../pictures/delete-red.png";
import complete from "../../../pictures/complete-green.png";
import incomplete from "../../../pictures/incomplete.png";
import plus from "../../../pictures/plus.png";
import { useState, useEffect } from "react";

const SelectChoice = ({ setOutOptions, givenOptions = null }) => {
    const [options, setOptions] = useState({
        1: { option: "blablabal", correct: true },
        2: { option: "asdasdasd", correct: false },
    });

    useEffect(() => {
        if (givenOptions) setOptions(givenOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOptionChange = (id, newOption) => {
        setOptions((prev) => {
            const updated = {
                ...prev,
                [id]: { ...prev[id], option: newOption },
            };
            setOutOptions(updated);
            return updated;
        });
    };

    const handleCorrectChange = (id, correct) => {
        setOptions((prev) => {
            const updated = {
                ...prev,
                [id]: { ...prev[id], correct },
            };
            setOutOptions(updated);
            return updated;
        });
    };

    const handleDeleteOption = (id) => {
        setOptions((prev) => {
            const updated = { ...prev };
            delete updated[id];
            setOutOptions(updated);
            return updated;
        });
    };

    const handleAddOption = (afterId) => {
        setOptions((prev) => {
            const entries = Object.entries(prev);
            const newId = Math.max(...Object.keys(prev).map(Number)) + 1;
            const newOption = { option: "New option", correct: false };

            const newEntries = [];
            for (const [id, data] of entries) {
                newEntries.push([id, data]);
                if (Number(id) === Number(afterId)) {
                    newEntries.push([newId.toString(), newOption]);
                }
            }

            const updated = Object.fromEntries(newEntries);
            setOutOptions(updated);
            return updated;
        });
    };

    return (
        <div className="select-choice-wrap">
            <div className="label-line">
                <label>Options</label>
            </div>
            <div className="select-choice">
                {Object.entries(options).map(([id, { option, correct }]) => (
                    <div className="select-option-block" key={id}>
                        <div className="select-option-line">
                            <p
                                className="select-option"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) =>
                                    handleOptionChange(id, e.currentTarget.textContent)
                                }
                            >
                                {option}
                            </p>
                            <div className="select-option-correct-wrap" onMouseDown={(e) => e.preventDefault()} onClick={() => handleCorrectChange(id, !correct)}>
                                <img src={correct ? complete : incomplete} alt="Correct" />
                            </div>
                            <div className="select-option-del" style={{ backgroundImage: `url(${deleteImg})` }} onClick={() => handleDeleteOption(id)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundImage = `url(${deleteRedImg})`)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundImage = `url(${deleteImg})`)}></div>
                            <div className="select-option-add" style={{ backgroundImage: `url(${plus})` }} onClick={() => handleAddOption(id)}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectChoice;
