import { useState, useEffect } from "react";
import NoticeService from "../services/noticeService";

const NoticeList = ({ targetUrl }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        const noticeService = new NoticeService(targetUrl);

        const initialize = async () => {
            try {
                const fetchedNotices = await noticeService.fetchNotices();
                setNotices(fetchedNotices);
                setLoading(false);

                const cleanup = await noticeService.startMonitoring();

                return () => {
                    cleanup();
                };
            } catch (err) {
                setError("Failed to fetch notices");
                setLoading(false);
            }
        };
        let cleanupFn;

        initialize().then((cleanup) => {
            cleanupFn = cleanup;
        });

        return () => {
            if (cleanupFn) cleanupFn();
        };
    }, [targetUrl]);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setSubscribing(true);
        try {
            const response = await fetch(
                "https://monitor-server-mcb7.onrender.com/api/subscribe?email=" +
                    email
            );
            alert(await response.text());
            setEmail("");
        } catch (error) {
            alert("Failed to subscribe. Please try again.");
        } finally {
            setSubscribing(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading notices...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-8">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Simple Email Subscription Form */}
            <div className="bg-white shadow rounded-lg p-4">
                <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={subscribing}
                        className={`px-4 py-2 text-white font-medium rounded-md ${
                            subscribing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {subscribing ? "Subscribing..." : "Subscribe"}
                    </button>
                </form>
            </div>

            {notices.length === 0 ? (
                <div className="text-center py-8">No notices found</div>
            ) : (
                notices
                    .filter((item) => item.isNew)
                    .map((notice) => (
                        <div
                            key={notice.id}
                            className={`bg-white shadow rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
                                notice.isNew
                                    ? "border-l-4 border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold mb-2">
                                    {notice.title}
                                    {notice.isNew && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                            New!
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-2">
                                {notice.content}
                            </p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{notice.date}</span>
                                {notice.link && (
                                    <a
                                        href={notice.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Read more
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
};

export default NoticeList;
