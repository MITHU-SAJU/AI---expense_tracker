import api from "./api";

export const getExpenses = async (params = {}) => {
    const response = await api.get("/expenses/", { params });
    if (response.data && Array.isArray(response.data.expenses)) {
        return response.data.expenses;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const addExpense = async (expense) => {
    const response = await api.post("/expenses/", expense);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get("/expenses/dashboard/stats");
    return response.data;
};

export const parseTextWithAI = async (text) => {
    const response = await api.post("/ai/parse", { text });
    return response.data;
};

export const getAIChatResponse = async (message) => {
    const response = await api.post("/ai/chat", { message });
    return response.data;
};