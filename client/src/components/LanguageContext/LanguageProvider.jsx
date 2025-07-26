import { useState } from "react";
import { LanguageContext } from "./LanguageContext";

const LanguageProvider = ({ children }) => {
    const [lng, setLng] = useState("est");

    return (
        <LanguageContext.Provider value={{ lng, setLng }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageProvider;
