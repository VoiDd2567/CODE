import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import arrow_r from "../../../pictures/arrow-r.png"
import deleteImg from "../../../pictures/delete.png";
import deleteRedImg from "../../../pictures/delete-red.png";

const AutocheckValues = ({ inputAmount, setInputs, func = false, startInput }) => {
    const { t } = useTranslation()

    const [paires, setPairs] = useState(startInput)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        console.log(startInput)
    }, [startInput])

    useEffect(() => {
        if (!isInitialized && startInput && startInput.length > 0) {
            setPairs(startInput);
            setIsInitialized(true);
        }
    }, [startInput, isInitialized])

    useEffect(() => {
        setPairs(prev =>
            prev.map(pair => ({
                ...pair,
                input: normalizeInput(pair.input)
            }))
        );
    }, [inputAmount])

    useEffect(() => {
        if (paires.length <= 0) {
            const inputArr = Array(inputAmount).fill("")
            setPairs([{ input: inputArr, output: "" }])
        }
    }, [inputAmount])

    const normalizeInput = (arr) => [
        ...arr.slice(0, inputAmount),
        ...Array(Math.max(0, inputAmount - arr.length)).fill("")
    ];

    const updatePairInput = (pairIdx, inputIdx, value) => {
        const newPairs = paires.map((pair, index) =>
            index === pairIdx
                ? {
                    ...pair,
                    input: pair.input.map((inp, idx) =>
                        idx === inputIdx ? value : inp
                    )
                }
                : pair
        );
        setPairs(newPairs);
        setInputs(newPairs);
    };

    const updatePairOutput = (pairIdx, value) => {
        const newPairs = paires.map((pair, index) =>
            index === pairIdx
                ? { ...pair, output: value }
                : pair
        );
        setPairs(newPairs);
        setInputs(newPairs);
    };

    const handleAddClick = () => {
        const newInput = Array(inputAmount).fill("");
        const newPairs = [...paires, { input: newInput, output: "" }];
        setPairs(newPairs);
        setInputs(newPairs);
    };

    const deleteItem = (idx) => {
        const newPairs = paires.filter((_, index) => index !== idx);
        setPairs(newPairs);
        setInputs(newPairs);
    };

    return (
        <div>
            <div className="exercise_editor_page-form-item">
                <button className="autocheck_values-menu-add_btn" onClick={handleAddClick}>{t('add_pair')}</button>
                <div className="autocheck_values-menu-pairs">
                    {paires.map(({ input, output }, index) => (
                        <div key={index} className="autocheck_values-menu-pair-wrap">
                            <div className="autocheck_values-menu-pair">
                                <div className="autocheck_values-menu-pair-item">
                                    {input.map((inputOne, idx) => (
                                        <div key={idx} className="autocheck_values-menu-pair-item-input">
                                            <div className="autocheck_values-menu-pair-label">{func ? t("param") : t("input")} {idx + 1}</div>
                                            <textarea
                                                className="autocheck_values-menu-pair-textarea"
                                                onChange={e => updatePairInput(index, idx, e.target.value)}
                                                value={inputOne}
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>
                                <div className="autocheck_values-menu-pair-arrow"><img src={arrow_r} alt="Arrow" /></div>
                                <div className="autocheck_values-menu-pair-item">
                                    <div className="autocheck_values-menu-pair-label">{t("output")}</div>
                                    <textarea
                                        className="autocheck_values-menu-pair-textarea"
                                        onChange={e => updatePairOutput(index, e.target.value)}
                                        value={output}
                                    ></textarea>
                                </div>
                                <div className="autocheck_values-menu-pair-del" onClick={() => deleteItem(index)} style={{ backgroundImage: `url(${deleteImg})` }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundImage = `url(${deleteRedImg})`}
                                    onMouseLeave={e => e.currentTarget.style.backgroundImage = `url(${deleteImg})`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AutocheckValues;