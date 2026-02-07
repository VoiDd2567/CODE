import InOutPair from "./InOutPair";
import plus from "../../../pictures/plus.png";
import { useState, useEffect } from "react";

const AutoCheckInput = ({ setList, defaultTests = null }) => {
    const [testList, setTestList] = useState([{ input: [""], output: [""] }]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (defaultTests && defaultTests.length > 0 && !initialized) {
            const normalizedTests = defaultTests.map(test => ({
                input: Array.isArray(test.input) ? test.input : [test.input || ''],
                output: Array.isArray(test.output) ? test.output : [test.output || '']
            }));
            setTestList(normalizedTests);
            setInitialized(true);
        }
    }, [defaultTests, initialized]);

    useEffect(() => {
        if (initialized) {
            setList(testList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testList]);

    const updateTestList = (index, value, isInput = true) => {
        setTestList(prev => {
            const newList = [...prev];
            if (isInput) {
                const inputArray = value ? value.split('\n') : [''];
                newList[index] = {
                    ...newList[index],
                    input: inputArray
                };
            } else {
                newList[index] = {
                    ...newList[index],
                    output: [value || '']
                };
            }
            return newList;
        });
    };

    const addTest = () => {
        setTestList(prev => [...prev, { input: [""], output: [""] }]);
    };

    const deleteTest = (index) => {
        setTestList(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="autoCheckInput">
            <div className="addPair">
                <img src={plus} alt="Add" onClick={addTest} />
            </div>
            {testList.map((test, index) => {
                const inputValue = Array.isArray(test.input)
                    ? test.input.filter(x => x !== undefined && x !== null).join('\n')
                    : "";
                const outputValue = Array.isArray(test.output)
                    ? (test.output.filter(x => x !== undefined && x !== null)[0] || "")
                    : "";

                return (
                    <InOutPair
                        key={index}
                        setInputText={(val) => updateTestList(index, val)}
                        setOutputText={(val) => updateTestList(index, val, false)}
                        inputValue={inputValue}
                        outputValue={outputValue}
                        deleteTest={() => deleteTest(index)}
                    />
                );
            })}
        </div>
    );
};

export default AutoCheckInput;