import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Editor from "../../../components/Editor/Editor";

import editFileImg from "../../../pictures/edit-file.png"
import pyIcon from "../../../pictures/py-icon.png"
import jsIcon from "../../../pictures/js-icon.png"
import del from "../../../pictures/delete.png"
import delRed from "../../../pictures/delete-red.png"
import closeImg from "../../../pictures/cross-icon.png"


const FileMenu = ({ addFiles, startFiles }) => {
    const { t } = useTranslation()
    const [files, setFiles] = useState({
        1: { name: "main.py", value: "#Write your code here\n\n" }
    })
    const [openFile, setOpenFile] = useState(false)
    const [openedFile, setOpenedFile] = useState(null)
    const [fileEditorValue, setFileEditorValue] = useState(null)
    const [fileEditorH, setFileEditorH] = useState(7.5)

    useEffect(() => {
        setFiles(startFiles)
    }, [startFiles])

    useEffect(() => {
        if (fileEditorValue == null) return

        const lines = fileEditorValue.split("\n").length
        setFileEditorH(Math.max(7.5, lines * 2.3))

        handleOpenFileEditorValueChange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileEditorValue])

    const handleNewFile = () => {
        setFiles(prevFiles => {
            const keys = Object.keys(prevFiles).map(Number)
            const newId = keys.length === 0 ? 1 : Math.max(...keys) + 1

            const newFiles = {
                ...prevFiles,
                [newId]: {
                    name: `Untitled-${newId}.txt`,
                    value: " "
                }
            }

            addFiles(newFiles)
            return newFiles
        })
    }

    const handleFileDelete = (idx) => {
        setFiles(prevFiles => {
            const newFiles = { ...prevFiles }
            delete newFiles[idx]

            addFiles(newFiles)
            return newFiles
        })
    }

    const handleNameChange = (e, idx) => {
        const newName = e.currentTarget.textContent

        setFiles(prevFiles => {
            const newFiles = {
                ...prevFiles,
                [idx]: {
                    ...prevFiles[idx],
                    name: newName
                }
            }

            addFiles(newFiles)
            return newFiles
        })
    }

    const handleOpenFileEditor = (idx) => {
        setOpenFile(true)
        setOpenedFile({ ...files[idx], id: idx })
        setFileEditorValue(files[idx].value)
    }

    const handleOpenFileEditorValueChange = () => {
        if (!openedFile || !(openedFile.id in files)) return;

        setFiles(prevFiles => {
            const newFiles = { ...prevFiles }
            newFiles[openedFile.id].value = fileEditorValue

            addFiles(newFiles)
            return newFiles
        })
    }

    return (
        <div className="fileMenu">
            <div className="fileMenu-add_btn" onClick={handleNewFile}>{t("add_file")}</div>
            <div className="fileMenu-menu-area">
                {Object.entries(files).map(([idx, file]) => {
                    const ext = file.name.split(".").pop().toLowerCase()
                    let icon = null
                    if (ext === "py") {
                        icon = pyIcon
                    } else if (ext === "js") {
                        icon = jsIcon
                    }
                    return (
                        <div className="fileMenu-file" key={idx}>
                            <div className="fileMenu-file-file_icon"><img src={icon} alt="" /></div>
                            <div className="fileMenu-file-name" onBlur={(e) => handleNameChange(e, idx)} suppressContentEditableWarning contentEditable>{file.name}</div>
                            <div className="fileMenu-file-icons">
                                <div className="fileMenu-file-icon">
                                    <img src={editFileImg} alt="Edit" onClick={() => handleOpenFileEditor(idx)} />
                                </div>
                                <div
                                    className="fileMenu-file-icon"
                                    onClick={() => handleFileDelete(idx)}
                                    onMouseEnter={e => {
                                        e.currentTarget.querySelector("img").src = delRed
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.querySelector("img").src = del
                                    }}
                                >
                                    <img src={del} alt="Delete" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {openFile && (<div className="fileMenu-file_editor">
                <div className="fileMenu-file_editor_header">
                    <div className="fileMenu-file_editor-fileName">{openedFile ? openedFile.name : ""}</div>
                    <div className="fileMenu-file_editor-closeIcon"><img src={closeImg} alt="Close" onClick={() => setOpenFile(false)} /></div>
                </div>
                <Editor fixedHeight={false} w={50} h={fileEditorH} editorValue={fileEditorValue ? fileEditorValue : ""} getValue={setFileEditorValue} />
            </div>)}
        </div>
    )
}

export default FileMenu;