import axios from "axios";

export const getTrainDetails = async (trainNo) => {
  const url = `https://rappid.in/apis/train.php?train_no=${trainNo}`;

  const response = await axios.get(url);

  return response.data;
};
