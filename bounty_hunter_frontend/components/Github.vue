<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>PR</th>
          <th>Author</th>
          <th>Status</th>
          <th>Bounties</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        Repository: {{props.repo}}
        <tr v-for="pr in pullRequests" :key="pr.id">
          <td>#{{ pr.number }} - {{ pr.title }}</td>
          <td>{{ pr.user.login }}</td>
          <td>{{ pr.state }}, {{ new Date(pr.created_at).toLocaleDateString() }}</td>
          <td><ShowBounty  :repo=props.repo  :prNumber="pr.number"/></td>
          <td><div v-if="pr.state == 'open'"><AddBounty :repo=props.repo  :prNumber=pr.number :reviewers=pr.requested_reviewers /></div></td>
    
        </tr>
      </tbody>
    </table>
  </div>

</template>


<script lang="ts" setup>
import axios from 'axios';

// Repo is the github repo.
const props = defineProps(['repo'])

interface User {
    login: string;
}

interface Reviewer {
    login: string,
    id: number;

};

interface GithubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  user: User;
  requested_reviewers: Reviewer[]
}



const {result: pullRequests, execute, inProgress: loading, error: error} = useAsync(async() => {
      const url = `https://api.github.com/repos/${props.repo}/pulls?state=all`;
      return await axios.get(url)
        .then(response => {
            const parsedResponse = response.data as GithubPR[];
          const prs = parsedResponse.filter(pr => 
            pr.state === 'open' || 
            (pr.state === 'closed' && new Date(pr.closed_at!) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
          );
          return prs;
        }
    )
});

    const addBounty = (prNumber: number) => {};


execute();

</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
