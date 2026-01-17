import { getTrainDetails } from "../services/trainService.js";

export const checkTrain = async (req, res) => {
  try {
    const { trainNo } = req.params;

    if (!trainNo || trainNo.length < 4) {
      return res.status(400).json({ message: "Invalid train number" });
    }

    const data = await getTrainDetails(trainNo);

    if (!data || !data.success) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Extract train number from train_name (e.g., "15657 Brahmputra Mail Running Status" -> "15657")
    const trainNumber = data.train_name.split(' ')[0];
    
    // Extract complete station data from the data array
    const stations = data.data && Array.isArray(data.data) 
      ? data.data.map((station, idx) => ({
          name: station.station_name,
          timing: station.timing,
          halt: station.halt,
          delay: station.delay,
          platform: station.platform,
          distance: station.distance,
          isCurrentStation: station.is_current_station || false,
          isDeparted: idx < (data.data.findIndex(s => s.is_current_station) || 0)
        }))
      : [];

    if (stations.length === 0) {
      return res.status(404).json({ message: "No stations found for train" });
    }

    res.json({
      trainNo: trainNumber,
      trainName: data.train_name,
      stations: stations,
      source: stations[0].name,
      destination: stations[stations.length - 1].name,
      currentStation: stations.find(s => s.isCurrentStation)?.name || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Train API failed" });
  }
};


