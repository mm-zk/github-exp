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
