import { parse } from "node-html-parser";

class NoticeService {
    constructor(targetUrl) {
        this.targetUrl = targetUrl;
        this.listeners = new Set(); // Store update listeners
        // Get last notice number from localStorage or use default
        this.lastNoticeNumber =
            parseInt(localStorage.getItem("lastNoticeNumber")) || 150520258936;
    }

    // Helper to extract notice number from URL
    extractNoticeNumber(url) {
        if (!url) return 0;
        const match = url.match(/\/(\d+)\./); // Matches number before file extension
        return match ? parseInt(match[1]) : 0;
    }

    // Add listener for new notices
    onNewNotices(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener); // Return cleanup function
    }
    async startMonitoring(interval = 10 * 1000) {
        // Check every 30 seconds
        console.log("Starting notice monitoring...");
        this.stopMonitoring(); // Clear any existing interval

        // Initial fetch
        const initialNotices = await this.fetchNotices();
        console.log("Initial notices fetched:", initialNotices.length);

        // Set up periodic checking
        this.monitoringInterval = setInterval(async () => {
            console.log("Checking for new notices...");
            await this.fetchNotices();
        }, interval);

        return () => this.stopMonitoring(); // Return cleanup function
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    async fetchNotices() {
        try {
            const response = await fetch(
                "https://monitor-server-mcb7.onrender.com/api/notices"
            );
            const notices = await response.json();

            if (!notices || !Array.isArray(notices)) {
                throw new Error("Invalid response from server");
            }

            let newNotices = [];
            for (const notice of notices) {
                if (notice.isNew) {
                    newNotices.push(notice);
                }
            }

            if (newNotices.length > 0) {
                const highestNumber = Math.max(
                    ...newNotices.map((notice) =>
                        this.extractNoticeNumber(notice.link)
                    )
                );
                this.lastNoticeNumber = Math.max(
                    this.lastNoticeNumber,
                    highestNumber
                );
                localStorage.setItem(
                    "lastNoticeNumber",
                    this.lastNoticeNumber.toString()
                );
                console.log(
                    "Updated last notice number:",
                    this.lastNoticeNumber
                );
            }

            // Notify listeners if there are new notices
            if (newNotices.length > 0) {
                console.log("New notices found:", newNotices.length);
                this.listeners.forEach((listener) => listener(newNotices));
            }

            return notices;
        } catch (error) {
            console.error("Error fetching notices:", error);
            return [];
        }
    }
}

export default NoticeService;
