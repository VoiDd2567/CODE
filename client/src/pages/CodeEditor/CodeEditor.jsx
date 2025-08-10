import "./codeEditor.css"
import { useState, useRef, useEffect, useContext } from "react"
import Editor from "./Editor"
import EditorHeader from "./EditorHeader"
import Console from "./Console"
import FileManager from "./FileManager"
import ExerciseDisplay from "./ExerciseDisplay"
import ExerciseSelector from "./ExerciseSelector"
import { LanguageContext } from "../../components/LanguageContext/LanguageContext"
import complete_image from "../../pictures/complete-white.png"
import cross_image from "../../pictures/cross-white.png"

const CodeEditor = () => {
    const editor = useRef(null);
    const { lng } = useContext(LanguageContext);
    const [files, setFiles] = useState({})
    const [chosenFile, setChosenFile] = useState(Object.keys(files)[0]);
    const [editorValue, setEditorValue] = useState(files[Object.keys(files)[0]]);
    const [isExerciseOpen, setExerciseOpen] = useState(false);
    const [exercise, setExercise] = useState({}); //{_id: '', type: '', name: 's', description: {…}, files: {…},…}
    const [exerciseText, setExerciseText] = useState(null);
    const [user, setUser] = useState({});
    const [openedExerciseChoose, setExerciseChoose] = useState(false);
    const [exercises, setExercises] = useState({});
    const [fileSaved, setFileSaved] = useState(true);


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
        let exerciseId = null;
        if (!isExerciseOpen) {
            fileType = "user";
        } else {
            fileType = "exercise";
            exerciseId = exercise["_id"]
        }

        fetch("https://localhost:3001/api/code/save-code", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: fileType, value: data, fileName: chosenFile, exerciseId: exerciseId })
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(`Error ${res.status} :\n ${errorData}`);
            } else {
                setFileSaved(true)
            }
        }).catch(error => {
            console.error('ERROR with getting data', error);
        });
    }

    const getExercises = () => {
        fetch("https://localhost:3001/api/exercise/get-exercises", {
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
        fetch("https://localhost:3001/api/exercise/get-exercise", {
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
        fetch("https://localhost:3001/api/user/user", {
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
                    <Editor setFileSaved={setFileSaved} saveData={saveData} setEditorValue={handleEditorValueChange} chosenFileValue={files[chosenFile]} editor={editor} mini={isExerciseOpen} />
                    <div className="code-editor-page__file-saved-label">
                        {fileSaved ? (
                            <div>
                                <img src={complete_image} />
                                Saved
                            </div>
                        ) : (
                            <div>
                                <img src={cross_image} />
                                Not saved
                            </div>
                        )}
                    </div>
                </div>
                <div className="code-editor-page__right-part">
                    <Console chosenFile={chosenFile} files={files} getExerciseList={getExercises} saveData={saveData} editorValue={editorValue} setExerciseChoose={setExerciseChoose} exerciseOpened={isExerciseOpen} />
                    <FileManager fileList={files} setFile={handleNewFileSet} username={user["name"]} saveData={saveData} editorValue={editorValue} />
                </div>
            </div>
        </div>
    )
}

export default CodeEditor