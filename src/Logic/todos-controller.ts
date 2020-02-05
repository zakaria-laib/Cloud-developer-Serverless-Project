import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoAccessDB } from './todo-Access-model';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { parseUserId } from '../auth/utils';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccessDB();

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);

    return todoAccess.all(userId);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string,
): Promise<TodoItem> {
    const itemId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return todoAccess.create({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    });
}

export async function update(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccess.get(todoId, userId);

    todoAccess.update(todo.todoId, todo.createdAt, updateTodoRequest);
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccess.get(todoId, userId);

    await todoAccess.delete(todo.todoId, todo.userId);
}

export async function setAttachmentUrl(
    todoId: string,
    attachmentUrl: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccess.get(todoId, userId);

    todoAccess.setAttachmentUrl(todo.todoId, todo.userId, attachmentUrl);
}