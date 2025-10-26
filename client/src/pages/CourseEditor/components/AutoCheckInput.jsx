import InOutPair from "./InOutPair";
import plus from "../../../pictures/plus.png";
import { useState, useEffect } from "react";

const AutoCheckInput = ({ setList }) => {
    const [testList, setTestList] = useState([]);

    useEffect(() => {
        if (testList.length === 0) {
            setTestList([{ input: [""], output: [""] }]);
        }
        setList(testList);
    }, [testList]);

    const updateTestList = (index, value, isInput = true) => {
        setTestList(prev => {
            const newList = [...prev];
            if (isInput) {
                // Split input by newlines to create array
                newList[index] = {
                    ...newList[index],
                    input: value.split('\n').filter(line => line !== '')
                };
            } else {
                // Keep output as single string in array
                newList[index] = {
                    ...newList[index],
                    output: [value]
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
            {testList.map((test, index) => (
                <InOutPair
                    key={index}
                    setInputText={(val) => updateTestList(index, val)}
                    setOutputText={(val) => updateTestList(index, val, false)}
                    inputValue={test.input.join('\n')}
                    outputValue={test.output[0] || ""}
                    deleteTest={() => deleteTest(index)}
                />
            ))}
        </div>
    );
};

export default AutoCheckInput;