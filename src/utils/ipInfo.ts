import axios from 'axios';

async function ipInfo() {
  const url = "https://freeipapi.com/api/json/";
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
}

const response = await ipInfo();
const timezone =  response?.data?.timeZones[0];
export { timezone };