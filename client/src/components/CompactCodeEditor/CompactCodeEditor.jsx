import "./cce.css"
import Editor from "../Editor/Editor"
import Console from "../WebConsole/Console"

const CompactCodeEditor = ({ h, description }) => {

    return (<div className="CCE-wrap">
        <div className="ex_description">{description}</div>
        <div className="editor-line">
            <Editor color="white" h={h - 5.5} w={50} inserted={true} />
            <Console inserted={true} h={h} w={25} example={true} />
        </div>
    </div>)
}

export default CompactCodeEditor;