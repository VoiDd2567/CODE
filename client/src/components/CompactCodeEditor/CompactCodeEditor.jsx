import "./cce.css"
import Editor from "../Editor/Editor"
import Console from "../WebConsole/Console"

const CompactCodeEditor = ({ h }) => {

    return (<div className="CCE-wrap">
        <Editor color="white" h={h - 5.5} w={40} />
        <Console inserted={true} h={h} />
    </div>)
}

export default CompactCodeEditor;