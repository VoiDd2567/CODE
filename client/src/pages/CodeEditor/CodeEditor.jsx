import "./codeEditor.css"
import { useState, useRef, useEffect, useContext } from "react"
import Editor from "./Editor"
import EditorHeader from "./EditorHeader"
import Console from "./Console"
import FileManager from "./FileManager"
import ExerciseDisplay from "./ExerciseDisplay"
import ExerciseSelector from "./ExerciseSelector"
import { LanguageContext } from "../../components/LanguageContext/LanguageContext"

const CodeEditor = () => {
    const editor = useRef(null);
    const { lng } = useContext(LanguageContext);
    const [files, setFiles] = useState({})
    const [chosenFile, setChosenFile] = useState(Object.keys(files)[0]);
    const [editorValue, setEditorValue] = useState(files[Object.keys(files)[0]]);
    const [isExerciseOpen, setExerciseOpen] = useState(false);
    const [exercise, setExercise] = useState({});
    const [exerciseText, setExerciseText] = useState(null);
    const [user, setUser] = useState({});
    const [openedExerciseChoose, setExerciseChoose] = useState(false);
    const [exercises, setExercises] = useState({});


    const handleEditorValueChange = (data) => {
        setEditorValue(data)
        files[chosenFile] = data;
    }

    const handleNewFileSet = (filename) => {
        setEditorValue(files[filename])
        setChosenFile(filename)
    }

    const saveData = (data) => {
        let fileType = ""
        if (!isExerciseOpen) {
            fileType = "user";
        } else {
            fileType = "exercise";
        }

        fetch("https://localhost:3001/api/save-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: fileType, value: data, name: chosenFile })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(`Error ${res.status} :\n ${errorData}`);
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }

    const getExercises = () => {
        fetch("https://localhost:3001/api/get-exercises", {
            method: "GET",
            credentials: "include",
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData)
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                setExercises(data["exerciseList"]);
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }

    const getExercise = (exerciseId) => {
        fetch("https://localhost:3001/api/get-exercise", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ exerciseId: exerciseId })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData)
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                setExercise(data["exercise"])
                setExerciseOpen(true);

                setExerciseText(data["exercise"].description[lng]);
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }

    useEffect(() => {
        fetch("https://localhost:3001/api/user", {
            method: "GET",
            credentials: 'include',
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                alert(errorData)
                throw new Error(`Error ${res.status}`);
            } else {
                const data = await res.json();
                setUser(data["user"])
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }, []);

    useEffect(() => {
        if (!user.files && !exercise.files) return;

        const newFiles = isExerciseOpen ? exercise.files : user.files;
        if (!newFiles) return;

        const firstFile = Object.keys(newFiles)[0];
        setFiles(newFiles);
        setEditorValue(newFiles[firstFile]);
        setChosenFile(firstFile);
    }, [isExerciseOpen, exercise, user]);

    return (
        <div>
            {openedExerciseChoose && <ExerciseSelector exercises={exercises} setExerciseChoose={setExerciseChoose} getExercise={getExercise} />}
            <EditorHeader />
            <div className="code-editor-page__workspace-wrap">
                <div className="code-editor-page__left-part">
                    {isExerciseOpen &&
                        <ExerciseDisplay setExerciseOpen={setExerciseOpen} exerciseText={exerciseText} />
                    }
                    <Editor saveData={saveData} setEditorValue={handleEditorValueChange} chosenFileValue={files[chosenFile]} editor={editor} mini={isExerciseOpen} />
                </div>
                <div className="code-editor-page__right-part">
                    <Console getExerciseList={getExercises} setExerciseChoose={setExerciseChoose} getExercise={getExercise} editorValue={editorValue} exerciseOpened={isExerciseOpen} />
                    <FileManager fileList={files} setFile={handleNewFileSet} username={user["name"]} />
                </div>
            </div>
        </div>
    )
}

export default CodeEditor