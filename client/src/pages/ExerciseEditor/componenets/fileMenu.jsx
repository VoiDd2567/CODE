import { useTranslation } from "react-i18next";
import { useState } from "react";

const FileMenu = () => {
    const { t } = useTranslation()
    // eslint-disable-next-line no-unused-vars
    const [files, setFiles] = useState({})

    return (
        <div className="fileMenu">
            <div className="fileMenu-add_btn">{t("add_file")}</div>
            <div className="fileMenu-menu-area"></div>
        </div>
    )
}

export default FileMenu;