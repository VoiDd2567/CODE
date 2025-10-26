import { useState, useEffect } from "react";
import "./filemanager.css";
import { useTranslation } from "react-i18next";
import add from "../../pictures/plus.png";
import del from "../../pictures/bin.png";
import py from "../../pictures/py-file-icon.png";
import js from "../../pictures/js-file-icon.png";
import txt from "../../pictures/txt-file-icon.png";
import edit from "../../pictures/edit-file.png"

const fileIcons = { py, js, txt };

const FileManager = ({ setChosenFile = () => { }, outFiles, setOutFiles, openEditor }) => {
    const { t } = useTranslation();

    const [files, setFiles] = useState(outFiles || {});
    const [selectedFileKey, setSelectedFileKey] = useState("1");

    const handleFileSet = (key) => {
        setSelectedFileKey(key);
        setChosenFile(key);
    };

    useEffect(() => {
        if (!outFiles) return;
        setFiles(outFiles);
    }, [outFiles]);

    const deleteFile = () => {
        if (!selectedFileKey) return;
        setFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[selectedFileKey];
            const remainingKeys = Object.keys(newFiles);
            const nextKey = remainingKeys[0] || null;
            setSelectedFileKey(nextKey);
            setChosenFile(nextKey);
            setOutFiles?.(newFiles);
            return newFiles;
        });
    };

    const addFile = () => {
        setFiles((prev) => {
            const newKey = (Math.max(0, ...Object.keys(prev).map(Number)) + 1).toString();
            const newFileName = `new_file_${newKey}.py`;
            const newFile = { name: newFileName, content: "" };
            const newFiles = { ...prev, [newKey]: newFile };
            setSelectedFileKey(newKey);
            setChosenFile(newKey);
            setOutFiles?.(newFiles);
            return newFiles;
        });
    };

    const changeName = (key, newName) => {
        setFiles((prev) => {
            const updated = { ...prev, [key]: { ...prev[key], name: newName } };
            setOutFiles?.(updated);
            return updated;
        });
    };


    return (
        <div className="manager-wrap">
            <div className="manager-main_area">
                {Object.entries(files).map(([key, file]) => {
                    const fileType = file.name.split(".").pop();
                    const icon = fileIcons[fileType] || null;

                    return (
                        <div
                            key={key}
                            className={`manager-element ${selectedFileKey === key ? "active" : ""}`}
                            onClick={() => handleFileSet(key)}
                        >
                            <div className="element-part">
                                {icon && <img src={icon} alt={fileType} />}
                                <p
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => changeName(key, e.target.textContent)}
                                >
                                    {file.name}
                                </p>
                            </div>
                            <div className="element-part element-part-right">
                                {selectedFileKey === key ? (<img src={edit} alt="Edit" onClick={(e) => { e.stopPropagation(); openEditor(true) }} />) : ""}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="manager-panel">
                <div className="manager-panel-left">
                    <div className="manager-selected_file">
                        {t("selected_file")}: {files[selectedFileKey]?.name || "—"}
                    </div>
                </div>

                <div className="manager-panel-right">
                    <div className="manager-btn" onClick={addFile}>
                        <img src={add} alt="Add" />
                    </div>
                    <div className="manager-btn" onClick={deleteFile}>
                        <img src={del} alt="Delete" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileManager;