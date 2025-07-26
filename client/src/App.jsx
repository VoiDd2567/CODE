import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from "./components/UserContext";
import { useTranslation } from "react-i18next";
import MainPage from "./pages/Main/MainPage";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import RegistrationCode from "./pages/RegistrationCode/RegistrationCode";
import CodeEditor from "./pages/CodeEditor/CodeEditor";
import { LanguageContext } from "./components/LanguageContext/LanguageContext"

const PrivateRoute = ({ children }) => {
    const { user } = useContext(UserContext);
    return user ? children : <Navigate to="/login" replace />;
};

const App = () => {

    const { i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const { setLng } = useContext(LanguageContext);

    useEffect(() => {
        fetch('https://localhost:3001/api/user', {
            method: 'GET',
            credentials: 'include'
        }).then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                console.log("Error getting user : ", errorText)
            } else {
                const data = await res.json();
                setLng(data.lng)
                i18n.changeLanguage(data.lng);
                setUser(data.user)
            }
        }).catch(err => console.error("Ping failed:", err));
    }, [i18n, setLng]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/registration-code" element={<RegistrationCode />} />
                    <Route path="/code-editor" element={
                        <PrivateRoute>
                            <CodeEditor />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </UserContext.Provider>
    )

}

export default App;