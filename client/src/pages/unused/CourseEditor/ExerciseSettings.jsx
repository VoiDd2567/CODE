
import "./exerciseSettings.css"
import SettingsInput from "./components/settingsInput";
import SettingsSelect from "./components/settingsSelect";
import SettingsCheckbox from "./components/settingsCheckbox";
import SettingsRange from "./components/settingsRange";
import AutoCheckInput from "./components/AutoCheckInput";
import SelectChoice from "./components/selectChoice";
import FileManager from "../../components/FileManager/FileManager";
import Editor from "../../components/Editor/Editor";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./components/components.css"

const ExerciseSettings = ({ setOpenSettings, setBlock, exerciseId, exerciseSettings = null }) => {
    const { t } = useTranslation()
    const exName = useRef(null)
    const exDescription = useRef(null)
    const [exLngValue, setExLngValue] = useState("est");
    const [openAutoCheck, setOpenAutoCheck] = useState(false)
    const [openAutoCheckTypeOpen, setOpenAutoCheckTypeOpen] = useState(false)
    const [autoCheckType, setAutoCheckType] = useState(null)
    const [openFileManager, setOpenFileManager] = useState(false)
    const [openFileEditor, setOpenFileEditor] = useState(false)
    const [openSelectChoices, setOpenSelectChoices] = useState(true)
    const [autoCheck, setAutoCheck] = useState(false);
    const [fileManager, setFileManager] = useState(false);
    const [files, setFiles] = useState({})
    const [chosenFile, setChosenFile] = useState(1)
    const [exercise, setExercise] = useState({ type: "choose" })
    const [errorText, setErrorText] = useState(null)
    const [options, setOptions] = useState({
        1: { option: "Option 1", correct: true },
        2: { option: "Option 2", correct: false }
    })

    useEffect(() => {
        if (exerciseSettings) {
            changeExercise("description", exerciseSettings.description)
            changeExercise("name", exerciseSettings.name)

            if (Object.keys(exerciseSettings).includes("options")) {
                setOptions(exerciseSettings.options)
            } else {
                setOpenAutoCheck(true)
                setOpenSelectChoices(false)
                if (exerciseSettings?.type) {
                    changeExercise("type", exerciseSettings?.type)
                }
                if (exerciseSettings?.autoCheck) {
                    changeExercise("autoCheck", exerciseSettings?.autoCheck)
                }
                if (exerciseSettings?.inputCount) {
                    changeExercise("inputCount", exerciseSettings?.inputCount)
                }
                if (exerciseSettings?.answerCheckType) {
                    changeExercise("answerCheckType", exerciseSettings?.answerCheckType)
                    setAutoCheck(true)
                    handleAutocheckChange(null, true)
                    const typeMap = {
                        "checkCodeOutput": "output_check",
                        "checkFuncReturn": "func_check",
                        "input": "output_check_input"
                    };
                    let opt = typeMap[exerciseSettings?.answerCheckType]
                    if (exerciseSettings?.inputCount) {
                        if (exerciseSettings?.inputCount > 0 && opt != "func_check") {
                            opt = typeMap["input"]
                        }
                    }
                    setAutoCheckType(t(opt))
                    handleAutocheckTypeChange(null, opt)
                }
                if (exerciseSettings?.inputAnswers) {
                    changeExercise("inputAnswers", exerciseSettings?.inputAnswers)
                }
                if (exerciseSettings?.minimalPercent) {
                    changeExercise("minimalPercent", exerciseSettings?.minimalPercent)
                }
                if (exerciseSettings?.files) {
                    const changeFiles = Object.entries(exerciseSettings.files).map(([name, content]) => ({
                        name,
                        content
                    }));
                    setFiles(changeFiles)
                    setFileManager(true)
                    setOpenFileManager(true)
                }
                if (exerciseSettings?.withoutInputAnswer) {
                    changeExercise("withoutInputAnswer", exerciseSettings?.withoutInputAnswer)
                }
                if (exerciseSettings?.functionName) {
                    changeExercise("files", exerciseSettings?.functionName)
                }
                if (exerciseSettings?.programmingLng) {
                    changeExercise("programmingLng", exerciseSettings?.programmingLng)
                }
                if (exerciseSettings?.inputCount) {
                    changeExercise("inputCount", exerciseSettings?.inputCount)
                }
                if (exerciseSettings?.functionName) {
                    changeExercise("functionName", exerciseSettings?.functionName)
                }
                if (exerciseSettings?.functionReturns) {
                    changeExercise("inputAnswers", exerciseSettings?.functionReturns)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseSettings])


    useEffect(() => {
        const el = exDescription.current;
        if (!el) return;

        const cleanup = resizeInput(el);
        return cleanup;
    }, []);

    useEffect(() => {
        if (!exDescription.current) return;
        if (exercise?.description?.[exLngValue]) {
            exDescription.current.value = exercise.description[exLngValue];
        } else {
            exDescription.current.value = "";
        }
    }, [exLngValue, exercise]);

    useEffect(() => {
        const newFiles = {}
        Object.entries(files).forEach(([, file]) => {
            newFiles[file.name] = file.content
        });
        changeExercise("files", newFiles)
    }, [files])

    const resizeInput = (el) => {
        if (!el) return;

        const resize = () => {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        };

        el.addEventListener("input", resize);
        resize();

        return () => el.removeEventListener("input", resize);
    }

    const handleExTypeChange = (e) => {
        let type = "";
        if (e.target.value === t("code_type")) {
            type = "code"
            setOpenAutoCheck(true);
            setOpenSelectChoices(false);
        } else {
            type = "choose"
            setOpenAutoCheck(false);
            setOpenSelectChoices(true);
            setOpenAutoCheckTypeOpen(false)
            setOpenFileManager(false)
            setAutoCheckType(false)
        }
        changeExercise("type", type)
    }

    const handleManyFilesChange = (e) => {
        const checked = e.target.checked
        setFileManager(checked)
        setOpenFileManager(checked)
    }

    const handleAutocheckChange = (e, data = null) => {
        let checked = data
        if (e) {
            checked = e.target.checked
        }
        setAutoCheck(checked)
        setAutoCheckType(null)
        setOpenAutoCheckTypeOpen(checked);
        changeExercise("autoCheck", true)
    }

    const handleAutocheckTypeChange = (e, data = null) => {
        let changed = data
        if (e) {
            changed = e.target.value
        }

        if (data && !e) {
            changed = t(data)
        }

        setAutoCheckType(changed)

        if (changed === t("output_check_input")) {
            changeExercise("answerCheckType", "checkCodeOutput")
            return;
        }

        const autoCheckList = {
            [t("output_check")]: "checkCodeOutput",
            [t("func_check")]: "checkFuncReturn"
        }

        changeExercise("answerCheckType", autoCheckList[changed])
        changeExercise("inputCount", 0)
    }

    const openFile = (isOpen) => setOpenFileEditor(isOpen);

    const saveFileContent = (value) => {
        setFiles(prev => ({
            ...prev,
            [chosenFile]: {
                ...prev[chosenFile],
                content: value
            }
        }))
    }

    const handlePLngChnage = (e) => {
        if (e.target.value === "Python") {
            changeExercise("programmingLng", "py")
        } else {
            changeExercise("programmingLng", "js")
        }
    }

    const handleInputsChange = (inputs) => {
        const inputCount = inputs ? inputs.length : 0;
        changeExercise("inputCount", inputCount);

        const rearangedInputs = inputs.map(test => ({
            input: test.input,
            output: test.output
        }));

        changeExercise("inputAnswers", rearangedInputs);
    }

    const changeExercise = (key, value) => {
        setExercise(prev => {
            const newList = { ...prev }
            newList[key] = value
            return { ...newList }
        })
    }

    const saveExercise = () => {
        if (!exercise?.name || exercise.name.trim() === "") {
            notificationNoRequired(t("name"));
            return;
        }
        if (!exercise?.description?.[exLngValue] || exercise.description[exLngValue].trim() === "") {
            notificationNoRequired(t("description"));
            return;
        }

        if (exercise.type === "choose") {
            setBlock(exerciseId, "choose", { options: { ...options }, description: exercise.description, name: exercise.name })
        }
        if (exercise.type === "code") {
            if (exercise.answerCheckType === "checkCodeOutput") {
                if (exercise.inputCount === 0) {
                    if (!exercise?.withoutInputAnswer || exercise.withoutInputAnswer.trim() === "") {
                        notificationNoRequired(t("output"));
                        return;
                    }
                } else if (exercise.inputCount > 0) {
                    if (!exercise?.inputAnswers || exercise.inputAnswers.length === 0) {
                        notificationNoRequired(t("inputs"));
                        return;
                    }
                    if (exercise.inputCount !== exercise.inputAnswers.length) {
                        notificationNoRequired(t("inputs"));
                        return;
                    }
                }
            }

            if (exercise.answerCheckType === "checkFuncReturn") {
                if (!exercise?.inputAnswers || exercise.inputAnswers.length === 0) {
                    notificationNoRequired(t("inputs"));
                    return;
                }
                if (!exercise?.functionName || exercise.functionName.trim() === "") {
                    notificationNoRequired(t("function_name"));
                    return;
                }
            }

            const finalExercise = { ...exercise };

            if (!finalExercise.programmingLng) {
                finalExercise.programmingLng = "py";
            }

            if (!finalExercise.minimalPercent) {
                if (finalExercise.answerCheckType === "checkCodeOutput") {
                    finalExercise.minimalPercent = 100;
                } else {
                    finalExercise.minimalPercent = 70;
                }
            }

            if (exercise.answerCheckType === "checkFuncReturn") {
                finalExercise.functionReturns = exercise.inputAnswers;
                delete finalExercise.inputAnswers
                delete finalExercise.inputCount
            }

            setExercise(finalExercise);
            setBlock(exerciseId, "exercise", { ...finalExercise })
        }
        setOpenSettings(false)
    }

    const notificationNoRequired = (text) => {
        let errText = `${t("error")}: `;
        setErrorText(`${errText} ${text} ${t("required")}`)
    }

    const changeLng = (e) => {
        setExLngValue(e.target.value)
    }

    return (<div className="exercise_settings-wrap">
        <div className="exercise_settings">
            <div className="line">
                <SettingsInput label={t("name")} inputRef={exName} width={"55%"} onChange={(e) => changeExercise("name", e.target.value)} value={exercise?.name} />
                <SettingsSelect label={t("desc_language")} value={exLngValue} onChange={(e) => changeLng(e)} options={["est", "eng"]} noDefault={false} />
            </div>
            <div className="line centered-line">
                <SettingsSelect label={t("exercise_type")} onChange={(e) => handleExTypeChange(e)} options={[t("select_type"), t("code_type")]} noDefault={false} />
                {
                    openAutoCheck && (
                        <div key={`autocheck-wrap-${fileManager}`} className="line">
                            <SettingsSelect label={t("code_lng")} options={["Python", "JavaScript"]} noDefault={false} onChange={(e) => handlePLngChnage(e)} />
                            <SettingsCheckbox key={`many-files-${fileManager}`} label={t("many_files")} checked={fileManager} onChange={(e) => handleManyFilesChange(e)} divClass="autocheck" />
                            <SettingsCheckbox key={`autocheck-${autoCheck}`} label={t("solution_autocheck")} checked={autoCheck} onChange={(e) => handleAutocheckChange(e)} divClass="autocheck" />
                        </div>
                    )
                }
            </div>
            <div className="line">
                <SettingsInput label={t("description")} inputRef={exDescription} width={"85%"} enterAllowed={true} onChange={(e) => changeExercise("description", {
                    ...exercise?.description, // Depending on choose or code change description to question
                    [exLngValue]: e.target.value
                })} />
            </div>
            {openSelectChoices && (
                <div className="line">
                    <SelectChoice givenOptions={options} setOutOptions={setOptions} />
                </div>
            )}
            {openAutoCheckTypeOpen && (
                <div>
                    <div className="sepLine-wrap"><div className="sepLine" /></div>
                    <div className="line">
                        <SettingsSelect label={t("autocheck_type")} options={[t("output_check"), t("output_check_input"), t("func_check")]} onChange={(e) => handleAutocheckTypeChange(e)} value={t(autoCheckType)} />
                        {autoCheckType === t("output_check") ? (
                            <SettingsInput label={t("output")} width={"18vw"} onChange={(e) => changeExercise("withoutInputAnswer", e.target.value)} value={exercise.withoutInputAnswer} />
                        ) : (autoCheckType && (
                            <SettingsRange label={t("complete_percent")} width={"15vw"} onChange={(e) => changeExercise("minimalPercent", e.target.value)} defaultValue={exercise.minimalPercent} />)
                        )}
                    </div>
                </div>
            )}
            {autoCheckType === t("func_check") && (
                <div className="line">
                    <SettingsInput label={t("function_name")} width={"20vw"} onChange={(e) => changeExercise("functionName", e.target.value)} value={exercise.functionName} />
                </div>
            )}
            {(autoCheckType === t("output_check_input") || autoCheckType === t("func_check")) && (openAutoCheckTypeOpen) && (
                <div className="line">
                    <AutoCheckInput setList={(e) => handleInputsChange(e)} defaultTests={exercise.inputAnswers} />
                </div>
            )}
            {openFileManager && (
                <div className="fileManager">
                    <div className="sepLine-wrap"><div className="sepLine" /></div>
                    <label htmlFor="">{t("file_manager")}</label>
                    <FileManager setOutFiles={setFiles} openEditor={openFile} setChosenFile={setChosenFile} outFiles={files} />
                </div>
            )}
            {openFileEditor && (
                <div className="e-wrap">
                    <Editor
                        editorValue={files[chosenFile]?.content || ""}
                        fixedHeight={false} getValue={saveFileContent}
                    />
                    <div className="close-wrap" onClick={() => openFile(false)}>{t("close")}</div>
                </div>
            )}
        </div>
        <div className="changeMenu-wrap">
            <div className="changeMenu">
                <div className="requiredError">{errorText}</div>
                <div className="changeMenuBtn red" onClick={() => setOpenSettings(false)}>{t("cancel")}</div>
                <div className="changeMenuBtn green" onClick={() => saveExercise()}>{t("save")}</div>
            </div>
        </div>
    </div>)
};

export default ExerciseSettings;