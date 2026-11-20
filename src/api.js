import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180000,
});

export const api = {
  checkHealth: async () => (await client.get('/api/health')).data,

  predictUltrasound: async (file) => {
    const data = new FormData();
    data.append('file', file);
    return (await client.post('/api/ultrasound/predict', data)).data;
  },

  predictHistopathology: async (files, ultrasoundResultId = null) => {
    const data = new FormData();
    files.forEach((f) => data.append('files', f));
    if (ultrasoundResultId) data.append('ultrasound_result_id', ultrasoundResultId);
    return (await client.post('/api/histopathology/predict', data)).data;
  },

  getReportUrl: (resultId) => `${BASE_URL}/api/reports/${resultId}`,
};
