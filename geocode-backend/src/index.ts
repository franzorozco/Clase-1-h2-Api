import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const GOOGLE_KEY = process.env.GOOGLE_GEOCODING_API_KEY;



interface GoogleGeocodeResp {
  status: string;
  results: {
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }[];
}


app.post('/api/geocode', async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'address required' });
  }

  try {
    const response = await axios.get<GoogleGeocodeResp>(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: { address, key: GOOGLE_KEY },
        timeout: 10000,
      }
    );
    
    return res.json(response.data);
  } catch (error) {
    console.error('Error geocoding:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
