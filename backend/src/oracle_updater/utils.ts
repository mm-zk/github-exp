// Main method here is 'fetchPRStatus'.
import { Octokit } from "@octokit/core";


export interface PRStatus {
    author: string,
    isMergedToMain: boolean,
    reviewStatus: Map<string, ReviewStatus>,
}

enum Event {
    Reviewed = "reviewed",
    ReviewRequested = "review_requested",
}


interface SimplifiedTimelineEntry {
    event: Event,

    // both reviewed and commented.
    login: string,

    timestamp: Date,

    // Only for Reviewed ("dismissed", "commented", "approved")
    state: String,
}


const eventToSimplifiedEvent = (entry: any): SimplifiedTimelineEntry | null => {
    if (entry.event == 'reviewed') {
        return {
            event: Event.Reviewed,
            login: entry.user.login,
            timestamp: new Date(entry.submitted_at),
            state: entry.state
        }
    }
    if (entry.event == 'commented') {
        // We don't care about the comments.
        return null;
    }
    if (entry.event == 'committed') {
        // We don't care about the commmits.
        return null;
    }
    if (entry.event == 'review_dismissed') {
        // We don't care about the dismiss.
        return null;
    }
    if (entry.event == 'renamed') {
        // We don't care about the renames.
        return null;
    }
    if (entry.event == 'review_requested') {
        // We care only if it is a request for a specific reviewer and not the team.
        if (entry.requested_reviewer == null) {
            return null;
        }
        return {
            event: Event.ReviewRequested,
            login: entry.requested_reviewer.login,
            timestamp: new Date(entry.created_at),
            state: ""
        }
    }
    return null;
}

const fetchPRDetailsAndCalculateReviewTime = async (octokit: Octokit, repo: string, prNumber: number) => {
    try {
        const parts = repo.split('/');

        // Fetch PR timeline which includes review requests, comments, reviews, etc.
        const { data: timeline } = await octokit.request('GET /repos/{owner}/{repo}/issues/{pull_number}/timeline', {
            owner: parts[0],
            repo: parts[1],
            pull_number: prNumber,
            mediaType: {
                previews: ["mockingbird"]
            }
        });

        // Calculate review times
        return calculateReviewTimes(timeline);

    } catch (error) {
        console.error('Error fetching PR details:', error);
    }
};

interface ReviewStatus {
    waitingForReviewer: boolean,
    timestamp: Date,
    // Durations are in milliseconds.
    reviewerDuration: number,
    authorDuration: number,
    approved: boolean,
}

const calculateReviewTimes = (timeline: any[]) => {
    const simplifiedEvents = timeline.map(x => eventToSimplifiedEvent(x)).filter((x): x is SimplifiedTimelineEntry => x !== null);

    const reviews: Map<string, ReviewStatus> = new Map();
    simplifiedEvents.forEach(event => {
        if (event.event == Event.ReviewRequested) {
            if (reviews.has(event.login)) {
                const previousEntry = reviews.get(event.login)!;
                if (!previousEntry.waitingForReviewer) {
                    reviews.set(event.login, {
                        waitingForReviewer: true,
                        timestamp: event.timestamp,
                        reviewerDuration: previousEntry.reviewerDuration,
                        // Author has finished their turn.
                        authorDuration: previousEntry.authorDuration + (event.timestamp.getTime() - previousEntry.timestamp.getTime()),
                        approved: previousEntry.approved
                    })
                } else {
                    // We're still waiting for the reviewer...
                }
            } else {
                reviews.set(event.login, {
                    waitingForReviewer: true,
                    timestamp: event.timestamp,
                    reviewerDuration: 0,
                    authorDuration: 0,
                    approved: false,
                })
            }
        } else if (event.event == Event.Reviewed) {
            if (reviews.has(event.login)) {
                const previousEntry = reviews.get(event.login)!;
                if (previousEntry.waitingForReviewer) {
                    reviews.set(event.login, {
                        waitingForReviewer: false,
                        timestamp: event.timestamp,
                        reviewerDuration: previousEntry.reviewerDuration + (event.timestamp.getTime() - previousEntry.timestamp.getTime()),
                        // Author has finished their turn.
                        authorDuration: previousEntry.authorDuration,
                        approved: previousEntry.approved || event.state == "approved"
                    })
                } else {
                    // We're still waiting for the author...
                }
            } else {
                reviews.set(event.login, {
                    // We're waiting for author now.
                    waitingForReviewer: false,
                    timestamp: event.timestamp,
                    reviewerDuration: 0,
                    authorDuration: 0,
                    approved: event.state == "approved"
                })
            }

        }

    })

    return reviews;
};


export const fetchPRStatus = async (octokit: Octokit, repo: string, prNumber: number): Promise<PRStatus> => {

    const parts = repo.split('/');
    // Fetch PR details
    const { data: prData } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: parts[0],
        repo: parts[1],
        pull_number: prNumber
    });

    const reviewStatus = (await fetchPRDetailsAndCalculateReviewTime(octokit, repo, prNumber))!;

    return {
        author: prData.user.login,
        isMergedToMain: (prData.base.ref == "main" || prData.base.ref == "master") && prData.merged_at != null,
        reviewStatus,
    }
}

export interface ReviewTimeEntry {
    reviewer: string;
    reviewerDuration: bigint;
    authorDuration: bigint;
}

export interface PRDetails {
    author: string,
    isMergedToMain: boolean,
    approvals: ReviewTimeEntry[],
}

export const convertPRStatusToPRDetails = (prStatus: PRStatus): PRDetails => {
    const approvers: ReviewTimeEntry[] = [...prStatus.reviewStatus.entries()].sort((a, b) => a[0].localeCompare(b[0])).filter(x => x[1].approved).map(x => {

        return {
            reviewer: x[0],
            reviewerDuration: BigInt(x[1].reviewerDuration),
            authorDuration: BigInt(x[1].authorDuration)
        }
    });

    const prABI: PRDetails = {
        author: prStatus.author,
        isMergedToMain: prStatus.isMergedToMain,
        approvals: approvers
    };

    return prABI;
};

export const fetchPRStatusForOracle = async (octokit: Octokit, repo: string, prNumber: number): Promise<PRDetails> => {
    const prStatus = await fetchPRStatus(octokit, repo, prNumber);
    return convertPRStatusToPRDetails(prStatus);
}