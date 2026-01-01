import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import arrow_r from "../../../pictures/arrow-r.png"
import deleteImg from "../../../pictures/delete.png";
import deleteRedImg from "../../../pictures/delete-red.png";

const AutocheckValues = ({ inputAmount = 2, setInputs, func = false }) => {
    const { t } = useTranslation()

    const [paires, setPairs] = useState([{ input: [], output: "" }])

    useEffect(() => {
        setPairs(prev =>
            prev.map(pair => ({
                ...pair,
                input: normalizeInput(pair.input)
            }))
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputAmount])

    useEffect(() => {
        if (paires.length <= 0) {
            const inputArr = Array(inputAmount).fill("")
            setPairs([{ input: inputArr, output: "" }])
        }
        setInputs(paires)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paires, inputAmount])

    const normalizeInput = (arr) => [
        ...arr.slice(0, inputAmount),
        ...Array(Math.max(0, inputAmount - arr.length)).fill("")
    ];

    const handleAddClick = () => {
        let newInput = []
        for (let i = 0; i < inputAmount; i += 1) {
            newInput.push("")
        }
        setPairs(prev => [
            ...prev,
            { input: newInput, output: "" }
        ]);
    };

    const deleteItem = (idx) => {
        setPairs(prev => prev.filter((_, index) => index !== idx));
    };

    const updatePairInput = (pairIdx, inputIdx, value) => {
        setPairs(prev =>
            prev.map((pair, index) =>
                index === pairIdx
                    ? {
                        ...pair,
                        input: pair.input.map((inp, idx) =>
                            idx === inputIdx ? value : inp
                        )
                    }
                    : pair
            )
        );
    };

    const updatePairOutput = (pairIdx, value) => {
        setPairs(prev =>
            prev.map((pair, index) =>
                index === pairIdx
                    ? { ...pair, output: value }
                    : pair
            )
        );
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