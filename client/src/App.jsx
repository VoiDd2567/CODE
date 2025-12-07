import { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from "./components/UserContext";
import { useTranslation } from "react-i18next";
import MainPage from "./pages/Main/MainPage";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import RegistrationCode from "./pages/RegistrationCode/RegistrationCode";
import CodeEditor from "./pages/CodeEditor/CodeEditor";
import UserCourses from "./pages/UserCourses/UserCourses";
import ProfileSettings from "./pages/ProfileSettings/ProfileSettings";
import Teapot from "./pages/Teapot/Teapot"
import LoadingScreen from "./components/Loading/LoadingScreem";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import PasswordResetEmailGet from "./pages/PasswordResetEmailGet/PasswordResetEmailGet";
import CoursePage from "./pages/CoursePage/CoursePage";
import ExerciseEditor from "./pages/ExerciseEditor/ExerciseEditor";
//import CourseEditor from "./pages/CourseEditor/CourseEditorPage";
//import ClassPage from "./pages/ClassPage/ClassPage";
import { LanguageContext } from "./components/LanguageContext/LanguageContext"
import client_config from "./client_config.json"

const PrivateRoute = ({ children }) => {
    const { user } = useContext(UserContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {

    const { i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const { setLng } = useContext(LanguageContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${client_config.SERVER_IP}/api/user/user`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    setLng(data.lng);
                    i18n.changeLanguage(data.lng);
                    setUser(data.user);
                } else {
                    console.log("Error getting user:", await res.text());
                }
            })
            .catch(err => console.error("Ping failed:", err))
            .finally(() => setLoading(false));
    }, [i18n, setLng]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/registration-code" element={<RegistrationCode />} />
                    <Route path="/teapot" element={<Teapot />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/password-reseting" element={<PasswordResetEmailGet />} />
                    <Route path="/code-editor" element={
                        <PrivateRoute>
                            <CodeEditor />
                        </PrivateRoute>
                    } />
                    <Route path="/profile-settings" element={
                        <PrivateRoute>
                            <ProfileSettings />
                        </PrivateRoute>
                    } />
                    <Route path="/courses" element={
                        <PrivateRoute>
                            <UserCourses />
                        </PrivateRoute>
                    } />
                    <Route path="/exercise-editor" element={
                        <PrivateRoute>
                            <ExerciseEditor />
                        </PrivateRoute>
                    } />
                    {/* <Route path="/course-editor" element={
                        <PrivateRoute>
                            <CourseEditor />
                        </PrivateRoute>
                    } /> */}
                    {/* <Route path="/class/:id" element={
                        <PrivateRoute>
                            <ClassPage />
                        </PrivateRoute>
                    } /> */}
                    <Route path="/course/:id" element={
                        <PrivateRoute>
                            <CoursePage />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </UserContext.Provider>
    )

}

export default App;