import express from 'express';
import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3100;

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const pollInterval = 60000; // Poll every 60 seconds

const checkPRs = async () => {
    try {
        const { owner, repo } = { owner: 'mm-zk', repo: 'github-ci-exp' };
        const response = await octokit.pulls.list({
            owner,
            repo,
            state: 'open'
        });

        response.data.forEach(async (pull) => {
            console.log(`Looking at ${pull.number}`);
            const comments = await octokit.issues.listComments({
                owner,
                repo,
                issue_number: pull.number
            });

            comments.data.forEach(async (comment) => {
                if (comment.body?.includes('ANSWER ME')) {
                    await octokit.issues.createComment({
                        owner,
                        repo,
                        issue_number: pull.number,
                        body: 'Hello'
                    });
                    console.log(`Responded with 'Hello' on PR #${pull.number}`);
                }

                if (comment.body?.includes('PLEASE MERGE')) {
                    await octokit.pulls.merge({
                        owner,
                        repo,
                        pull_number: pull.number
                    });
                    console.log(`Merged PR #${pull.number} based on comment command.`);
                }
            });
        });
    } catch (error) {
        console.error(`Failed to poll PRs: ${error}`);
    }
};

//setInterval(checkPRs, pollInterval);
checkPRs();

//app.listen(port, () => {
//console.log(`Server is running on http://localhost:${port}`);
//});
