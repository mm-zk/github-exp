/// Creates whitelist with users that ever contributed to a given repo.

import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { compactSignatureToHex, concat } from 'viem';


dotenv.config();


const githubToken = process.env.GITHUB_TOKEN; // Replace with your GitHub token

const repoOwner = 'matter-labs'; // Replace with the repository owner's username
const repoName = 'zksync-era'; // Replace with the repository name

interface AuthorData {
    authors: string[];
    lastCommitDate: string;
}

async function fetchCommits(url: string, lastFetchedDate?: string, allCommits: any[] = []): Promise<any[]> {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${githubToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const newCommits = response.data.filter((commit: any) => !lastFetchedDate || new Date(commit.commit.author.date) > new Date(lastFetchedDate));
        const combinedCommits = allCommits.concat(newCommits);

        console.log(`Fetched ${combinedCommits.length} new commits...`);


        const linkHeader = response.headers['link'];
        if (linkHeader && newCommits.length > 0) {
            const nextLink = linkHeader.split(',').find((s: string) => s.includes('rel="next"'));
            if (nextLink) {
                const nextUrl = nextLink.match(/<([^>]+)>/)[1];
                return fetchCommits(nextUrl, lastFetchedDate, combinedCommits);
            }
        }

        return combinedCommits;
    } catch (error) {
        console.error('Error fetching commits:', error);
        return allCommits;
    }
}

async function main(mode: string) {
    const commitsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=main&per_page=100`;
    let lastFetchedDate: string | undefined;
    let existingAuthors: string[] = [];

    if (mode === 'incremental') {
        if (fs.existsSync('authors.json')) {
            const data = JSON.parse(fs.readFileSync('authors.json', 'utf-8')) as AuthorData;
            lastFetchedDate = data.lastCommitDate;
            existingAuthors = data.authors;
        } else {
            console.log('No existing authors.json found, switching to full fetch mode.');
            mode = 'full';
        }
    }

    const commits = await fetchCommits(commitsUrl, mode === 'incremental' ? lastFetchedDate : undefined);
    const authors = commits.map((commit: any) => commit.author?.login).filter(item => item != null);
    const uniqueAuthors = Array.from(new Set(existingAuthors.concat(authors)));
    const latestCommitDate = commits.length > 0 ? commits[0].commit.author.date : lastFetchedDate;

    console.log('Unique commit authors on main:', authors);

    // Update or create the JSON file with new authors and the last commit date
    const authorData: AuthorData = {
        authors: uniqueAuthors,
        lastCommitDate: latestCommitDate || ''
    };

    fs.writeFileSync('authors.json', JSON.stringify(authorData, null, 2), 'utf-8');
    console.log('Updated authors.json with new data.');
}

// Pass 'full' or 'incremental' as an argument when running the script
main(process.argv[2] || 'incremental');