import { use, useState, useEffect } from "react";
import "./App.css";
import NoticeList from "./components/NoticeList";

function App() {
    const [targetUrl, setTargetUrl] = useState("");
    const [isMonitoring, setIsMonitoring] = useState(false);

    useEffect(() => {
        setIsMonitoring(true);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">
                MMMUT Notice Monitor
            </h1>

            {isMonitoring && (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">
                        Latest Notices
                    </h2>
                    <NoticeList targetUrl={targetUrl} />
                </div>
            )}
        </div>
    );
}

export default App;
