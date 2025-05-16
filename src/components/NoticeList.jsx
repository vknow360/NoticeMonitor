import { useState, useEffect } from "react";
import NoticeService from "../services/noticeService";

const NoticeList = ({ targetUrl }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const noticeService = new NoticeService(targetUrl); // Request notification permission on component mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const handleNewNotices = (newNotices) => {
            setNotices(newNotices);

            // Show notification for new notices
            if (newNotices.length > 0) {
                if (
                    "Notification" in window &&
                    Notification.permission === "granted"
                ) {
                    const notificationTitle = newNotices[0].title;
                    new Notification("New Notice Alert", {
                        body: `${notificationTitle}\n+${
                            newNotices.length - 1
                        } more notices`,
                        tag: "notice-update", // Prevents duplicate notifications
                        icon: "/vite.svg", // Add an icon
                        requireInteraction: true, // Notification stays until user interacts
                    });
                }
            }
        };

        const initialize = async () => {
            try {
                // Initial fetch
                const fetchedNotices = await noticeService.fetchNotices();
                setNotices(fetchedNotices);
                setLoading(false);

                // Start monitoring for new notices
                const cleanup = await noticeService.startMonitoring();

                // Add listener for new notices
                const removeListener =
                    noticeService.onNewNotices(handleNewNotices);

                return () => {
                    cleanup();
                    removeListener();
                };
            } catch (err) {
                setError("Failed to fetch notices");
                setLoading(false);
            }
        }; // Keep track of cleanup function
        let cleanupFn;

        initialize().then((cleanup) => {
            cleanupFn = cleanup;
        });

        // Return cleanup function for useEffect
        return () => {
            if (cleanupFn) cleanupFn();
        };
    }, [targetUrl]);

    if (loading) {
        return <div className="text-center py-8">Loading notices...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-8">{error}</div>;
    }

    if (notices.length === 0) {
        return <div className="text-center py-8">No notices found</div>;
    }
    return (
        <div className="space-y-4">
            {notices
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
                        <p className="text-gray-600 mb-2">{notice.content}</p>
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
                ))}
        </div>
    );
};

export default NoticeList;
