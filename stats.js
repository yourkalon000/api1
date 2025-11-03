const axios = require('axios');

export default async function handler(req, res) {
  const { linkId, period, startDate, endDate } = req.query;

  const API_KEY = 'sk_9n8SWv20cRxrhANf'; // 🔑 backend এ রাখবে

  if (!linkId) return res.status(400).json({ error: "Missing linkId" });

  try {
    const params = {};

    if(startDate && endDate){
      params.period = 'custom';
      params.startDate = startDate;
      params.endDate = endDate;
    } else {
      params.period = period || 'total';
    }

    const response = await axios.get(`https://api-v2.short.io/statistics/link/${linkId}`, {
      params,
      headers: { Authorization: API_KEY, Accept: '*/*' }
    });

    const data = response.data;

    // Human Clicks only
    if(data.clickStatistics?.datasets?.length > 0){
      data.clickStatistics.datasets = data.clickStatistics.datasets.map(ds=>{
        ds.data = ds.data?.map(item => ({ ...item, value: item.humanValue || item.value })) || [];
        return ds;
      });
    } else {
      data.clickStatistics = { datasets: [{ data: [] }] };
    }

    if(data.country){
      data.country = data.country.map(c => ({ ...c, score: c.humanScore || c.score }));
    }

    res.json(data);

  } catch(err){
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
