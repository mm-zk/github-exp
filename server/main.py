from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    data = {
        'projects': [
            {'id': 1, 'name': 'Project 1', 'tasks': [{'id': 101, 'name': 'Task 1'}, {'id': 102, 'name': 'Task 2'}]},
            {'id': 2, 'name': 'Project 2', 'tasks': [{'id': 201, 'name': 'Task 1'}]}
        ]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
