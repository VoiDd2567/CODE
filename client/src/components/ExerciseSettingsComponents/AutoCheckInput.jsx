import InOutPair from "./InOutPair";
import plus from "../../pictures/plus.png";
import { useState, useEffect } from "react";

const AutoCheckInput = ({ setList }) => {
    const [testList, setTestList] = useState({});

    useEffect(() => {
        if (Object.keys(testList).length === 0) {
            setTestList({ 0: ":" });
        }
        setList(testList)
    }, [testList, setList]);

    const updateTestList = (key, value, input = true) => {
        setTestList(prev => {
            const [oldInput, oldOutput] = prev[key].split(":");
            return {
                ...prev,
                [key]: input ? `${value}:${oldOutput}` : `${oldInput}:${value}`
            };
        });
    };

    const addTest = () => {
        setTestList(prev => {
            const newKey = Math.max(...Object.keys(prev).map(Number)) + 1;
            return { ...prev, [newKey]: ":" };
        });
    };

    const deleteTest = (key) => {
        setTestList(prev => {
            const newList = { ...prev }
            delete newList[key]
            return { ...newList }
        })
    }

    return (
        <div className="autoCheckInput">
            <div className="addPair">
                <img src={plus} alt="Add" onClick={addTest} />
            </div>
            {Object.entries(testList).map(([key, value]) => {
                const [input, output] = value.split(":");
                return (
                    <InOutPair
                        key={key}
                        setInputText={(val) => updateTestList(key, val)}
                        setOutputText={(val) => updateTestList(key, val, false)}
                        inputValue={input}
                        outputValue={output}
                        deleteTest={() => deleteTest(key)}
                    />
                );
            })}
        </div>
    );
};

export default AutoCheckInput;
