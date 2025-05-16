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
                "https://exp.sunnythedeveloper.in/scrapper.php"
            );
            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || "Failed to fetch data");
            }

            const html = json.data;
            const root = parse(html);
            const notices = [];

            const noticeTable = root.querySelector(
                "#ContentPlaceHolder2_ContentPlaceHolder3_GridView1"
            );

            if (!noticeTable) {
                console.log("Notice table not found");
                return notices;
            }

            // Find all rows
            const rows = noticeTable.querySelectorAll("tr");
            console.log("Found rows:", rows.length);

            // Skip the header row (i=0)
            for (let i = 1; i < rows.length; i++) {
                const firstCell = rows[i].querySelector("td");
                if (firstCell) {
                    const span = firstCell.querySelector("span");
                    const anchor = firstCell.querySelector("a");

                    if (span && anchor) {
                        const title = span.text.trim();
                        const link = anchor.getAttribute("href");

                        if (title && title.length > 0) {
                            try {
                                const noticeUrl = link
                                    ? new URL(link, "https://mmmut.ac.in/").href
                                    : null;
                                const notice = {
                                    id: i,
                                    title: title,
                                    content: "",
                                    link: noticeUrl,
                                    isNew: false,
                                };
                                notices.push(notice);
                            } catch (urlError) {
                                console.error(
                                    "Error processing URL:",
                                    link,
                                    urlError
                                );
                                const notice = {
                                    id: i,
                                    title: title,
                                    content: "",
                                    link: link,
                                    isNew: false,
                                };
                                notices.push(notice);
                            }
                        }
                    }
                }
            }

            // Find new notices based on notice number in URL
            let newNotices = [];
            let foundOldNotice = false;

            for (const notice of notices) {
                const noticeNumber = this.extractNoticeNumber(notice.link);
                if (noticeNumber > this.lastNoticeNumber) {
                    notice.isNew = true;
                    newNotices.push(notice);
                } else {
                    break;
                }
            }

            // Update lastNoticeNumber if we found new notices
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
