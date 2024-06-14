<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Tasks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        Repository: {{props.repo}}
        <tr v-for="project in projects" :key="project.id">
          <td>{{ project.name }}</td>
          <td>
            <ul>
              <li v-for="task in project.tasks" :key="task.id">
                {{ task.name }}
                <button @click="removeTask(project.id, task.id)">Remove</button>
              </li>
            </ul>
          </td>
          <td>
            <button @click="addTask(project.id)">Add Task</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
// Repo is the github repo.
const props = defineProps(['repo'])


interface Task {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  tasks: Task[];
}


    const fetchProjects = () => {
        return fetch('http://localhost:5000').then(response => response.json()).then(data => {
            console.log(data);
            return data.projects as Project[];
    });
    };

    const addTask = (projectId: number) => {};
    const removeTask = (projectId: number, taskId: number) => {};



    const {result: projects, execute: fetchStuff, inProgress, error: someError} = useAsync(async() => {
        return await fetchProjects();
    }
    );
    fetchStuff();




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
