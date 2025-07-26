import LanguageProvider from "./components/LanguageContext/LanguageProvider";
import App from "./App";

const AppWrapper = () => {
    return (
        <LanguageProvider>
            <App />
        </LanguageProvider>
    );
};

export default AppWrapper;
