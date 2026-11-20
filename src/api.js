import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
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

  getReportUrl: (resultId) => `/api/reports/${resultId}`,
};
