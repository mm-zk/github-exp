<template>
  <div>
    <h1>Pull Requests for {{ repo }}</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul>
        <li v-for="pr in pullRequests" :key="pr.id">
          #{{ pr.number }} - {{ pr.title }} by {{ pr.user.login }}
          ({{ pr.state }}, {{ new Date(pr.created_at).toLocaleDateString() }})
        </li>
      </ul>
    </div>
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

execute();

</script>