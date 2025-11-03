const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const API_KEY = 'sk_BlWwDqaVnyTJmxF3'; // 🔑 তোমার Short.io API Key

app.use(express.static(__dirname));

app.get('/api/stats', async (req, res) => {
  const { linkId, period, startDate, endDate } = req.query;

  if(!linkId) return res.status(400).json({ error:"Missing linkId" });

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

    // Filter all clickStatistics datasets to human clicks only
    if(data.clickStatistics?.datasets?.length > 0){
      data.clickStatistics.datasets = data.clickStatistics.datasets.map(ds=>{
        if(!ds.data) ds.data = [];
        // keep only human clicks
        ds.data = ds.data.map(item => ({ ...item, value: item.humanValue || item.value }));
        return ds;
      });
    } else {
      data.clickStatistics = { datasets: [{ data: [] }] };
    }

    // Filter countries to human clicks
    if(data.country){
      data.country = data.country.map(c => ({ ...c, score: c.humanScore || c.score }));
    }

    res.json(data);

  } catch(err){
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(port, ()=> console.log(`✅ Server running at http://localhost:${port}`));
